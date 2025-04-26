import { useEffect, useState, Button } from 'react';
import Form from './Form';

export default function Dashboard({ user }) {
  //variables for storing all table data
  //useState means that React will automatically rerender parts of the page they're used in when they update, as long as they're updated with the function returned as the second paramter of useState
  const [sections, setSections] = useState([]);
  const [majors, setMajors] = useState([]);
  const [studentMajors, setStudentMajors] = useState({});
  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [types, setTypes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  
  //vars for which column is currently selected
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  const [selectedSection, setSelectedSection] = useState(0);
  
  //styling for rows that are selected vs not
  const selectedRow = {
    backgroundColor: "grey"
  }
  const defaultRow = {
    backgroundColor: "white"
  }

  //fetch general data (doesn't vary based on which section/material is selected)
  const fetchData = () => {
    fetch('http://localhost:5000/majors')
      .then(res => res.json()) 
      .then(setMajors);
    fetch('http://localhost:5000/rooms')
      .then(res => res.json())
      .then(setRooms);
    fetch('http://localhost:5000/sections')
      .then(res => res.json())
      .then(setSections)
    fetch('http://localhost:5000/employees')
      .then(res => res.json())
      .then(setEmployees);
    fetch('http://localhost:5000/roles')
      .then(res => res.json())
      .then(setRoles);
  };
  
  const fetchSectionData = () => {
    if (selectedSection != 0) {
      fetch('http://localhost:5000/students/section/' + selectedSection)
        .then(res => res.json())
        .then(setStudents);
      fetch('http://localhost:5000/materials/section/' + selectedSection)
        .then(res => res.json())
        .then(setMaterials);
      fetch('http://localhost:5000/types/section/' + selectedSection)
        .then(res => res.json())
        .then(setTypes);
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
    return false
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
  
  let isAdmin = propertyExists(user.userID, "userID", employees)

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

  const [editCourseRow, setEditCourseRow] = useState(null);
  const [newCourseRow, setNewCourseRow] = useState({ coursePrefix: '', courseNumber: '', courseName: '' });

  const handleCourseDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      fetch(`http://localhost:5000/courselist/${id}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then(() => fetchData());
    }
  };

  const handleCourseSubmit = () => {
    if (window.confirm('Are you sure you want to submit this course?')) {
      const method = editCourseRow ? 'PUT' : 'POST';
      const url = editCourseRow
        ? `http://localhost:5000/courselist/${editCourseRow.courseID}`
        : 'http://localhost:5000/courselist';

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
          setNewCourseRow({ coursePrefix: '', courseNumber: '', courseName: '' });
          fetchData();
        });
    }
  };

  const handleCourseEdit = (row) => {
    setEditCourseRow(row);
    setNewCourseRow({ coursePrefix: row.coursePrefix, courseNumber: row.courseNumber, courseName: row.courseName });
  };

  return (
    <div>
      {/* Display the name and role */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid black' }}>
        <h2>User Information</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
      
      <h2>Majors</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th> {/* New Actions column */}
          </tr>
        </thead>
        <tbody>
          {majors.map((maj) => (
            <tr key={maj.majorID}>
              <td>{maj.majorName}</td>
              <td>
                <button onClick={() => handleEdit(maj)}>Edit</button>
                <button onClick={() => handleDelete(maj.majorID)}>Delete</button>
              </td>
            </tr>
          ))}
          {/* Insert/Edit Row */}
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
        </tbody>
      </table>
      
      <h2>Rooms</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Building</th>
            <th>Number</th>
            <th>Actions</th> {/* New Actions column */}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.roomID}>
              <td>{room.buildingName}</td>
              <td>{room.roomNumber}</td>
              <td>
                <button onClick={() => handleRoomEdit(room)}>Edit</button>
                <button onClick={() => handleRoomDelete(room.roomID)}>Delete</button>
              </td>
            </tr>
          ))}
          {/* Insert/Edit Row */}
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
        </tbody>
      </table>
      
      {isAdmin && (
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
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.employeeID}>
              <td>{emp.firstName}</td>
              <td>{emp.lastName}</td>
              <td>{emp.roleName}</td>
              <td><a href={"mailto:" + emp.email}>{emp.email}</a></td>
              <td>{emp.password}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h2>Roles</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Admin</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.roleID}>
              <td>{role.roleName}</td>
              <td>{["No", "Yes"][role.adminBool]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      )}
      
      <h2>Courselist</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Schedule</th>
            <th>Dates</th>
            <th>Room</th>
            <th>Instructor</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(sec => (
            <tr key={sec.sectionID} onClick={() => {setSelectedSection(sec.sectionID)}} style={[defaultRow, selectedRow][+(selectedSection==sec.sectionID)]}>
              <td>{sec.coursePrefix + "-" + sec.courseNumber + "-" + sec.sectionNumber}</td>
              <td>{sec.courseName}</td>
              <td>{sec.startTime + "-" + sec.endTime + " " + sec.weekDays}</td>
              <td>{sec.startDate + " - " + sec.endDate}</td>
              <td>{sec.buildingName + " " + sec.roomNumber}</td>
              <td>{sec.lastName + ", " + sec.firstName}</td>
            </tr>
          ))}
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
          </tr>
        </thead>
        <tbody>
          {materials.map(mat => (
            <tr key={mat.materialID} onClick={() => {setSelectedMaterial(mat.materialID)}} style={[defaultRow, selectedRow][+(selectedMaterial==mat.materialID)]}>
              <td>{mat.materialName}</td>
              <td>{mat.materialDescription}</td>
              <td>{mat.typeName}</td>
              <td>{mat.maxPoints}</td>
              <td><button onClick={() => downloadFile('http://localhost:5000/material/file/' + mat.materialID, mat.fileName)}>Download</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h2>Types</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>

        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {types.map(type => (
            <tr key={type.typeID}>
              <td>{type.typeName}</td>
              <td>{type.typeDescription}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      
      <h2>Grades</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Grade</th>
            <th>Comment</th>
            <th>Student</th>
          </tr>
        </thead>
        <tbody>
          {grades.map(grade => (
            <tr key={grade.materialID, grade.studentID}>
              <td>{grade.grade + "/" + grade.maxPoints + " (" + gradePercent(grade.grade, grade.maxPoints) + "%)"}</td>
              <td>{grade.comments}</td>
              <td>{grade.lastName + ", " + grade.firstName}</td>
            </tr>
          ))}
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
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.studentID}>
              <td>{student.lastName + ", " + student.firstName}</td>
              <td><a href={"mailto:" + student.email}>{student.email}</a></td>
              <td>{stringMajors(student.studentID)}</td>
              <td>{student.graduationYear}</td>
            </tr>
          ))}
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
