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
    typeWeight INTEGER,
    Foreign Key (typeID) REFERENCES Materials(materialType)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Grades (
    materialID INTEGER,
    studentID INTEGER,
    grade INTEGER,
    file BLOB,
    comments TEXT,
    PRIMARY KEY (materialID, studentID),
    FOREIGN KEY (materialID) REFERENCES Materials(materialID),
    FOREIGN KEY (studentID) REFERENCES Students(studentID)
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
  
  db.run(`CREATE TABLE IF NOT EXISTS Students (
    email TEXT,
    firstName TEXT,
    lastName TEXT,
    graduationYear INTEGER,
    majorID INTEGER,
    studentID INTEGER PRIMARY KEY AUTOINCREMENT,
    FOREIGN KEY (majorID) REFERENCES Majors(majorID)  
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS Courses (
    coursePrefix TEXT,
    courseNumber INTEGER,
    courseName Text,
    courseID INTEGER PRIMARY KEY AUTOINCREMENT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Sections(
    startTime TEXT, -- how do we plan to store dates 
    endTime TEXT,
    weekDays TEXT,
    startDate TEXT,
    endDate TEXT,
    employeeID INTEGER,
    roomID INTEGER,
    sectionID INTEGER PRIMARY KEY AUTOINCREMENT, -- do we want this to be a composite?
    FOREIGN KEY (employeeID) REFERENCES Employees(employeeID),
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS StudentSections(
    studentID INTEGER,
    sectionID INTEGER,
    FOREIGN KEY (studentID) REFERENCES Students(studentID),
    FOREIGN KEY (sectionID) REFERENCES Sections(sectionID),
    PRIMARY KEY (sectionID, StudentID)
  )`);

});

module.exports = db;
