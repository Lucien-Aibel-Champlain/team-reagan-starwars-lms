import { useEffect, useState, Button } from 'react';
import Form from './Form';

export default function Dashboard({ user }) {
  //variables for storing all table data
  //useState means that React will automatically rerender parts of the page they're used in when they update, as long as they're updated with the function returned as the second paramter of useState
  const [sections, setSections] = useState([]); // Tracks the sections data
  const [majors, setMajors] = useState([]);
  const [studentMajors, setStudentMajors] = useState({});
  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [types, setTypes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [editRoleRow, setEditRoleRow] = useState(null); // Tracks the row being edited for Roles
  const [newRoleRow, setNewRoleRow] = useState({
    roleName: '',
    adminBool: 0, // 0 for no, 1 for yes
  });
  const [courses, setCourses] = useState([]); // Tracks the courses data

  const [studentsInSection, setStudentsInSection] = useState([]);
  
  //vars for which column is currently selected
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  const [selectedSection, setSelectedSection] = useState(0);
  
  //styling for rows that are selected vs not
  const selectedRow = {
    backgroundColor: "white"
  }
  const defaultRow = {
    backgroundColor: "grey"
  }

  //fetch general data (doesn't vary based on which section/material is selected)
  const fetchData = () => {
    fetch('http://localhost:5000/majors')
      .then(res => res.json()) 
      .then(setMajors);
    fetch('http://localhost:5000/rooms')
      .then(res => res.json())
      .then(setRooms);
    fetch('http://localhost:5000/courses') // Fetch courses data
      .then(res => res.json())
      .then(setCourses);
    if (user.adminBool) {
        fetch('http://localhost:5000/sections')
          .then(res => res.json())
          .then(setSections)
    }  
    else {
      fetch('http://localhost:5000/sections/employee/' + user.employeeID)
	    .then(res => res.json())
	    .then(setSections);
	}
    fetch('http://localhost:5000/employees')
      .then(res => res.json())
      .then(setEmployees);
    fetch('http://localhost:5000/roles')
      .then(res => res.json())
      .then(setRoles);
	  fetch('http://localhost:5000/types')
      .then(res => res.json())
      .then(setTypes);
    fetch('http://localhost:5000/students')
      .then(res => res.json())
      .then(setStudents);
    fetchSectionData();
    fetchMaterialData();
  };
  
  const fetchSectionData = () => {
    if (selectedSection != 0) {
      fetch('http://localhost:5000/students/section/' + selectedSection)
        .then(res => res.json())
        .then(setStudentsInSection);
      fetch('http://localhost:5000/materials/section/' + selectedSection)
        .then(res => res.json())
        .then(setMaterials);
    }
  };
  
  const fetchMaterialData = () => {
      if (selectedMaterial != 0) {
          fetch('http://localhost:5000/grades/material/' + selectedMaterial)
            .then(res => res.json())
            .then(setGrades);
      }
  };
  
  //fetch each student's major(s) with a seperate request. made as seperate requests to join all the student's majors into one array (turned into a string when displayed)
  const fetchMajors = () => {
    let promiseArray = [];
    for (let student of students) {
      promiseArray.push(fetch('http://localhost:5000/students/majors/' + student.studentID)
        .then(res => res.json())
        .then(res => [student.studentID, res])
        );
    }
    Promise.all(promiseArray).then(results => { let newDict = {}; for (let element of results) {
            newDict[element[0]] = element[1]
        };
        setStudentMajors(newDict);
        })
  };

  //download the file at link with name
  const downloadFile = (link, name) => {
    //helper function to do file processing
    const processFile = (res) => {
        if (res[0].materialFile != null) {
            let myBlob = new Blob([new Uint8Array(res[0].materialFile.data)])
            let blobUrl = (URL.createObjectURL(myBlob))
            let link = document.createElement("a")
            link.href = blobUrl
            link.download = name
            link.click()
            link.remove()
        }
    }
  
    //actually go fetch the file
    fetch(link)
        .then(res => res.json())
        .then(res => processFile(res));
  }
  
  //unpack the majors of a given student into a string
  const stringMajors = (studentID) => {
    //if this student doesn't exist, we're done
    if (studentMajors[studentID] == undefined) {
        return ""
    }
    //otherwise, stringify their major list
    let out = ""
    for (let x of studentMajors[studentID]) {
        out += ", " + x.majorName
    }
    return out.slice(2) //sliced to remove the ", " from the first entry
  }
  
  //calculate what percent points represents of maxPoints
  const gradePercent = (points, maxPoints) => {
    //this is why this is a seperate function: handling this divide by zero error
    if (maxPoints == 0) {
        return 100
    }
    else {
        return (points / maxPoints) * 100
    }
  }
  
  //check the propertyName of every element of fullList to see if value is in it
  const propertyExists = (value, propertyName, fullList) => {
    let i = 0
    for (let x of fullList) {
        if (x[propertyName] == value) { return i }
        i++
    }
    return undefined
  }
  
  //select the first value in fullList if nothing valid is selected
  const defaultSelection = (currentValue, mutator, propertyName, fullList) => {
    if (fullList.length > 0) {
        if (!propertyExists(currentValue, propertyName, fullList)) {
            mutator(fullList[0][propertyName])
        }
    }
    else {
        mutator(0)
    }
  }

  //fetch initial data only when starting (remove the [] to do on every render, or add a variable to do so when that variable changes)
  useEffect(() => {
    fetchData();
  }, []);

  //when sections or materials change, select one if possible
  useEffect(() => {
    defaultSelection(selectedSection, setSelectedSection, "sectionID", sections)
  }, [sections]);
  
  useEffect(() => {
    defaultSelection(selectedMaterial, setSelectedMaterial, "materialID", materials)
  }, [materials]);
  
  //when selection changes on either category, fetch the relevant data
  useEffect(() => {
    fetchSectionData();
  }, [selectedSection]);
  
  useEffect(() => {
    fetchMaterialData();
  }, [selectedMaterial]);
  
  //whenever the students are fetched/changed, fetch their majors
  useEffect(() => {
    fetchMajors();
  }, [students]);

  const [editRow, setEditRow] = useState(null); // Tracks the row being edited
  const [newRow, setNewRow] = useState({ majorName: '' }); // Tracks the new row data

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      fetch(`http://localhost:5000/majors/${id}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then(() => fetchData()); // Refresh the table
    }
  };

  // Handle submit (insert or update)
  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to submit this row?')) {
      const method = editRow ? 'PUT' : 'POST';
      const url = editRow
        ? `http://localhost:5000/majors/${editRow.majorID}`
        : 'http://localhost:5000/majors';

      const payload = editRow
        ? { ...newRow, majorID: editRow.majorID } // Include majorID for updates
        : newRow;

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setEditRow(null); // Clear edit state
          setNewRow({ majorName: '' }); // Clear input fields
          fetchData(); // Refresh the table
        })
        .catch((err) => console.error('Error:', err));
    }
  };

  // Handle edit
  const handleEdit = (row) => {
    setEditRow(row); // Set the row being edited
    setNewRow({ majorName: row.majorName, majorID: row.majorID }); // Include majorID
  };

  const [editRoomRow, setEditRoomRow] = useState(null); // Tracks the row being edited for Rooms
  const [newRoomRow, setNewRoomRow] = useState({ buildingName: '', roomNumber: '' }); // Tracks the new row data for Rooms

  // Handle delete for Rooms
  const handleRoomDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      fetch(`http://localhost:5000/rooms/${id}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then(() => fetchData()); // Refresh the table
    }
  };

  // Handle submit (insert or update) for Rooms
  const handleRoomSubmit = () => {
    if (window.confirm('Are you sure you want to submit this room?')) {
      const method = editRoomRow ? 'PUT' : 'POST';
      const url = editRoomRow
        ? `http://localhost:5000/rooms/${editRoomRow.roomID}`
        : 'http://localhost:5000/rooms';

      const payload = editRoomRow
        ? { ...newRoomRow, roomID: editRoomRow.roomID } // Include roomID for updates
        : newRoomRow;

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setEditRoomRow(null); // Clear edit state
          setNewRoomRow({ buildingName: '', roomNumber: '' }); // Clear input fields
          fetchData(); // Refresh the table
        })
        .catch((err) => console.error('Error:', err));
    }
  };

  // Handle edit for Rooms
  const handleRoomEdit = (row) => {
    setEditRoomRow(row); // Set the row being edited
    setNewRoomRow({ buildingName: row.buildingName, roomNumber: row.roomNumber, roomID: row.roomID }); // Include roomID
  };

  const [editCourseRow, setEditCourseRow] = useState(null); // Tracks the row being edited
  const [newCourseRow, setNewCourseRow] = useState({
    coursePrefix: '',
    courseNumber: '',
    courseName: '',
  }); // Tracks the new row data

  // Handle Edit
  const handleCourseEdit = (row) => {
    setEditCourseRow(row); // Set the row being edited
    setNewCourseRow({
      coursePrefix: row.coursePrefix,
      courseNumber: row.courseNumber,
      courseName: row.courseName,
    }); // Populate input fields with existing data
  };

  // Handle Delete
  const handleCourseDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      fetch(`http://localhost:5000/courses/${id}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then(() => fetchData());
    }
  };

  // Handle Submit (Insert or Update)
  const handleCourseSubmit = () => {
    if (window.confirm('Are you sure you want to submit this course?')) {
      const method = editCourseRow ? 'PUT' : 'POST';
      const url = editCourseRow
        ? `http://localhost:5000/courses/${editCourseRow.courseID}`
        : 'http://localhost:5000/courses';

      const payload = editCourseRow
        ? { ...newCourseRow, courseID: editCourseRow.courseID }
        : newCourseRow;

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setEditCourseRow(null);
          setNewCourseRow({
            coursePrefix: '',
            courseNumber: '',
            courseName: '',
          });
          fetchData();
        });
    }
  };

  const [editMaterialRow, setEditMaterialRow] = useState(null); // Tracks the row being edited for Materials
  const [newMaterialRow, setNewMaterialRow] = useState({
    materialName: '',
    materialDescription: '',
    typeID: '',
    maxPoints: '',
    fileName: '',
  });

  // Handle Edit for Materials
  const handleMaterialEdit = (row) => {
    setEditMaterialRow(row);
    setNewMaterialRow({
      materialName: row.materialName,
      materialDescription: row.materialDescription,
      typeID: row.typeID,
      maxPoints: row.maxPoints,
      fileName: row.fileName,
    });
  };

  // Handle Delete for Materials
  const handleMaterialDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this material? This will remove ALL references to it.')) {
      fetch(`http://localhost:5000/materials/${id}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then(() => fetchData()); // Refresh the table
    }
  };

  // Handle Submit (Insert or Update) for Materials
  const handleMaterialSubmit = () => {
    if (window.confirm('Are you sure you want to submit this material?')) {
      const method = editMaterialRow ? 'PUT' : 'POST';
      const url = editMaterialRow
        ? `http://localhost:5000/materials/${editMaterialRow.materialID}`
        : 'http://localhost:5000/materials';

      const payload = editMaterialRow
        ? { ...newMaterialRow, materialID: editMaterialRow.materialID, sectionID: selectedSection }
        : {...newMaterialRow, sectionID: selectedSection};

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setEditMaterialRow(null); // Clear edit state
          setNewMaterialRow({
            materialName: '',
            materialDescription: '',
            typeID: '',
            maxPoints: '',
            fileName: '',
          }); // Clear input fields
          fetchData(); // Refresh the table
        });
    }
  };

  const [editTypeRow, setEditTypeRow] = useState(null); // Tracks the row being edited for Types
  const [newTypeRow, setNewTypeRow] = useState({
    typeName: '',
    typeDescription: '',
  });

  // Handle Edit for Types
  const handleTypeEdit = (row) => {
    setEditTypeRow(row);
    setNewTypeRow({
      typeName: row.typeName,
      typeDescription: row.typeDescription,
    });
  };

  // Handle Delete for Types
  const handleTypeDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this type?')) {
      fetch(`http://localhost:5000/types/${id}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then(() => fetchData()); // Refresh the table
    }
  };

  // Handle Submit (Insert or Update) for Types
  const handleTypeSubmit = () => {
    if (window.confirm('Are you sure you want to submit this type?')) {
      const method = editTypeRow ? 'PUT' : 'POST';
      const url = editTypeRow
        ? `http://localhost:5000/types/${editTypeRow.typeID}`
        : 'http://localhost:5000/types';

      const payload = editTypeRow
        ? { ...newTypeRow, typeID: editTypeRow.typeID }
        : newTypeRow;

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setEditTypeRow(null); // Clear edit state
          setNewTypeRow({
            typeName: '',
            typeDescription: '',
          }); // Clear input fields
          fetchData(); // Refresh the table
        });
    }
  };

  const [editGradeRow, setEditGradeRow] = useState(null); // Tracks the row being edited for Grades
  const [newGradeRow, setNewGradeRow] = useState({
    grade: '',
    comments: '',
    studentID: ''
  });

  // Handle Edit for Grades
  const handleGradeEdit = (row) => {
    setEditGradeRow(row);
    setNewGradeRow({
      grade: row.grade,
      comments: row.comments,
      studentID: row.studentID
    });
  };

  // Handle Delete for Grades
  const handleGradeDelete = (studentID, materialID) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      fetch(`http://localhost:5000/grades/${studentID}/${materialID}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then(() => fetchData()); // Refresh the table
    }
  };

  // Handle Submit (Insert or Update) for Grades
  const handleGradeSubmit = () => {
    if (window.confirm('Are you sure you want to submit this grade?')) {
      const method = editGradeRow ? 'PUT' : 'POST';
      const url = editGradeRow
        ? `http://localhost:5000/grades/${editGradeRow.studentID}/${editGradeRow.materialID}`
        : 'http://localhost:5000/grades';

      const payload = editGradeRow
        ? { ...newGradeRow, studentID: editGradeRow.studentID, materialID: selectedMaterial }
        : {...newGradeRow, studentID: newGradeRow.studentID, materialID: selectedMaterial };

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setEditGradeRow(null); // Clear edit state
          setNewGradeRow({
            grade: '',
            comments: '',
            studentID: ''
          }); // Clear input fields
          fetchData(); // Refresh the table
        });
    }
  };

  const [editStudentRow, setEditStudentRow] = useState(null); // Tracks the row being edited for Students
  const [newStudentRow, setNewStudentRow] = useState({
    firstName: '',
    lastName: '',
    email: '',
    graduationYear: '',
    majorIDs: [],
  });

  // Handle Edit for Students
  const handleStudentEdit = (row) => {
    setEditStudentRow(row);
    setNewStudentRow({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      graduationYear: row.graduationYear,
      majorIDs: studentMajors[row.studentID].map((major) => major.majorID), // Extract major IDs
    });
  };

  // Handle Delete for Students
  const handleStudentDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      fetch(`http://localhost:5000/students/${id}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then(() => fetchData()); // Refresh the table
    }
  };

  // Handle Submit (Insert or Update) for Students
  const handleStudentSubmit = () => {
    if (window.confirm('Are you sure you want to submit this student?')) {
      const method = editStudentRow ? 'PUT' : 'POST';
      const url = editStudentRow
        ? `http://localhost:5000/students/${editStudentRow.studentID}`
        : 'http://localhost:5000/students';

      const payload = {
        ...newStudentRow,
        majorIDs: newStudentRow.majorIDs, // Include major IDs
      };

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setEditStudentRow(null); // Clear edit state
          setNewStudentRow({
            firstName: '',
            lastName: '',
            email: '',
            graduationYear: '',
            majorIDs: [],
          }); // Clear input fields
          fetchData(); // Refresh the table
        });
    }
  };
  
  const enrollStudent = (studentID, sectionID) => {
      const payload = {
        studentID: studentID, sectionID: sectionID
      };
      
      const method = (propertyExists(studentID, "studentID", studentsInSection) != undefined) ? "DELETE" : "POST"

      fetch("http://localhost:5000/enrollments/", {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => {if (res.status != 200) res.json().then(res => alert(res["error"]))})
        .then(() => fetchData()); // Refresh the table
  }
  
  const getCurrentSectionCode = () => {
    let index = propertyExists(selectedSection, "sectionID", sections)
    if (index == undefined) { return "" }
    let sec = sections[index]
    return sec.coursePrefix + "-" + sec.courseNumber + "-" + sec.sectionNumber
  }

  // Add state variables for editing and adding employees
  const [editEmployeeRow, setEditEmployeeRow] = useState(null); // Tracks the row being edited for Employees
  const [newEmployeeRow, setNewEmployeeRow] = useState({
    firstName: '',
    lastName: '',
    roleID: '',
    email: '',
    password: '',
  }); // Tracks the new row data for Employees

  // Handle delete for Employees
  const handleEmployeeDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      fetch(`http://localhost:5000/employees/${id}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then(() => fetchData()); // Refresh the table
    }
  };

  // Handle submit (insert or update) for Employees
  const handleEmployeeSubmit = () => {
    if (window.confirm('Are you sure you want to submit this employee?')) {
      const method = editEmployeeRow ? 'PUT' : 'POST';
      const url = editEmployeeRow
        ? `http://localhost:5000/employees/${editEmployeeRow.employeeID}`
        : 'http://localhost:5000/employees';

      const payload = editEmployeeRow
        ? { ...newEmployeeRow, employeeID: editEmployeeRow.employeeID } // Include employeeID for updates
        : newEmployeeRow;

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setEditEmployeeRow(null); // Clear edit state
          setNewEmployeeRow({
            firstName: '',
            lastName: '',
            roleID: '',
            email: '',
            password: '',
          }); // Clear input fields
          fetchData(); // Refresh the table
        })
        .catch((err) => console.error('Error:', err));
    }
  };

  // Handle edit for Employees
  const handleEmployeeEdit = (row) => {
    setEditEmployeeRow(row); // Set the row being edited
    setNewEmployeeRow({
      firstName: row.firstName,
      lastName: row.lastName,
      roleID: row.roleID,
      email: row.email,
      password: row.password,
    }); // Populate input fields with existing data
  };

  // Handle Edit for Roles
const handleRoleEdit = (row) => {
  setEditRoleRow(row);
  setNewRoleRow({
    roleName: row.roleName,
    adminBool: row.adminBool,
  });
};

// Handle Delete for Roles
const handleRoleDelete = (id) => {
  if (window.confirm('Are you sure you want to delete this role?')) {
    fetch(`http://localhost:5000/roles/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => fetchData()); // Refresh the table
  }
};

// Handle Submit (Insert or Update) for Roles
const handleRoleSubmit = () => {
  if (window.confirm('Are you sure you want to submit this role?')) {
    const method = editRoleRow ? 'PUT' : 'POST';
    const url = editRoleRow
      ? `http://localhost:5000/roles/${editRoleRow.roleID}`
      : 'http://localhost:5000/roles';

    const payload = editRoleRow
      ? { ...newRoleRow, roleID: editRoleRow.roleID }
      : newRoleRow;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        setEditRoleRow(null); // Clear edit state
        setNewRoleRow({
          roleName: '',
          adminBool: 0,
        }); // Clear inputs
        fetchData(); // Refresh
      });
  }
};

const [editSectionRow, setEditSectionRow] = useState(null); // Tracks the row being edited
const [newSectionRow, setNewSectionRow] = useState({
  courseID: 0,
  employeeID: 0,
  roomID: 0,
  sectionNumber: "",
  startTime: "",
  endTime: "",
  weekDays: "",
  startDate: "",
  endDate: ""
}); // Tracks the new row data

const handleSectionEdit = (row) => {
  setEditSectionRow(row); // Set the row being edited
  setNewSectionRow({
      sectionNumber: row.sectionNumber,
      courseID: row.courseID,
      employeeID: row.sectionID,
      roomID: row.roomID,
      startTime: row.startTime,
      endTime: row.endTime,
      weekDays: row.weekDays,
      startDate: row.startDate,
      endDate: row.endDate
  }); // Populate input fields with existing data
};

const handleSectionDelete = (id) => {
  if (window.confirm('Are you sure you want to delete this section?')) {
    fetch(`http://localhost:5000/sections/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => fetchData()); // Refresh the table
  }
};

const isTime = (value) => {
    return /^\d\d:\d\d:\d\d$/.test(value)
}
const isDate = (value) => {
    value = value.split("-")
    if (value.length != 3) { return false }
    if (isNaN(Number(value[0]))) { return false }
    if (isNaN(Number(value[1]))) { return false }
    if (Number(value[1]) > 12 || Number(value[1]) < 1) { return false }
    if (isNaN(Number(value[2]))) { return false }
    if (Number(value[1]) == 2) {
        if (Number(value[2]) > 28 || Number(value[2]) < 1) { return false }
    }
    else if ([1, 3, 5, 7, 8, 10, 12].includes(Number(value[1]))) {
        if (Number(value[2]) > 31 || Number(value[2]) < 1) { return false }
    }
    else {
        if (Number(value[2]) > 30 || Number(value[2]) < 1) { return false }
    }
    return true
}

const handleSectionSubmit = () => {
  const payload = editSectionRow
    ? { ...newSectionRow, sectionID: editSectionRow.sectionID }
    : newSectionRow;
    
  //validation
  if (!isTime(payload.startTime)) { alert("Start Time is invalid format."); return }
  if (!isTime(payload.endTime)) { alert("End Time is invalid format."); return }
  if (!isDate(payload.startDate)) { alert("Start Date is invalid format."); return }
  if (!isDate(payload.endDate)) { alert("End Date is invalid format."); return }
  
  if (window.confirm('Are you sure you want to submit this section?')) {
    const method = editSectionRow ? 'PUT' : 'POST';
    const url = editSectionRow
      ? `http://localhost:5000/sections/${editSectionRow.sectionID}`
      : 'http://localhost:5000/sections';


    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        setEditSectionRow(null); // Clear edit state
        setNewSectionRow({
          courseID: 0,
          employeeID: 0,
          roomID: 0,
          sectionNumber: "",
          startTime: "",
          endTime: "",
          weekDays: "",
          startDate: "",
          endDate: ""
        }); // Clear input fields
        fetchData(); // Refresh the table
      });
  }
};

  const removeMaterialFromSection = (materialID, sectionID) => {
    if (window.confirm('Are you sure you want to remove this material from this section? It will still be visible in other sections')) {
        fetch('http://localhost:5000/materials/section', {
          method: "DELETE",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({materialID, sectionID}),
        })
          .then((res) => {if (res.status != 200) res.json().then(res => alert(res["error"]))})
          .then(fetchData())
    }
  }
  
  const addMaterialToSection = (materialID, sectionID) => {
        fetch('http://localhost:5000/materials/section', {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({materialID, sectionID}),
        })
          .then((res) => res.json())
          .then(fetchData())
  }

  return (
    <div>
      {/* Display the name and role */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid black' }}>
        <h2>User Information</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>ID:</strong> {user.employeeID}</p>
        <p><strong>Admin:</strong> {["No", "Yes"][user.adminBool]}</p>
      </div>
      
      <h2>Majors</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Name</th>
            {(user.adminBool && (
                <th>Actions</th>
            )) || ""}
          </tr>
        </thead>
        <tbody>
          {majors.map((maj) => (
            <tr key={maj.majorID}>
              <td>{maj.majorName}</td>
              {(user.adminBool && (
              <td>
                <button onClick={() => handleEdit(maj)}>Edit</button>
                <button onClick={() => handleDelete(maj.majorID)}>Delete</button>
              </td>
              )) || ""}
            </tr>
          ))}
          {/* Insert/Edit Row */}
          {(user.adminBool && (
          <tr>
            <td>
              <input
                type="text"
                value={newRow.majorName}
                onChange={(e) => setNewRow({ ...newRow, majorName: e.target.value })}
              />
            </td>
            <td>
              <button onClick={handleSubmit}>
                {editRow ? 'Update' : 'Add'}
              </button>
            </td>
          </tr>
          )) || ""}
        </tbody>
      </table>
      
      <h2>Rooms</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Building</th>
            <th>Number</th>
            {(user.adminBool && (
            <th>Actions</th>
            )) || ""}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.roomID}>
              <td>{room.buildingName}</td>
              <td>{room.roomNumber}</td>
              {(user.adminBool && (
              <td>
                <button onClick={() => handleRoomEdit(room)}>Edit</button>
                <button onClick={() => handleRoomDelete(room.roomID)}>Delete</button>
              </td>
              )) || ""}
            </tr>
          ))}
          {/* Insert/Edit Row */}
          {(user.adminBool && (
          <tr>
            <td>
              <input
                type="text"
                value={newRoomRow.buildingName}
                onChange={(e) => setNewRoomRow({ ...newRoomRow, buildingName: e.target.value })}
                placeholder="Building Name"
              />
            </td>
            <td>
              <input
                type="number"
                value={newRoomRow.roomNumber}
                onChange={(e) => setNewRoomRow({ ...newRoomRow, roomNumber: e.target.value })}
                placeholder="Room Number"
              />
            </td>
            <td>
              <button onClick={handleRoomSubmit}>
                {editRoomRow ? 'Update' : 'Add'}
              </button>
            </td>
          </tr>
          )) || "" }
        </tbody>
      </table>
      
      {(user.adminBool && (
      <div>
      <h2>Employees</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Password</th>
            {(user.adminBool && <th>Actions</th>) || ''}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.employeeID}>
              <td>{emp.firstName}</td>
              <td>{emp.lastName}</td>
              <td>{emp.roleName}</td>
              <td><a href={`mailto:${emp.email}`}>{emp.email}</a></td>
              <td>{emp.password}</td>
              {(user.adminBool && (
                <td>
                  <button onClick={() => handleEmployeeEdit(emp)}>Edit</button>
                  <button onClick={() => handleEmployeeDelete(emp.employeeID)}>Delete</button>
                </td>
              )) || ''}
            </tr>
          ))}
          {/* Insert/Edit Row */}
          {(user.adminBool && (
            <tr>
              <td>
                <input
                  type="text"
                  value={newEmployeeRow.firstName}
                  onChange={(e) => setNewEmployeeRow({ ...newEmployeeRow, firstName: e.target.value })}
                  placeholder="First Name"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={newEmployeeRow.lastName}
                  onChange={(e) => setNewEmployeeRow({ ...newEmployeeRow, lastName: e.target.value })}
                  placeholder="Last Name"
                />
              </td>
              <td>
                <select
                  value={newEmployeeRow.roleID}
                  onChange={(e) => setNewEmployeeRow({ ...newEmployeeRow, roleID: e.target.value })}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.roleID} value={role.roleID}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="email"
                  value={newEmployeeRow.email}
                  onChange={(e) => setNewEmployeeRow({ ...newEmployeeRow, email: e.target.value })}
                  placeholder="Email"
                />
              </td>
              <td>
                <input
                  type="password"
                  value={newEmployeeRow.password}
                  onChange={(e) => setNewEmployeeRow({ ...newEmployeeRow, password: e.target.value })}
                  placeholder="Password"
                />
              </td>
              <td>
                <button onClick={handleEmployeeSubmit}>
                  {editEmployeeRow ? 'Update' : 'Add'}
                </button>
              </td>
            </tr>
          )) || ''}
        </tbody>
      </table>
      
      <h2>Roles</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Admin</th>
            {(user.adminBool && <th>Actions</th>) || ''}
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.roleID}>
              <td>{role.roleName}</td>
              <td>{["No", "Yes"][role.adminBool]}</td>
              {(user.adminBool && (
                <td>
                  <button onClick={() => handleRoleEdit(role)}>Edit</button>
                  <button onClick={() => handleRoleDelete(role.roleID)}>Delete</button>
                </td>
              )) || ''}
            </tr>
          ))}
          {/* Insert/Edit Row */}
          {(user.adminBool && (
            <tr>
              <td>
                <input
                  type="text"
                  value={newRoleRow.roleName}
                  onChange={(e) => setNewRoleRow({ ...newRoleRow, roleName: e.target.value })}
                  placeholder="Role Name"
                />
              </td>
              <td>
                <select
                  value={newRoleRow.adminBool}
                  onChange={(e) => setNewRoleRow({ ...newRoleRow, adminBool: parseInt(e.target.value) })}
                >
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </td>
              <td>
                <button onClick={handleRoleSubmit}>
                  {editRoleRow ? 'Update' : 'Add'}
                </button>
              </td>
            </tr>
          )) || ''}
        </tbody>
      </table>
      </div>
      )) || ""}
      

      <h2>Courses</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Course Prefix</th>
            <th>Course Number</th>
            <th>Course Name</th>

            {(user.adminBool && <th>Actions</th>) || ''}
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.courseID}>
              <td>{course.coursePrefix}</td>
              <td>{course.courseNumber}</td>
              <td>{course.courseName}</td>
              {(user.adminBool && (
                <td>
                  <button onClick={() => handleCourseEdit(course)}>Edit</button>
                  <button onClick={() => handleCourseDelete(course.courseID)}>Delete</button>
                </td>
              )) || ''}
            </tr>
          ))}
          {/* Insert/Edit Row */}
          {(user.adminBool && (
            <tr>
              <td>
                <input
                  type="text"
                  value={newCourseRow.coursePrefix}

                  onChange={(e) => setNewCourseRow({ ...newCourseRow, coursePrefix: e.target.value })}
                  placeholder="Course Prefix"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={newCourseRow.courseNumber}
                  onChange={(e) => setNewCourseRow({ ...newCourseRow, courseNumber: e.target.value })}
                  placeholder="Course Number"
                />
              </td>
              <td>
                <input
                  type="text"

                  value={newCourseRow.courseName}
                  onChange={(e) => setNewCourseRow({ ...newCourseRow, courseName: e.target.value })}
                  placeholder="Course Name"
                />
              </td>
              <td>
                <button onClick={handleCourseSubmit}>
                  {editCourseRow ? 'Update' : 'Add'}
                </button>

              </td>
            </tr>
          )) || ''}
        </tbody>
      </table>
      
      <h2>Sections</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Schedule</th>
            <th>Dates</th>
            <th>Room</th>
            <th>Instructor</th>
            {(user.adminBool && (
            <th>Actions</th>
            )) || ""}
          </tr>
        </thead>
        <tbody>
          {sections.map((sec) => (
            <tr key={sec.sectionID} onClick={() => {setSelectedSection(sec.sectionID)}} style={[defaultRow, selectedRow][+(selectedSection==sec.sectionID)]}>
              <td>{sec.coursePrefix + "-" + sec.courseNumber + "-" + sec.sectionNumber}</td>
              <td>{sec.courseName}</td>
              <td>{sec.startTime + "-" + sec.endTime + " " + sec.weekDays}</td>
              <td>{sec.startDate + " - " + sec.endDate}</td>
              <td>{sec.buildingName + " " + sec.roomNumber}</td>
              <td>{sec.lastName + ", " + sec.firstName}</td>
              {(user.adminBool && (
              <td>
                <button onClick={() => handleSectionEdit(sec)}>Edit</button>
                <button onClick={() => handleSectionDelete(sec.sectionID)}>Delete</button>
              </td>
              )) || ""}
            </tr>
          ))}
          {/* Insert/Edit Row */}
          {(user.adminBool && (
  <tr>
    <td>
    <select
      value={newSectionRow.courseID}
      onChange={(e) => setNewSectionRow({ ...newSectionRow, courseID: e.target.value, sectionNumber: "" })}
    >
      <option value="">Select Course</option>
      {courses.map((course) => (
        <option key={course.courseID} value={course.courseID}>
          {course.coursePrefix + "-" + course.courseNumber}
        </option>

      ))}
      </select>

      <input
        type="text"
        value={newSectionRow.sectionNumber}
        onChange={(e) => setNewSectionRow({ ...newSectionRow, sectionNumber: e.target.value })}
        placeholder="Section Number"
      />
    </td>
    <td>
    {
    (courses[propertyExists(newSectionRow.courseID, "courseID", courses)] != undefined) ? courses[propertyExists(newSectionRow.courseID, "courseID", courses)].courseName : ""
    }
    </td>
    <td>
      <input
        type="text"
        value={newSectionRow.startTime}
        onChange={(e) => setNewSectionRow({ ...newSectionRow, startTime: e.target.value })}
        placeholder="Start Time"
      />
      <input
        type="text"
        value={newSectionRow.endTime}
        onChange={(e) => setNewSectionRow({ ...newSectionRow, endTime: e.target.value })}
        placeholder="End Time"
      />
      <input
        type="text"
        value={newSectionRow.weekDays}
        onChange={(e) => setNewSectionRow({ ...newSectionRow, weekDays: e.target.value })}
        placeholder="Days"
      />
    </td>
    <td>
      <input
        type="text"
        value={newSectionRow.startDate}
        onChange={(e) => setNewSectionRow({ ...newSectionRow, startDate: e.target.value })}
        placeholder="Start Date"
      />
      <span> - </span>
      <input
        type="text"
        value={newSectionRow.endDate}
        onChange={(e) => setNewSectionRow({ ...newSectionRow, endDate: e.target.value })}
        placeholder="End Date"
      />
    </td>
    <td>
        <select
          value={newSectionRow.roomID}
          onChange={(e) => setNewSectionRow({ ...newSectionRow, roomID: e.target.value })}
        >
          <option value="">Select Room</option>
          {rooms.map((room) => (
            <option key={room.roomID} value={room.roomID}>
              {room.buildingName + " " + room.roomNumber}
            </option>
          ))}
          </select>
    </td>
    <td>
        <select
          value={newSectionRow.employeeID}
          onChange={(e) => setNewSectionRow({ ...newSectionRow, employeeID: e.target.value })}
        >
          <option value="">Select Instructor</option>
          {employees.map((emp) => (
            <option key={emp.employeeID} value={emp.employeeID}>
              {emp.lastName + ", " + emp.firstName}
            </option>
          ))}
          </select>
    </td>
    <td>
      <button onClick={handleSectionSubmit}>
        {editSectionRow ? 'Update' : 'Add'}
      </button>
    </td>
  </tr>
)) || ""}
        </tbody>
      </table>
      
      <h2>Materials</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Type</th>
            <th>Points Worth</th>
            <th>File</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.map(mat => (
            <tr key={mat.materialID} onClick={() => {setSelectedMaterial(mat.materialID)}} style={[defaultRow, selectedRow][+(selectedMaterial==mat.materialID)]}>
              <td>{mat.materialName}</td>
              <td>{mat.materialDescription}</td>
              <td>{mat.typeName}</td>
              <td>{mat.maxPoints}</td>
              <td>{mat.fileName != "" ? <button onClick={() => downloadFile('http://localhost:5000/material/file/' + mat.materialID, mat.fileName)}>Download</button> : ""}</td>
              <td>
                <button onClick={() => handleMaterialEdit(mat)}>Edit</button>
                <button onClick={() => handleMaterialDelete(mat.materialID)}>Delete</button>
                <button onClick={() => removeMaterialFromSection(mat.materialID, selectedSection)}>Remove</button>
                
                <select
                    onChange={(e) => {addMaterialToSection(mat.materialID, e.target.value); e.target.value = ""}}
                  >
                    <option value="">Add to Section</option>
                    {sections.map((sec) => (
                      <option key={sec.sectionID} value={sec.sectionID}>
                        {sec.coursePrefix + "-" + sec.courseNumber + "-" + sec.sectionNumber}
                      </option>
                    ))}
                </select>
              </td>
            </tr>
          ))}
          {/* Insert/Edit Row */}
          <tr>
            <td>
              <input
                type="text"
                value={newMaterialRow.materialName}
                onChange={(e) => setNewMaterialRow({ ...newMaterialRow, materialName: e.target.value })}
                placeholder="Material Name"
              />
            </td>
            <td>
              <input
                type="text"
                value={newMaterialRow.materialDescription}
                onChange={(e) => setNewMaterialRow({ ...newMaterialRow, materialDescription: e.target.value })}
                placeholder="Material Description"
              />
            </td>
            <td>
              <select
                value={newMaterialRow.typeID}
                onChange={(e) => setNewMaterialRow({ ...newMaterialRow, typeID: e.target.value })}
              >
                <option value="">Select Type</option>
                {types.map((type) => (
                  <option key={type.typeID} value={type.typeID}>
                    {type.typeName}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input
                type="number"
                value={newMaterialRow.maxPoints}
                onChange={(e) => setNewMaterialRow({ ...newMaterialRow, maxPoints: e.target.value })}
                placeholder="Max Points"
              />
            </td>
            <td>
            
            </td>
            <td>
              <button onClick={handleMaterialSubmit}>
                {editMaterialRow ? 'Update' : 'Add'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <h2>Types</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th> {/* New Actions column */}
          </tr>
        </thead>
        <tbody>
          {types.map((type) => (
            <tr key={type.typeID}>
              <td>{type.typeName}</td>
              <td>{type.typeDescription}</td>
              <td>
                <button onClick={() => handleTypeEdit(type)}>Edit</button>
                <button onClick={() => handleTypeDelete(type.typeID)}>Delete</button>
              </td>
            </tr>
          ))}
          {/* Insert/Edit Row */}
          <tr>
            <td>
              <input
                type="text"
                value={newTypeRow.typeName}
                onChange={(e) => setNewTypeRow({ ...newTypeRow, typeName: e.target.value })}
                placeholder="Type Name"
              />
            </td>
            <td>
              <input
                type="text"
                value={newTypeRow.typeDescription}
                onChange={(e) => setNewTypeRow({ ...newTypeRow, typeDescription: e.target.value })}
                placeholder="Type Description"
              />
            </td>
            <td>
              <button onClick={handleTypeSubmit}>
                {editTypeRow ? 'Update' : 'Add'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      
      <h2>Grades</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Grade</th>
            <th>Comment</th>
            <th>Student</th>
            <th>Actions</th> {/* New Actions column */}
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => (
            <tr key={`${grade.studentID}-${grade.materialID}`}>
              <td>{`${grade.grade}/${grade.maxPoints} (${gradePercent(grade.grade, grade.maxPoints)}%)`}</td>
              <td>{grade.comments}</td>
              <td>{`${grade.lastName}, ${grade.firstName}`}</td>
              <td>
                <button onClick={() => handleGradeEdit(grade)}>Edit</button>
                <button onClick={() => handleGradeDelete(grade.studentID, grade.materialID)}>Delete</button>
              </td>
            </tr>
          ))}
          {/* Insert/Edit Row */}
          <tr>
            <td>
              <input
                type="number"
                value={newGradeRow.grade}
                onChange={(e) => setNewGradeRow({ ...newGradeRow, grade: e.target.value })}
                placeholder="Grade"
              />
              <span>/{
                (materials[propertyExists(selectedMaterial, "materialID", materials)] != undefined) ? materials[propertyExists(selectedMaterial, "materialID", materials)].maxPoints : ""
                }
              </span>
            </td>
            <td>
              <input
                type="text"
                value={newGradeRow.comments}
                onChange={(e) => setNewGradeRow({ ...newGradeRow, comments: e.target.value })}
                placeholder="Comments"
              />
            </td>
            <td>
              <select
                value={newGradeRow.studentID}
                onChange={(e) => setNewGradeRow({ ...newGradeRow, studentID: e.target.value })}
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.studentID} value={student.studentID}>
                    {`${student.lastName}, ${student.firstName}`}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <button onClick={handleGradeSubmit}>
                {editGradeRow ? 'Update' : 'Add'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <h2>Students</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Major</th>
            <th>Graduation Year</th>
            <th>Enrollment in {getCurrentSectionCode()}</th>
            {(user.adminBool && (
            <th>Actions</th>
            )) || ""}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.studentID} style={[defaultRow, selectedRow][+(propertyExists(student.studentID, "studentID", studentsInSection) != undefined)]}>
              <td>{`${student.lastName}, ${student.firstName}`}</td>
              <td>
                <a href={`mailto:${student.email}`}>{student.email}</a>
              </td>
              <td>{stringMajors(student.studentID)}</td>
              <td>{student.graduationYear}</td>
              <td>
                <p>{(propertyExists(student.studentID, "studentID", studentsInSection) != undefined) ? "Yes" : "No"}</p>
                <button onClick={() => enrollStudent(student.studentID, selectedSection)}>Change</button></td>
              {(user.adminBool && (
              <td>
                <button onClick={() => handleStudentEdit(student)}>Edit</button>
                <button onClick={() => handleStudentDelete(student.studentID)}>Delete</button>
              </td>
              )) || ""}
            </tr>
          ))}
          {/* Insert/Edit Row */}
          {(user.adminBool && (
          <tr>
            <td>
              <input
                type="text"
                value={newStudentRow.firstName}
                onChange={(e) => setNewStudentRow({ ...newStudentRow, firstName: e.target.value })}
                placeholder="First Name"
              />
              <input
                type="text"
                value={newStudentRow.lastName}
                onChange={(e) => setNewStudentRow({ ...newStudentRow, lastName: e.target.value })}
                placeholder="Last Name"
              />
            </td>
            <td>
              <input
                type="email"
                value={newStudentRow.email}
                onChange={(e) => setNewStudentRow({ ...newStudentRow, email: e.target.value })}
                placeholder="Email"
              />
            </td>
            <td>
              <select
                multiple
                value={newStudentRow.majorIDs}
                onChange={(e) =>
                  setNewStudentRow({
                    ...newStudentRow,
                    majorIDs: Array.from(e.target.selectedOptions, (option) => option.value),
                  })
                }
              >
                {majors.map((major) => (
                  <option key={major.majorID} value={major.majorID}>
                    {major.majorName}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input
                type="number"
                value={newStudentRow.graduationYear}
                onChange={(e) => setNewStudentRow({ ...newStudentRow, graduationYear: e.target.value })}
                placeholder="Graduation Year"
              />
            </td>
            <td></td>
            <td>
              <button onClick={handleStudentSubmit}>
                {editStudentRow ? 'Update' : 'Add'}
              </button>
            </td>
          </tr>
          )) || ""}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Validates if a student would be enrolled in two sections of the same course.
 * @param {number} studentID - The ID of the student to validate.
 * @param {number} newCourseID - The course ID of the section being added or updated.
 * @returns {Promise<boolean>} - Resolves to true if the operation is valid, false otherwise.
 */
const validateStudentEnrollment = async (studentID, newCourseID) => {
  try {
    // Fetch all sections the student is currently enrolled in
    const response = await fetch(`http://localhost:5000/students/section/${studentID}`);
    const studentSections = await response.json();

    // Extract course IDs for the sections the student is enrolled in
    const courseIDs = await Promise.all(
      studentSections.map(async (section) => {
        const sectionResponse = await fetch(`http://localhost:5000/sections/${section.sectionID}`);
        const sectionData = await sectionResponse.json();
        return sectionData.courseID;
      })
    );

    // Check if the new course ID already exists in the student's enrolled courses
    if (courseIDs.includes(newCourseID)) {
      return false; // Validation failed
    }

    return true; // Validation passed
  } catch (error) {
    console.error('Error validating student enrollment:', error);
    return false; // Assume invalid if an error occurs
  }
};
