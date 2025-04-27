const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

const fs = require('node:fs');

let data = fs.readFileSync('crucolo.jpg')

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
    adminBool INTEGER DEFAULT 0 CHECK(adminBool == 0 OR adminBool == 1)
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

  db.run(`CREATE TABLE IF NOT EXISTS Types (
    typeID INTEGER PRIMARY KEY AUTOINCREMENT,
    typeName TEXT,
    typeDescription TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Materials (
    materialID INTEGER PRIMARY KEY AUTOINCREMENT,
    materialName TEXT,
    typeID INTEGER,
    materialDescription TEXT,
    maxPoints INTEGER,
    fileName TEXT,
    materialFile BLOB,
    FOREIGN KEY (typeID) REFERENCES Types(typeID)
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
    PRIMARY KEY (materialID, sectionID),
    FOREIGN KEY (materialID) REFERENCES Materials(materialID),
    FOREIGN KEY (sectionID) REFERENCES Sections(sectionID)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS Students (
    email TEXT,
    firstName TEXT,
    lastName TEXT,
    graduationYear INTEGER,
    studentID INTEGER PRIMARY KEY AUTOINCREMENT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS StudentMajors (
    studentID INTEGER,
    majorID INTEGER,
    FOREIGN KEY (studentID) REFERENCES Students(studentID),
    FOREIGN KEY (majorID) REFERENCES Sections(majorID),
    PRIMARY KEY (majorID, studentID)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS Courses (
    coursePrefix TEXT,
    courseNumber INTEGER,
    courseName Text,
    courseID INTEGER PRIMARY KEY AUTOINCREMENT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Sections(
    startTime TEXT CHECK(time(startTime) IS startTime),
    endTime TEXT CHECK(time(endTime) IS endTime),
    weekDays TEXT,
    startDate TEXT CHECK(date(startDate) IS startDate),
    endDate TEXT CHECK(date(endDate) IS endDate),
    employeeID INTEGER,
    roomID INTEGER,
    courseID INTEGER,
    sectionNumber INTEGER,
    sectionID INTEGER PRIMARY KEY AUTOINCREMENT,
    FOREIGN KEY (courseID) REFERENCES Employees(courseID),
    FOREIGN KEY (employeeID) REFERENCES Employees(employeeID),
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS StudentSections(
    studentID INTEGER,
    sectionID INTEGER,
    FOREIGN KEY (studentID) REFERENCES Students(studentID),
    FOREIGN KEY (sectionID) REFERENCES Sections(sectionID),
    PRIMARY KEY (sectionID, studentID)
  )`);
  /*
  db.run(`INSERT INTO Majors(majorName) VALUES
    ("Cheesemongering"),
    ("Cool Hats"),
    ("Berger"),
    ("Underwater Basket Weaving")
  `);
  
  db.run(`INSERT INTO Students(email, firstName, lastName, graduationYear) VALUES
    ("caleb.lonkulous@mymail.champlain.edu", "Caleb", "Lonkulous The Fatabulous", 2097),
    ("lucien.stupid@mymail.champlain.edu", "Lucien", "the Stupidulous", 2096),
    ("griffin.goochbreault@mymail.champlain.edu", "Griffin", "Gooch-Breault", 2027),
    ("coda.goochbreault@mymail.champlain.edu", "Coda", "Gooch-Breault", 2100),
    ("zora.goochbreault@mymail.champlain.edu", "Zora", "Gooch-Breault", 2031)
  `);
  
  db.run(`INSERT INTO StudentMajors(studentID, majorID) VALUES
    (1,1),
    (2,1),
    (3,1),
    (3,2),
    (4,2),
    (5,4)
  `);
  
  db.run(`INSERT INTO Courses(coursePrefix, courseNumber, courseName) VALUES
    ("CSI",280,"Quasi-dimensional Programming"),
    ("ART", 140, "Staring at stuff really hard"),
    ("COR", 301, "Dragon Appreciation"),
    ("BIZ", 102, "Intro to Crayons")
  `);
  
  db.run(`INSERT INTO Rooms(buildingName, roomNumber) VALUES
    ("under a bridge", 0),
    ("Lake Champlain", 1014),
    ("mars", 5)
  `);
  
  db.run(`INSERT INTO Roles(roleName, adminBool) VALUES
    ("Teacher", 0),
    ("Janitor", 0),
    ("CEO", 0),
    ("Old Lady who Actually Knows How Everything Works", 1)
  `);
  
  db.run(`INSERT INTO Employees(firstName, lastName, roleID, email, password) VALUES
    ("ADMIN", "ADMINSON", 4, "ADMIN.ADMINSON@mymail.champlain.edu", "password"),
    ("charlie", "chaplin", 1, "killme@hotmail.com", "AAAAAAAAAAAAB"),
    ("John", "Doe", 2, "J.DOE@mymail.champlain.edu", "12345"),
    ("Jane", "Doe", 2, "J.DOE2@mymail.champlain.edu", "123456"),
    ("Ur", "Mother", 3, "Sm3ll1eSausage@yahoo.net", "pizzahut"),
    ("Jack", "Black", 1, "schoolOfRock@google.com", "Geet@r")
  `);

  db.run(`INSERT INTO Sections(sectionNumber, startTime, endTime, weekDays, startDate, endDate, employeeID, roomID, courseID) VALUES
    (1,"11:00:00", "13:00:00", "MTh", "2025-01-01", "2025-05-01", 1, 1, 1),
    (1,"13:00:00", "15:00:00", "MTh", "2025-01-01", "2025-05-01", 2, 3, 2),
    (1,"15:00:00", "17:00:00", "TF", "2025-01-01", "2025-05-01", 3, 3, 3),
    (1,"17:00:00", "19:00:00", "TF", "2025-01-01", "2025-05-01", 5, 2, 4)
  `);
  
  db.run(`INSERT INTO Types(typeName, typeDescription) VALUES
    ("Quizzes", "a short, informal test"),
    ("Projects", "must inflict some level of suffering"),
    ("Final Exam", "Well, this is the part where he kills us."),
    ("Contest", "a test of valor with a binary winner between students")
  `);
  
  db.run(`INSERT INTO Materials(materialName, typeID, materialDescription, maxPoints, fileName, materialFile) VALUES
    ("cultOfVikas", 1, "A photo of nerds in joyce 201 slaving away to pass a class", 2, "cheese.jpg", X'` + data.toString("hex")  + `'),
    ("its a small world", 1, "its a ride in disneyland", 5000, "", NULL),
    ("42", 3, "its the meaning of life", 0, "", NULL)
  `);
  
  db.run(`INSERT INTO MaterialSections(materialID, sectionID) VALUES
    (2, 4),
    (1, 1),
    (1, 2),
    (3, 3)
  `);
  
  db.run(`INSERT INTO Grades(materialID, studentID, grade, file, comments) VALUES
    (2, 1, 5000, NULL, "yay you did it"),
    (2, 2, 4000, NULL, "technically, that was ‘it’s a small world II’"),
    (3, 3,0, NULL, "I don’t like you")
  `);
  
  db.run(`INSERT INTO StudentSections(studentID, sectionID) VALUES
    (1, 3),
    (1, 4),
    (2, 1),
    (2, 3),
    (2, 4),
    (3, 1),
    (3, 3),
    (4, 2),
    (5, 1),
    (5, 3),
    (5, 4)
  `);*/
});

module.exports = db;
