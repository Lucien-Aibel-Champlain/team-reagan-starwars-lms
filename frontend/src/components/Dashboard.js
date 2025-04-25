import { useEffect, useState, Button } from 'react';
import Form from './Form';

export default function Dashboard({ user }) { // Accept the user prop
  const [sections, setSections] = useState([]);
  const [majors, setMajors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [types, setTypes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedSection, setSelectedSection] = useState(1);

  const selectedRow = {
    backgroundColor: "grey"
  };
  const defaultRow = {
    backgroundColor: "white"
  };

  const fetchData = () => {
    fetch('http://localhost:5000/majors')
      .then(res => res.json())
      .then(setMajors);
    fetch('http://localhost:5000/rooms')
      .then(res => res.json())
      .then(setRooms);
    fetch('http://localhost:5000/sections')
      .then(res => res.json())
      .then(setSections);
    fetch('http://localhost:5000/employees')
      .then(res => res.json())
      .then(setEmployees);
    fetch('http://localhost:5000/roles')
      .then(res => res.json())
      .then(setRoles);
    fetch('http://localhost:5000/materials')
      .then(res => res.json())
      .then(setMaterials);
    if (selectedSection != 0) {
      fetch('http://localhost:5000/grades/section/' + selectedSection)
        .then(res => res.json())
        .then(setGrades);
      fetch('http://localhost:5000/types/section/' + selectedSection)
        .then(res => res.json())
        .then(setTypes);
    }
  };

  const downloadFile = (materialID) => {
    fetch('http://localhost:5000/material/file/' + materialID)
        .then(res => res.json())
        .then(res => {let myBlob = new Blob([new Uint8Array(res[0].materialFile.data)])
            let blobUrl = (URL.createObjectURL(myBlob))
            let link = document.createElement("a")
            link.href = blobUrl
            link.download = "file.jpg"
            link.click()
            link.remove()
        });
  }
  
  const gradePercent = (points, maxPoints) => {
    if (maxPoints == 0) {
        return 100
    }
    else {
        return (points / maxPoints) * 100
    }
  }

  useEffect(() => {
    fetchData();
  }, [selectedSection]);

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
          </tr>
        </thead>
        <tbody>
          {majors.map(maj => (
            <tr key={maj.majorID}>
              <td>{maj.majorName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h2>Rooms</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Building</th>
            <th>Number</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room.roomID}>
              <td>{room.buildingName}</td>
              <td>{room.roomNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {user.role === 'admin' && (
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
              <td>{emp.email}</td>
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
            <tr key={mat.materialID}>
              <td>{mat.materialName}</td>
              <td>{mat.materialDescription}</td>
              <td>{mat.typeName}</td>
              <td>{mat.maxPoints}</td>
              <td><button onClick={() => downloadFile(mat.materialID)}>Download</button></td>
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
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {grades.map(grade => (
            <tr key={grade.materialID, grade.studentID}>
              <td>{grade.grade + "/" + grade.maxPoints + " (" + gradePercent(grade.grade, grade.maxPoints) + "%)"}</td>
              <td>{grade.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}