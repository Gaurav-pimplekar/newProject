import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/pairingEmployee.css"; // Ensure this CSS file exists for styling
import { useDispatch, useSelector } from "react-redux";
import { get_pair_employee_and_driver, get_pair_vehicle_and_driver, pair_employee_and_driver, search_employee, unpairEmployee } from "../storage/adminStorage";
import io from "socket.io-client"

const AddEmployee = () => {
  const [drivers, setDrivers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pairings, setPairings] = useState([]);
  const dispatch = useDispatch();
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const state = useSelector(state => state.admin);
  const socket = io("http://localhost:8080");

  const handlePairEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true); // Open the modal
  };

  console.log(state);
  const handleAddPairing = async (driver) => {
    await dispatch(pair_employee_and_driver({employee: selectedEmployee._id, driver: driver._id}))

    socket.emit("pairEmployee", {pairId: driver._id});
    socket.emit("updateDriver", { driverId: driver.driver._id });
    socket.emit("updateEmployee", { employeeId: selectedEmployee._id })

    dispatch(get_pair_employee_and_driver());
    dispatch(get_pair_vehicle_and_driver());
    setIsModalOpen(false);
  };

  const handleUnpair = async (id) => {
    
    await dispatch(unpairEmployee(id)).unwrap();

    socket.emit("pairEmployee", {pairId: id});

    dispatch(get_pair_employee_and_driver());
    dispatch(get_pair_vehicle_and_driver());
  };

  

  useEffect(()=>{
    dispatch(get_pair_employee_and_driver());
    dispatch(get_pair_vehicle_and_driver())
  },[])

  return (
    <div className="add-employee-container">
      <h2>Pair Employee with Driver</h2>

      <div className="search_bar" style={{ display: "flex" }}>
        <input
          className="search"
          type="text"
          placeholder="Search by Employee Name"
          value={searchTerm}
          onChange={(e) => {const searchValue = e.target.value;
            setSearchTerm(searchValue); // Update the searchTerm state
            if (searchValue.trim()) { // Only dispatch if the search term is not empty
              dispatch(search_employee(searchValue)); // Dispatch search action
            }; setSearchTerm(e.target.value)}}
        />
      </div>

      {state.search_employee.length !=0 ? (
        <div className="table">
          <div className="table_head">
            <table className="cab-list-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {state.search_employee?.map((employee, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{employee.name}</td>
                    <td>
                      <button onClick={() => handlePairEmployee(employee)}>
                        Pair Driver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ): <div> {state.message} </div>}

      {isModalOpen && selectedEmployee && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2>Driver List for {selectedEmployee.name}</h2>
            <table className="cab-list-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Driver Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {state?.paired_vehicle?.map((driver, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{driver.driver.name}</td>
                    <td>
                      <button onClick={() => handleAddPairing(driver)}>
                        Add Pairing
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {state.paired_employees.length > 0 && (
        <div className="pairing-list">
          <h2>Employee-Driver Pairings</h2>
          {state?.paired_employees?.map((pairingParent, index) => (
            <>
            {pairingParent?.passengers?.map((pairing) =>{
              return <>
              <div key={index} className="pairing-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p><strong>Employee:</strong> {pairing?.id?.name}</p>
                <p><strong>Driver:</strong> {pairingParent?.driver?.name}</p>
              </div>
              <button onClick={() => handleUnpair(pairing?.id?._id)}>Unpair</button>
            </div>
            </>
            })}
            </>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddEmployee;