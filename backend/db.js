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
  
  db.run(`UPDATE Employees SET roleID = 1 WHERE employeeID = 1;`);
  
  db.run(`CREATE TABLE IF NOT EXISTS Materials (
    materialID INTEGER PRIMARY KEY AUTOINCREMENT,
    materialName TEXT,
    materialType INTEGER,
    materialDescription TEXT,
    maxPoints INTEGER,
    materialFile BLOB,
    FOREIGN KEY (materialType) REFERENCES Types(typeID)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Types (
    typeID INTEGER PRIMARY KEY AUTOINCREMENT,
    typeName TEXT,
    typeDescription TEXT,
    typeWeight INTEGER
    Foreign Key (typeID) REFERENCES Materials(materialType)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Grades (
    materialID INTEGER,
    studentID INTEGER,
    PRIMARY KEY (materialID, studentID),
    FOREIGN KEY (materialID) REFERENCES Materials(materialID),
    FOREIGN KEY (studentID) REFERENCES Students(studentID),
    grade INTEGER,
    file BLOB,
    comments TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS MaterialSections (
    materialID INTEGER,
    sectionID INTEGER,
    courseID INTEGER,
    PRIMARY KEY (materialID, sectionID, courseID),
    FOREIGN KEY (materialID) REFERENCES Materials(materialID),
    FOREIGN KEY (sectionID) REFERENCES Sections(sectionID),
    FOREIGN KEY (courseID) REFERENCES Sections(courseID)
  )`);
});

module.exports = db;
