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
    ("ADMIN", "ADMINSON", 4, "ADMIN.ADMINSON@school.edu", "password"),
    ("John", "Doe", 1, "John.Doe@school.edu", "AAAAAAAAAAAAB"),
    ("Jane", "Doe", 2, "Jane.Doe@school.edu", "12345"),
    ("Mark", "Smith", 2, "Mark.Smith@school.edu", "123456"),
    ("Bob", "Dings", 3, "Bob.Dings@school.edu", "pizzahut"),
    ("Jan", "Kowalski", 1, "Jan.Kowalski@school.edu", "Namsake")
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
    ("42", 3, "its the meaning of life", 0, "", NULL),
	
	("Crayons Quiz 1", 1, "The first quiz on crayons", 20, "", NULL),
	("Crayons Quiz 2", 1, "The second quiz on crayons", 20, "", NULL),
    ("Crayons Drawing", 2, "A project about drawing with crayons", 50, "", NULL),
    ("Crayons Drawing", 2, "A project about drawing with crayons", 50, "", NULL),
    ("Crayons Exam", 3, "An exam about the best flavor of crayon", 100, "", NULL),
	
	("Dragon Quiz 1", 1, "The first quiz on Dragon types", 20, "", NULL),
	("Dragon Quiz 2", 1, "The second quiz on Dragon types", 20, "", NULL),
    ("Dragon Project", 2, "A project about talking with Dragons", 50, "", NULL),
    ("Dragon Project", 2, "A project about drawing Dragons", 50, "", NULL),
    ("Dragon Exam", 3, "An exam on diffrent dragon types", 100, "", NULL),
	
	("Looking Quiz 1", 1, "The first quiz on types of looking", 20, "", NULL),
	("Looking Quiz 2", 1, "The second quiz on looking types", 20, "", NULL),
    ("Looking Project", 2, "A project about looking at stuff", 50, "", NULL),
    ("Looking Project", 2, "A project about looking at things", 50, "", NULL),
    ("Looking Exam", 3, "Hope you brought your glasses", 100, "", NULL),

	("QDI Quiz 1", 1, "Quiz on transdimensional quantum gravity and its impacts on daily life", 20, "", NULL),
	("QDI Quiz 2", 1, "Quiz on the best 4d duck", 20, "", NULL),
    ("QDI Project", 2, "A project about rotating things inside your mind", 50, "", NULL),
    ("QDI Project", 2, "A project about headaches", 50, "", NULL),
    ("QDI Exam", 3, "Hope you brought your 3d glasses", 100, "", NULL)
  `);
  
  db.run(`INSERT INTO MaterialSections(materialID, sectionID) VALUES
    (2, 4),
    (1, 1),
    (1, 2),
    (3, 3),
	
	(4,4),
	(5,4),
	(6,4),
	(7,4),
	(8,4),
	
	(9,3),
	(10,3),
	(11,3),
	(12,3),
	(13,3),
	
	(14,2),
	(15,2),
	(16,2),
	(17,2),
	(18,2),
	
	(19,1),
	(20,1),
	(21,1),
	(22,1),
	(23,1)
  `);
  
  //There is definately a better way to generate this much junk data, however there is no way to stop me from being so lazy that I will make more work for myself.
  
  db.run(`INSERT INTO Grades(materialID, studentID, grade, file, comments) VALUES
    (2, 1, 5000, NULL, "yay you did it"),
    (2, 2, 4000, NULL, "technically, that was ‘it’s a small world II’"),
	
    ( 9, 1, 15, NULL, "Better luck next time"),
    ( 10, 1, 20, NULL, "Cheated"),
    ( 11, 1, 15, NULL, "Amazing"),
    ( 12, 1, 50, NULL, "Good Work"),
    ( 13, 1, 10, NULL, "mediocre"),
	
    ( 4, 1, 6, NULL, "mediocre"),
    ( 5, 1, 20, NULL, "Amazing"),
    ( 6, 1, 20, NULL, "Good Work"),
    ( 7, 1, 5, NULL, "Try harder"),
    ( 8, 1, 50, NULL, "You used the wrong there"),
	
	( 9,  2, 15, NULL, "Better luck next time"),
    ( 10, 2, 19, NULL, "Amazing"),
    ( 11, 2, 15, NULL, "Better"),
    ( 12, 2, 0, NULL, "Good Cheating"),
    ( 13, 2, 9, NULL, "Amazing"),
	
    ( 4, 2, 6, NULL, "mediocre"),
    ( 5, 2, 14, NULL, "ok..."),
    ( 6, 2, 20, NULL, "Good Work"),
    ( 7, 2, 5, NULL, "Try harder"),
    ( 8, 2, 50, NULL, "Amazing Work"),
	
	( 19, 2, 2, NULL, "good job"),
    ( 20, 2, 0, NULL, "ok..."),
    ( 21, 2, 7, NULL, "I'd give you two A's if I could"),
    ( 22, 2, 5, NULL, "This is the best work you've done yet!"),
    ( 23, 2, 6, NULL, "Amazing Work, thanks for being awesome"),
	
	( 19, 3, 20, NULL, "ok job"),
    ( 20, 3, 20, NULL, "I've seen worse"),
    ( 21, 3, 50, NULL, "I'd give you two F's if I could"),
    ( 22, 3, 50, NULL, "Apple?"),
    ( 23, 3, 100, NULL, "wowza nice job"),
	
	( 9,  3, 2, NULL, "mediocre"),
    ( 10, 3, 2, NULL, "mediocre"),
    ( 11, 3, 2, NULL, "mediocre"),
    ( 12, 3, 2, NULL, "mediocre"),
    ( 13, 3, 2, NULL, "mediocre"),
	
	( 14, 4, 20, NULL, "Very good"),
    ( 15, 4, 20, NULL, "Very good"),
    ( 16, 4, 50, NULL, "Very good"),
    ( 17, 4, 50, NULL, "Very good"),
    ( 18, 4, 100, NULL, "Very good"),
	
	( 19, 5, 20, NULL, "lorem ipsum?"),
    ( 20, 5, 20, NULL, "I've seen better"),
    ( 21, 5, 50, NULL, "The quick brown fox jumps over a lazy dog, and what a lazy dog this dog is."),
    ( 22, 5, 46, NULL, "tomato?"),
    ( 23, 5, 90, NULL, "You cant just say perchance"),
	
	( 9,  5, 15, NULL, "Better luck next time"),
    ( 10, 5, 20, NULL, "Cheated"),
    ( 11, 5, 15, NULL, "Amazing"),
    ( 12, 5, 50, NULL, "Good Work"),
    ( 13, 5, 10, NULL, "mediocre"),
	
    ( 4, 5, 0, NULL, "Absent"),
    ( 5, 5, 0, NULL, "You never showed up"),
    ( 6, 5, 0, NULL, "Hello?"),
    ( 7, 5, 0, NULL, "Where are you?"),
    ( 8, 5, 0, NULL, "I'm not even sure you still go to this school.")
	
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
