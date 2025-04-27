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
    'SELECT firstName || " " || lastName AS name, roleName AS role, employeeID, Roles.adminBool AS ab FROM Employees LEFT JOIN Roles ON Employees.roleID = Roles.roleID WHERE email = ?',
    [email],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (!row) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json({ name: row.name, role: row.role, employeeID: row.employeeID, adminBool: row.ab });
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

// --- CRUD for Employees ---

// Create new Employee
app.post('/employees', (req, res) => {
  const { firstName, lastName, roleID, email, password } = req.body;

  if (!firstName || !lastName || !roleID || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO Employees (firstName, lastName, roleID, email, password) 
     VALUES (?, ?, ?, ?, ?)`,
    [firstName, lastName, roleID, email, password],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

// Update existing Employee
app.put('/employees/:id', (req, res) => {
  const { firstName, lastName, roleID, email, password } = req.body;
  const { id } = req.params;

  if (!firstName || !lastName || !roleID || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `UPDATE Employees 
     SET firstName = ?, lastName = ?, roleID = ?, email = ?, password = ?
     WHERE employeeID = ?`,
    [firstName, lastName, roleID, email, password, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Employee not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// Delete Employee
app.delete('/employees/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    `DELETE FROM Employees WHERE employeeID = ?`,
    [id],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Employee not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// CRUD Operations for Courselist (Sections)

// Create a new course/section
app.post('/courselist', (req, res) => {
  const { coursePrefix, courseNumber, courseName, schedule, dates, room, instructor } = req.body;
  db.run(
    `INSERT INTO Sections (coursePrefix, courseNumber, courseName, schedule, dates, roomID, employeeID) 
     VALUES (?, ?, ?, ?, ?, 
       (SELECT roomID FROM Rooms WHERE buildingName || ' ' || roomNumber = ?), 
       (SELECT employeeID FROM Employees WHERE firstName || ' ' || lastName = ?))`,
    [coursePrefix, courseNumber, courseName, schedule, dates, room, instructor],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

// CRUD Operations for Materials

// Create a new material
app.post('/materials', (req, res) => {
  const { materialName, materialDescription, typeID, maxPoints, fileName, sectionID } = req.body;
  db.run(
    `INSERT INTO Materials (materialName, materialDescription, typeID, maxPoints, fileName) 
     VALUES (?, ?, ?, ?, ?)`,
    [materialName, materialDescription, typeID, maxPoints, fileName],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        db.run(`INSERT INTO MaterialSections (materialID, sectionID) VALUES (?, ?)`, [this.lastID, sectionID], (req, res) => {});
        res.json({ id: this.lastID });
      }
    }
  );
});

// Read all materials
app.get('/materials', (req, res) => {
  db.all(
    `SELECT materialID, materialName, materialDescription, Materials.typeID, typeName, maxPoints, fileName 
     FROM Materials 
     LEFT JOIN Types ON Materials.typeID = Types.typeID`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json(rows);
      }
    }
  );
});

// Update an existing material
app.put('/materials/:id', (req, res) => {
  const { materialName, materialDescription, typeID, maxPoints, fileName } = req.body;
  const materialID = req.params.id;

  db.run(
    `UPDATE Materials 
     SET materialName = ?, materialDescription = ?, typeID = ?, maxPoints = ?, fileName = ? 
     WHERE materialID = ?`,
    [materialName, materialDescription, typeID, maxPoints, fileName, materialID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Material not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

app.delete('/materials/section', (req, res) => {
  const { materialID, sectionID } = req.body;
  db.all(`SELECT * FROM MaterialSections WHERE materialID = ?`, [materialID], (err, rows) => {
      if (rows.length < 2) {
        res.status(400).json({error: "Last reference to this material cannot be removed; delete material instead."});
      }
      else {
          db.run(
            `DELETE FROM MaterialSections WHERE materialID = ? AND sectionID = ?`, [materialID, sectionID], function (err) {
                if (err) {
                  res.status(500).json({ error: 'Database error' });
                } else if (this.changes === 0) {
                  res.status(404).json({ error: 'Material not found for deletion' });
                } else {
                  res.json({ changes: this.changes });
                }
            })
        }
    })
});

// Delete a material
app.delete('/materials/:id', (req, res) => {
  const materialID = req.params.id;

  db.run('DELETE FROM Materials WHERE materialID = ?', [materialID], function (err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Material not found' });
    } else {
      res.json({ changes: this.changes });
    }
  })
});

app.post('/materials/section', (req, res) => {
  const { materialID, sectionID } = req.body;
  db.run(
    `INSERT INTO MaterialSections(materialID, sectionID)
    VALUES (?, ?)`, [materialID, sectionID], function(err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

// CRUD Operations for Types

// Create a new type
app.post('/types', (req, res) => {
  const { typeName, typeDescription } = req.body;
  db.run(
    `INSERT INTO Types (typeName, typeDescription) 
     VALUES (?, ?)`,
    [typeName, typeDescription],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

// Read all types
app.get('/types', (req, res) => {
  db.all(
    `SELECT typeID, typeName, typeDescription 
     FROM Types`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json(rows);
      }
    }
  );
});

// Update an existing type
app.put('/types/:id', (req, res) => {
  const { typeName, typeDescription } = req.body;
  const typeID = req.params.id;

  db.run(
    `UPDATE Types 
     SET typeName = ?, typeDescription = ? 
     WHERE typeID = ?`,
    [typeName, typeDescription, typeID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Type not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// Delete a type
app.delete('/types/:id', (req, res) => {
  const typeID = req.params.id;

  db.run('DELETE FROM Types WHERE typeID = ?', [typeID], function (err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Type not found' });
    } else {
      res.json({ changes: this.changes });
    }
  })
});

// CRUD Operations for Grades

// Create a new grade
app.post('/grades', (req, res) => {
  const { grade, comments, studentID, materialID } = req.body;
  db.run(
    `INSERT INTO Grades (grade, comments, studentID, materialID) 
     VALUES (?, ?, ?, ?)`,
    [grade, comments, studentID, materialID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

// Read all grades
app.get('/grades', (req, res) => {
  db.all(
    `SELECT Grades.materialID, Grades.studentID, grade, comments, materialName, maxPoints, 
            Students.firstName, Students.lastName 
     FROM Grades 
     LEFT JOIN Materials ON Grades.materialID = Materials.materialID 
     LEFT JOIN Students ON Grades.studentID = Students.studentID`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json(rows);
      }
    }
  );
});

// Update an existing grade
app.put('/grades/:studentID/:materialID', (req, res) => {
  const { grade, comments } = req.body;
  const { studentID, materialID } = req.params;

  db.run(
    `UPDATE Grades 
     SET grade = ?, comments = ? 
     WHERE studentID = ? AND materialID = ?`,
    [grade, comments, studentID, materialID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Grade not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// Delete a grade
app.delete('/grades/:studentID/:materialID', (req, res) => {
  const { studentID, materialID } = req.params;

  db.run(
    `DELETE FROM Grades 
     WHERE studentID = ? AND materialID = ?`,
    [studentID, materialID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Grade not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// CRUD Operations for Students

// Create a new student
app.post('/students', (req, res) => {
  const { firstName, lastName, email, graduationYear, majorIDs } = req.body;

  db.run(
    `INSERT INTO Students (firstName, lastName, email, graduationYear) 
     VALUES (?, ?, ?, ?)`,
    [firstName, lastName, email, graduationYear],
    function (err) {
      if (err) {
        console.log(err)
        res.status(500).json({ error: 'Database error' });
      } else {
        const studentID = this.lastID;

        // Insert into StudentMajors table for each majorID
        const majorInsertPromises = majorIDs.map((majorID) =>
          new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO StudentMajors (studentID, majorID) VALUES (?, ?)`,
              [studentID, majorID],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          })
        );

        Promise.all(majorInsertPromises)
          .then(() => res.json({ id: studentID }))
          .catch(() => res.status(500).json({ error: 'Database error while inserting majors' }));
      }
    }
  );
});

// Read all students
app.get('/students', (req, res) => {
  db.all(
    `SELECT Students.studentID, firstName, lastName, email, graduationYear 
     FROM Students`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json(rows);
      }
    }
  );
});

// Update an existing student
app.put('/students/:id', (req, res) => {
  const { firstName, lastName, email, graduationYear, majorIDs } = req.body;
  const studentID = req.params.id;

  db.run(
    `UPDATE Students 
     SET firstName = ?, lastName = ?, email = ?, graduationYear = ? 
     WHERE studentID = ?`,
    [firstName, lastName, email, graduationYear, studentID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Student not found' });
      } else {
        // Clear existing majors for the student
        db.run(
          `DELETE FROM StudentMajors WHERE studentID = ?`,
          [studentID],
          (err) => {
            if (err) {
              res.status(500).json({ error: 'Database error while clearing majors' });
            } else {
              // Insert updated majors
              const majorInsertPromises = majorIDs.map((majorID) =>
                new Promise((resolve, reject) => {
                  db.run(
                    `INSERT INTO StudentMajors (studentID, majorID) VALUES (?, ?)`,
                    [studentID, majorID],
                    (err) => {
                      if (err) reject(err);
                      else resolve();
                    }
                  );
                })
              );

              Promise.all(majorInsertPromises)
                .then(() => res.json({ changes: this.changes }))
                .catch(() => res.status(500).json({ error: 'Database error while inserting majors' }));
            }
          }
        );
      }
    }
  );
});

// Delete a student
app.delete('/students/:id', (req, res) => {
  const studentID = req.params.id;

  db.run(
    `DELETE FROM Students WHERE studentID = ?`,
    [studentID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Student not found' });
      } else {
        // Clear associated majors
        db.run(
          `DELETE FROM StudentMajors WHERE studentID = ?`,
          [studentID],
          (err) => {
            if (err) {
              res.status(500).json({ error: 'Database error while clearing majors' });
            } else {
              res.json({ changes: this.changes });
            }
          }
        );
      }
    }
  );
});

// --- CRUD for Roles ---

// Create a new Role
app.post('/roles', (req, res) => {
  const { roleName, adminBool } = req.body;

  if (!roleName || adminBool === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO Roles (roleName, adminBool) 
     VALUES (?, ?)`,
    [roleName, adminBool],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

// Read all Roles
app.get('/roles', (req, res) => {
  db.all(
    `SELECT * FROM Roles`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json(rows);
      }
    }
  );
});

// Update an existing Role
app.put('/roles/:id', (req, res) => {
  const { roleName, adminBool } = req.body;
  const roleID = req.params.id;

  if (!roleName || adminBool === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `UPDATE Roles 
     SET roleName = ?, adminBool = ? 
     WHERE roleID = ?`,
    [roleName, adminBool, roleID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Role not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// Delete a Role
app.delete('/roles/:id', (req, res) => {
  const roleID = req.params.id;

  db.run(
    `DELETE FROM Roles WHERE roleID = ?`,
    [roleID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Role not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// --- CRUD Operations for Courses ---

// Create a new course
app.post('/courses', (req, res) => {
  const { coursePrefix, courseNumber, courseName } = req.body;

  if (!coursePrefix || !courseNumber || !courseName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO Courses (coursePrefix, courseNumber, courseName) 
     VALUES (?, ?, ?)`,
    [coursePrefix, courseNumber, courseName],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

// Read all courses
app.get('/courses', (req, res) => {
  db.all(
    `SELECT courseID, coursePrefix, courseNumber, courseName 
     FROM Courses`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json(rows);
      }
    }
  );
});

// Update an existing course
app.put('/courses/:id', (req, res) => {
  const { coursePrefix, courseNumber, courseName } = req.body;
  const courseID = req.params.id;

  if (!coursePrefix || !courseNumber || !courseName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `UPDATE Courses 
     SET coursePrefix = ?, courseNumber = ?, courseName = ? 
     WHERE courseID = ?`,
    [coursePrefix, courseNumber, courseName, courseID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Course not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// Delete a course
app.delete('/courses/:id', (req, res) => {
  const courseID = req.params.id;

  db.run(
    `DELETE FROM Courses WHERE courseID = ?`,
    [courseID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Course not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// --- CRUD Operations for Sections ---

// Create a new section
app.post('/sections', (req, res) => {
  const { courseID, employeeID, endDate, endTime, roomID, startDate, startTime, weekDays } = req.body;

  if (!courseID || !employeeID || !endDate || !endTime || !roomID || !startDate || !startTime || !weekDays) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.all('SELECT sectionNumber FROM Sections WHERE courseID = ? ORDER BY sectionNumber DESC LIMIT 1', [courseID], (err, rows) => { 
        let sectionNumber = 1
        if (rows.length > 0) { sectionNumber = rows[0].sectionNumber + 1}
        db.run(
        `INSERT INTO Sections (startTime, endTime, weekDays, startDate, endDate, employeeID, roomID, courseID, sectionNumber) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [startTime, endTime, weekDays, startDate, endDate, employeeID, roomID, courseID, sectionNumber],
        function (err) {
          if (err) {
            res.status(500).json({ error: 'Database error' });
          } else {
            res.json({ id: this.lastID });
          }
        }
      );
  });

  
});

// Update an existing section
app.put('/sections/:id', (req, res) => {
  const { courseID, employeeID, endDate, endTime, roomID, startDate, startTime, weekDays } = req.body;
  const sectionID = req.params.id;

  if (!courseID || !employeeID || !endDate || !endTime || !roomID || !sectionID || !startDate || !startTime || !weekDays) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `UPDATE Sections 
     SET courseID = ?, employeeID = ?, endDate = ?, endTime = ?, roomID = ?, startDate = ?, startTime = ?, weekDays = ? 
     WHERE sectionID = ?`,
    [courseID, employeeID, endDate, endTime, roomID, startDate, startTime, weekDays, sectionID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Section not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// Delete a section
app.delete('/sections/:id', (req, res) => {
  const sectionID = req.params.id;

  db.run(
    `DELETE FROM Sections WHERE sectionID = ?`,
    [sectionID],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Section not found' });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

//Handle all get requests

app.get('/sections', (req, res) => {
  db.all('SELECT s.courseID, s.sectionID, s.employeeID, s.roomID, s.startTime, s.endTime, s.weekDays, s.startDate, s.endDate, s.sectionNumber, c.coursePrefix, c.courseNumber, c.courseName, r.buildingName, r.roomNumber, e.firstName, e.lastName FROM Sections AS s LEFT JOIN Courses AS c on s.courseID = c.courseID LEFT JOIN Rooms AS r ON s.roomID = r.roomID LEFT JOIN Employees AS e ON s.employeeID = e.employeeID', [], (err, rows) => res.json(rows));
});

app.get('/sections/employee/:id', (req, res) => {
  if (!isNaN(parseInt(req.params.id)))
  {
    db.all('SELECT s.courseID, s.sectionID, s.employeeID, s.roomID, s.startTime, s.endTime, s.weekDays, s.startDate, s.endDate, s.sectionNumber, c.coursePrefix, c.courseNumber, c.courseName, r.buildingName, r.roomNumber, e.firstName, e.lastName FROM Sections AS s LEFT JOIN Courses AS c on s.courseID = c.courseID LEFT JOIN Rooms AS r ON s.roomID = r.roomID LEFT JOIN Employees AS e ON s.employeeID = e.employeeID WHERE s.employeeID = ' + req.params.id, [], (err, rows) => res.json(rows));
  }
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
    db.all('SELECT majorName, StudentMajors.majorID FROM Students LEFT JOIN StudentMajors ON Students.studentID = StudentMajors.studentID LEFT JOIN Majors ON StudentMajors.majorID = Majors.majorID WHERE Students.studentID = ' + req.params.id, [], (err, rows) => res.json(rows));
  }
});

app.get('/courses', (req, res) => {
  db.all(
    `SELECT courseID, coursePrefix, courseNumber, courseName 
     FROM Courses`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json(rows);
      }
    }
  );
});
  
app.delete('/enrollments', (req, res) => {
    const { studentID, sectionID } = req.body;
    db.run('DELETE FROM StudentSections WHERE StudentID = ? AND SectionID = ?', [studentID, sectionID], function (err) {
        if (err) res.status(500).json({ error: 'Database error' });
        else res.json({ changes: this.changes });
    });
});

app.post('/enrollments', (req, res) => {
    const { studentID, sectionID } = req.body;
    db.all('SELECT * FROM StudentSections LEFT JOIN Sections ON StudentSections.SectionID = Sections.SectionID WHERE StudentSections.StudentID = ? AND Sections.CourseID = (SELECT CourseID FROM Sections WHERE SectionID = ?);', [studentID, sectionID], (err, rows) => {
        if (!err) {
            if (rows.length == 0) {
                db.run('INSERT INTO StudentSections(StudentID, SectionID) VALUES (?, ?)', [studentID, sectionID], function (err) {
                    if (err) res.status(500).json({ error: 'Database error' });
                    else res.json({ changes: this.changes });
                });
            }
            else {
                res.status(409).json({error: 'Already registered for another section'})
            }
        }
        else { res.status(500).json({ error: 'Database error' })}
    })
});

app.listen(5000, () => console.log('Backend running on port 5000'));
