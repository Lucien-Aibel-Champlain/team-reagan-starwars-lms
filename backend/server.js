const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// Auth
app.post('/login', (req, res) => {
    console.log('🛠️ LOGIN ATTEMPT RECEIVED');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
	
    const { user, password } = req.body;
	
	db.all("SELECT * FROM Employees", (error, rows) => {
		
		let validLogin = rows.some(row => (user === row.email && password === row.password));
		
		if (validLogin){
			console.log('✅ Login success');
			res.json({ success: true });
		} else {
			console.log('❌ Invalid credentials ');
			res.status(401).json({ success: false });
		}
	});
});

app.post('/getEmployeeDetails', (req, res) => {
  const { email } = req.body;

  // Query the database for the employee's name and role
  db.get(
    'SELECT firstName || " " || lastName AS name, roleName AS role FROM Employees LEFT JOIN Roles ON Employees.roleID = Roles.roleID WHERE email = ?',
    [email],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (!row) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json({ name: row.name, role: row.role });
      }
    }
  );
});

app.get('/sections', (req, res) => {
  db.all('SELECT s.courseID, s.sectionID, s.employeeID, s.roomID, s.startTime, s.endTime, s.weekDays, s.startDate, s.endDate, s.sectionNumber, c.coursePrefix, c.courseNumber, c.courseName, r.buildingName, r.roomNumber, e.firstName, e.lastName FROM Sections AS s LEFT JOIN Courses AS c on s.courseID = c.courseID LEFT JOIN Rooms AS r ON s.roomID = r.roomID LEFT JOIN Employees AS e ON s.employeeID = e.employeeID', [], (err, rows) => res.json(rows));
});

app.get('/majors', (req, res) => {
  db.all('SELECT * FROM Majors', [], (err, rows) => res.json(rows));
});

app.get('/rooms', (req, res) => {
  db.all('SELECT * FROM Rooms', [], (err, rows) => res.json(rows));
});

app.get('/employees', (req, res) => {
  db.all('SELECT * FROM Employees LEFT JOIN Roles ON Employees.roleID = Roles.roleID', [], (err, rows) => res.json(rows));
});

app.get('/roles', (req, res) => {
  db.all('SELECT * FROM Roles', [], (err, rows) => res.json(rows));
});

app.get('/materials', (req, res) => {
  db.all('SELECT materialID, materialName, Materials.typeID, typeName, materialDescription, maxPoints FROM Materials LEFT JOIN Types ON Materials.typeID = Types.typeID', [], (err, rows) => res.json(rows));
});

app.get('/material/file/:id', (req, res) => {
  if (!isNaN(parseInt(req.params.id)))
  {
    db.all('SELECT materialFile FROM Materials WHERE materialID = ' + req.params.id, [], (err, rows) => res.json(rows));
  }
});

app.get('/types', (req, res) => {
  db.all('SELECT * FROM Types', [], (err, rows) => res.json(rows));
});

app.get('/types/section/:id', (req, res) => {
  if (!isNaN(parseInt(req.params.id)))
  {
    db.all('SELECT * FROM Types WHERE sectionID = ' + req.params.id, [], (err, rows) => res.json(rows));
  }
});

app.get('/grades', (req, res) => {
  db.all('SELECT Grades.materialID, Grades.studentID, grade, comments, materialName, maxPoints FROM Grades LEFT JOIN Materials ON Grades.materialID = Materials.materialID  LEFT JOIN Students ON Grades.studentID = Students.studentID', [], (err, rows) => res.json(rows));
});

app.get('/grades/section/:id', (req, res) => {
  if (!isNaN(parseInt(req.params.id)))
  {
    db.all('SELECT Grades.materialID, Grades.studentID, grade, comments, materialName, maxPoints FROM Grades LEFT JOIN Materials ON Grades.materialID = Materials.materialID  LEFT JOIN Students ON Grades.studentID = Students.studentID LEFT JOIN MaterialSections ON Grades.materialID = MaterialSections.materialID WHERE MaterialSections.sectionID = ' + req.params.id, [], (err, rows) => res.json(rows));
  }
});

app.listen(5000, () => console.log('Backend running on port 5000'));
