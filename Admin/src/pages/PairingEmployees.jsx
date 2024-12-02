// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "../styles/pairingEmployee.css"; // Ensure this CSS file exists for styling
// import { useDispatch, useSelector } from "react-redux";
// import { get_pair_employee_and_driver, get_pair_vehicle_and_driver, pair_employee_and_driver, search_employee, unpairEmployee } from "../storage/adminStorage";
// import socket from "../utils/socket";


// const AddEmployee = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [pairings, setPairings] = useState([]);
//   const dispatch = useDispatch();
//   const [filteredEmployees, setFilteredEmployees] = useState([]);
//   const state = useSelector(state => state.admin);
//   const [isDropTrip, setIsDropTrip] = useState(false);

//   const [pair, setPair] = useState(state?.paired_employees);

//   const handlePairEmployee = (employee) => {
//     setSelectedEmployee(employee);
//     setIsModalOpen(true); // Open the modal
//   };

//   console.log(state, pair);
//   const handleAddPairing = async (driver) => {
//     await dispatch(pair_employee_and_driver({ employee: selectedEmployee._id, driver: driver._id }))

//     socket.emit("pairEmployee", { pairId: driver._id });

    

//     dispatch(get_pair_employee_and_driver());
//     dispatch(get_pair_vehicle_and_driver());
//     setIsModalOpen(false);
//   };



//   const handleUnpair = (id) => {

//     socket.emit("unpairEmployee", id);
//     console.log("unpair");
//     // await dispatch(unpairEmployee(id)).unwrap();

//     // socket.emit("pairEmployee", { pairId: id });

//     // dispatch(get_pair_employee_and_driver());
//     // dispatch(get_pair_vehicle_and_driver());
//   };



//   useEffect(() => {
//     dispatch(get_pair_employee_and_driver());
//     dispatch(get_pair_vehicle_and_driver())
//   }, [])

//   useEffect(() => {
    
//       socket.on("getPair", ({ pair }) => {
//         console.log("Updated pairs:", pair);
//         setPair(pair);
//       });

//       socket.on("callUnpairEmployee", (id)=>{
//         console.log("unpair get called by above");
//         dispatch(unpairEmployee(id))
//       })
  
//     return () => {
//       socket.off("getPair");
//     };
//   }, []);

//   const toggleDropTrip = (index) => {
//     setIsDropTrip(prevState => ({
//       ...prevState,
//       [index]: !prevState[index], // Toggle the value for the specific driver
//     }));
//   };

//   return (
//     <div className="add-employee-container">
//       <h2>Pair Employee with Driver</h2>

//       <div className="search_bar" style={{ display: "flex" }}>
//         <input
//           className="search"
//           type="text"
//           placeholder="Search by Employee Name"
//           value={searchTerm}
//           onChange={(e) => {
//             const searchValue = e.target.value;
//             setSearchTerm(searchValue); // Update the searchTerm state
//             if (searchValue.trim()) { // Only dispatch if the search term is not empty
//               dispatch(search_employee(searchValue)); // Dispatch search action
//             }; setSearchTerm(e.target.value)
//           }}
//         />
//       </div>

//       {state.search_employee.length != 0 ? (
//         <div className="table">
//           <div className="table_head">
//             <table className="cab-list-table">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Employee Name</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {state.search_employee?.map((employee, index) => (
//                   <tr key={index}>
//                     <td>{index + 1}</td>
//                     <td>{employee.name}</td>
//                     <td>
//                       <button onClick={() => handlePairEmployee(employee)}>
//                         Pair Driver
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : <div> {state.message} </div>}

//       {isModalOpen && selectedEmployee && (
//         <div className="modal">
//           <div className="modal-content">
//             <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
//             <h2>Driver List for {selectedEmployee.name}</h2>
//             <table className="cab-list-table">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Driver Name</th>
//                   <th>IsDropTrip</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {state?.paired_vehicle?.map((driver, index) => (
//                   <tr key={index}>
//                     <td>{index + 1}</td>
//                     <td>{driver.driver.name}</td>
//                     <td>
//                       <button
//                         onClick={() => toggleDropTrip(index)}
//                         style={{
//                           backgroundColor: isDropTrip[index] ? 'green' : 'red', // Change color based on state
//                           color: 'white',
//                           padding: '5px 10px',
//                         }}
//                       >
//                         {isDropTrip[index] ? 'Drop Trip' : 'Not Drop Trip'}
//                       </button>
//                     </td>
//                     <td>
//                       <button onClick={() => handleAddPairing(driver)}>
//                         Add Pairing
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {pair.length > 0 && (
//         <div className="pairing-list">
//           <h2>Employee-Driver Pairings</h2>
//           {state?.paired_employees?.map((pairingParent, index) => (
//             <>
//               {pairingParent?.passengers?.map((pairing) => {
//                 return <>
//                   <div key={index} className="pairing-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div>
//                       <p><strong>Employee:</strong> {pairing?.id?.name}</p>
//                       <p><strong>Driver:</strong> {pairingParent?.driver?.name}</p>
//                     </div>
//                     <button onClick={() => handleUnpair(pairing?.id?._id)}>Unpair</button>
//                   </div>
//                 </>
//               })}
//             </>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddEmployee;






//####################################################################################################

import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/pe.css"

const socket = io("http://localhost:8080", {
  transports: ['websocket', 'polling'],
});

function AddEmployee() {
  const [pairs, setPairs] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [isDropTrip, setIsDropTrip] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatePairId, setUpdatePairId] = useState("");
  const [organizations, setOrganization] = useState([]);


  useEffect(() => {
    axios.get("http://localhost:8080/getpairs")
      .then((response) => setPairs(response.data.data))
      .catch((err) => alert(err.message));

    axios.get("http://localhost:8080/get/employees")
      .then((response) => setPassengers(response.data.data))
      .catch((err) => alert(err.message));

    axios.get("http://localhost:8080/location")
      .then((response) => setOrganization(response.data?.data?.locations))
      .catch((err) => alert(err.message));

    // Listen for updates to pairs from the server
    socket.on("getPair", (data) => {
      console.log(data.pair)
      setPairs(data.pair);  // Update the pairs state with the latest data
    });

    socket.on("updatedPairs", (data) => {
      setPairs(data.pairs);  // Update the pairs state with the latest data
    });

    // Cleanup the socket listener when the component is unmounted
    return () => {
      socket.off("getPair");
    };
  }, []);

  const handleDriverChange = (e) => setSelectedDriver(e.target.value);

  const handlePassengerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedPassengersArray = selectedOptions.map(option => {
      const passengerId = option.value;
      return passengers.find(passenger => passenger._id === passengerId);
    });

    setSelectedPassengers(prevSelected => [
      ...prevSelected,
      ...selectedPassengersArray.filter(passenger => !prevSelected.includes(passenger)),
    ]);
  };

  const handleRemovePassenger = (passengerId) => {
    setSelectedPassengers(selectedPassengers.filter(passenger => passenger._id !== passengerId));
  };

  const handleOrganizationChange = (e) => setSelectedOrganization(e.target.value);

  const handleDropTripToggle = () => setIsDropTrip(!isDropTrip);

  const handleSubmit = (e) => {
    e.preventDefault();

    const tripDetails = {
      driver: selectedDriver,
      passengers: selectedPassengers,
      organization: selectedOrganization,
      isDropTrip: isDropTrip,
    };

    socket.emit("addPair", tripDetails); // Emit the event to add the pair

    console.log("Trip Details Submitted:", tripDetails);

    // Reset form values after submit
    resetForm();
  };

  const handleUpdate = (pair) => {
    setSelectedDriver(pair.driver._id);
    setSelectedPassengers(pair.passengers.map(p => p.id));
    setSelectedOrganization(pair.organization);
    setIsDropTrip(pair.isDropTrip);
    setIsUpdating(true);
    setUpdatePairId(pair._id);
  };

  const handleUnpair = (pairId) => {
    socket.emit("unpair", pairId);
  };

  // Reset the form to default state after submit or update
  const resetForm = () => {
    setSelectedDriver("");
    setSelectedPassengers([]);
    setSelectedOrganization("");
    setIsDropTrip(false);
    setIsUpdating(false);
    setUpdatePairId("");
  };

  return (
    <div className="App">
      <h1>Trip Form</h1>
      <form className="pair-form" onSubmit={handleSubmit}>
        {/* Driver Selection */}
        <div>
          <label htmlFor="driver">Select Driver:</label>
          <select className="pair-form-select" id="driver" value={selectedDriver} onChange={handleDriverChange}>
            <option value="">Select a driver</option>
            {pairs.map((pair) => (
              <option key={pair.driver._id} value={pair.driver._id}>
                {pair.driver.name}
              </option>
            ))}
          </select>
        </div>

        {/* Passenger Selection (Multiple) */}
        <div>
          <label htmlFor="passengers">Select Passengers:</label>
          <select className="pair-form-select"
            id="passengers"
            value={selectedPassengers.map(passenger => passenger._id)}
            onChange={handlePassengerChange}
            
          >
            <option>Select Passengers</option>
            {passengers.map((passenger) => (
              <option key={passenger._id} value={passenger._id}>
                {passenger.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Passengers */}
        {selectedPassengers.length > 0 && (
          <div>
            <label htmlFor="selected-passengers">Selected Passengers:</label>
            <div id="selected-passengers">
              {selectedPassengers.map((passenger) => (
                <div key={passenger._id} className="selected-passenger">
                  <span>{passenger.name}</span>
                  <button 
                    type="button"
                    onClick={() => handleRemovePassenger(passenger._id)}
                    className="remove-btn button-p"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Organization Selection */}
        <div>
          <label htmlFor="organization">Select Organization:</label>
          <select className="pair-form-select"
            id="organization"
            value={selectedOrganization}
            onChange={handleOrganizationChange}
          >
            <option value="">Select an organization</option>
            {organizations?.map((organization) => (
              <option key={organization._id} value={organization._id}>
                {organization.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drop Trip Toggle */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={isDropTrip}
              onChange={handleDropTripToggle}
            />
            Is this a Drop Trip?
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button className="button-p" type="submit">{isUpdating ? "Update Trip" : "Submit Trip"}</button>
        </div>
      </form>

      {/* Display Pairs */}
      <div className="form-card-container">
        <h2>Pairs</h2>
        <div className="form-cards">
          {pairs.map((pair) => (
            <div key={pair._id} className="form-card">
              <h3>Vehicle: {pair.vehicle ? pair.vehicle.name : 'N/A'}</h3>
              <p><strong>Driver:</strong> {pair.driver ? pair.driver.name : 'N/A'}</p>
              <div className="form-passengers">
                <strong>Passengers:</strong>
                {pair.passengers.length > 0 ? (
                  pair.passengers.map((passenger, index) => (
                    <div key={index} className="form-passenger">
                      {passenger.id ? passenger.id.name : 'Unknown'} - {passenger.status}
                    </div>
                  ))
                ) : (
                  <p>No passengers</p>
                )}
              </div>
              <div className="form-status">
                <strong>Status:</strong> {pair.status}
              </div>
              {pair.isDropTrip && (
                <div className="form-drop-location">
                  <strong>Drop Location:</strong> ({pair.dropLocation?.latitude}, {pair.dropLocation?.longitude})
                </div>
              )}
              <div>
                <button className="button-p" onClick={() => handleUpdate(pair)}>Update</button>
                <button className="button-p" onClick={() => handleUnpair(pair._id)}>Unpair</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;
