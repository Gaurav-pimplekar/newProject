


// EmployeeList.js
import React, { useEffect } from 'react';
import '../styles/employees.css';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployees } from '../storage/adminStorage';
import axios from 'axios';

const EmployeeList = ({ employees }) => {
  const dispatch = useDispatch();
  const state = useSelector(state => state.admin);

  useEffect(()=>{
    dispatch(getEmployees());
  },[])

  console.log(state);

  const deleteEmp = async (id)=>{
    try {
      
      const res = await axios.delete(`http://localhost:8080/deleteEmployee/${id}`)

      dispatch(getEmployees())

    } catch (error) {
      
      alert(error.response.data.message);
    }
  }
  return (
    <div>
      <h2>Employee List</h2>
      <table className="employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Gender</th>
            <th>Employee ID</th>
            <th>Pickup Location</th>
            <th>Drop Location</th>
            <th>Shift Time</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {state.employees.map((employee , index)=> (
            <tr key={employee.id}>
              <td>{index + 1}</td>
              <td>{employee.name}</td>
              <td>{employee.phone_number}</td>
              <td>{employee.gender}</td>
              <td>{employee.employeeId}</td>
              <td>{employee.pickup_location}</td>
              <td>{employee.drop_location}</td>
              <td>{employee.shift_time}</td>
              <td onClick={()=>deleteEmp(employee._id)}><button className='btn-del'>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;

