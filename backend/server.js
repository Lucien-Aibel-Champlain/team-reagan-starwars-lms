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

// Fetch Majors
app.get('/majors', (req, res) => {
  db.all('SELECT * FROM Majors', [], (err, rows) => res.json(rows));
});

// Fetch Rooms
app.get('/rooms', (req, res) => {
  db.all('SELECT * FROM Rooms', [], (err, rows) => res.json(rows));
});

app.listen(5000, () => console.log('Backend running on port 5000'));
