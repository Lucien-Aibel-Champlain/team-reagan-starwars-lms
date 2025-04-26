const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// Auth
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.all("SELECT * FROM Employees", (error, rows) => {
        let validLogin = rows.some(row => (email === row.email && password === row.password));
        if (validLogin) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false });
        }
    });
});

app.post('/getEmployeeDetails', (req, res) => {
  const { email } = req.body;
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

// CRUD Operations for Majors
app.post('/majors', (req, res) => {
    const { majorName } = req.body;
    db.run('INSERT INTO Majors (majorName) VALUES (?)', [majorName], function (err) {
        if (err) res.status(500).json({ error: 'Database error' });
        else res.json({ id: this.lastID });
    });
});

app.put('/majors/:id', (req, res) => {
  const { majorName } = req.body;
  const majorID = req.params.id;

  if (!majorID || !majorName) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  db.run(
    'UPDATE Majors SET majorName = ? WHERE majorID = ?',
    [majorName, majorID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Major not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

app.delete('/majors/:id', (req, res) => {
    db.run('DELETE FROM Majors WHERE majorID = ?', [req.params.id], function (err) {
        if (err) res.status(500).json({ error: 'Database error' });
        else res.json({ changes: this.changes });
    });
});

// CRUD Operations for Rooms
app.post('/rooms', (req, res) => {
  const { buildingName, roomNumber } = req.body;
  db.run('INSERT INTO Rooms (buildingName, roomNumber) VALUES (?, ?)', [buildingName, roomNumber], function (err) {
    if (err) res.status(500).json({ error: 'Database error' });
    else res.json({ id: this.lastID });
  });
});

app.put('/rooms/:id', (req, res) => {
  const { buildingName, roomNumber } = req.body;
  db.run(
    'UPDATE Rooms SET buildingName = ?, roomNumber = ? WHERE roomID = ?',
    [buildingName, roomNumber, req.params.id],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else res.json({ changes: this.changes });
    }
  );
});

app.delete('/rooms/:id', (req, res) => {
  db.run('DELETE FROM Rooms WHERE roomID = ?', [req.params.id], function (err) {
    if (err) res.status(500).json({ error: 'Database error' });
    else res.json({ changes: this.changes });
  });
});

//Handle all get requests

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

app.get('/materials/section/:id', (req, res) => {
  if (!isNaN(parseInt(req.params.id)))
  {
    db.all('SELECT Materials.materialID, materialName, fileName, Materials.typeID, typeName, materialDescription, maxPoints FROM Materials LEFT JOIN Types ON Materials.typeID = Types.typeID LEFT JOIN MaterialSections ON Materials.materialID = MaterialSections.materialID LEFT JOIN Sections ON MaterialSections.sectionID = Sections.sectionID WHERE Sections.sectionID = ' + req.params.id, [], (err, rows) => res.json(rows));
  }
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

app.get('/grades/material/:id', (req, res) => {
  if (!isNaN(parseInt(req.params.id)))
  {
    db.all('SELECT Grades.materialID, Grades.studentID, grade, comments, materialName, maxPoints, Students.firstName, Students.lastName FROM Grades LEFT JOIN Materials ON Grades.materialID = Materials.materialID  LEFT JOIN Students ON Grades.studentID = Students.studentID WHERE Materials.materialID = ' + req.params.id, [], (err, rows) => res.json(rows));
  }
});

app.get('/students', (req, res) => {
  db.all('SELECT Students.studentID, firstName, lastName, email, graduationYear FROM Students', [], (err, rows) => res.json(rows));
});

app.get('/students/section/:id', (req, res) => {
  if (!isNaN(parseInt(req.params.id)))
  {
    db.all('SELECT Students.studentID, firstName, lastName, email, graduationYear FROM Students LEFT JOIN StudentSections ON Students.studentID = StudentSections.studentID WHERE StudentSections.sectionID = ' + req.params.id, [], (err, rows) => res.json(rows));
  }
});

app.get('/students/majors/:id', (req, res) => {
  if (!isNaN(parseInt(req.params.id)))
  {
    db.all('SELECT majorName FROM Students LEFT JOIN StudentMajors ON Students.studentID = StudentMajors.studentID LEFT JOIN Majors ON StudentMajors.majorID = Majors.majorID WHERE Students.studentID = ' + req.params.id, [], (err, rows) => res.json(rows));
  }
});

app.listen(5000, () => console.log('Backend running on port 5000'));
