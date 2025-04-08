const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

// Create tables if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Majors (
    majorID INTEGER PRIMARY KEY AUTOINCREMENT,
    majorName TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Rooms (
    roomID INTEGER PRIMARY KEY AUTOINCREMENT,
    buildingName TEXT,
    roomNumber INTEGER
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS Roles (
    roleID INTEGER PRIMARY KEY AUTOINCREMENT,
    roleName TEXT,
    admin INTEGER DEFAULT 0 CHECK(admin == 0 OR admin == 1)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS Employees (
    employeeID INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    roleID INTEGER,
    email TEXT,
    password TEXT,
    FOREIGN KEY (roleID) REFERENCES Roles(roleID)
  )`);
  
  db.run(`UPDATE Employees SET roleID = 1 WHERE employeeID = 1;
  )`);
});

module.exports = db;
