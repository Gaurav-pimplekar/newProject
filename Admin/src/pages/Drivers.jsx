import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDrivers } from '../storage/adminStorage';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import "../styles/Drivers.css";

const DriverList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const state = useSelector(state => state.admin); // Get state from redux
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    dispatch(getDrivers());
  }, [dispatch]);

  // Handle search term update
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter drivers based on search term (name, mobile, or license ID)
  const filteredDrivers = state.drivers.filter((driver) => {
    return (
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.mobile.includes(searchTerm) ||
      driver.license_id_number.includes(searchTerm)
    );
  });

  // Handle blacklisting a driver
  const handleBlacklistDriver = async (id) => {
    try {
      const res = await axios.patch(`https://worldtriplink.com/ets/addDriverToBlockList/${id}`);
      dispatch(getDrivers());
    } catch (error) {
      console.log();
      if(error.response.data.message){
        alert(error.response.data.message)
      }
      else{
        alert(error.message);
      }
    }
  };

  // Navigate to the BlacklistedDrivers page
  const handleShowBlacklist = () => {
    navigate('/blacklisted'); // Navigate to the blacklisted page
  };

  const handleEditDriver = (id) => {
    navigate(`/edit-driver/${id}`);
  };

  // Handle document dropdown change
  const handleDocumentChange = (driverId, documentType) => {
    console.log(`Selected document for driver ${driverId}: ${documentType}`);
    // Add logic to handle the selected document type
  };

  return (
    <div className="driver-list-container">
      <h2>Driver List</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Name, Mobile or License ID"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Blacklisted Drivers Button */}
      <button className="blacklistDriver" onClick={handleShowBlacklist}>
        Blacklisted Drivers
      </button>

      {/* Driver Table */}
      <table className="driver-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Date of Birth</th>
            <th>License ID</th>
            <th>License Expiry</th>
            <th>ID Proof Type</th>
            <th>Documents</th> {/* New column for Documents */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver, index) => (
              <tr key={driver._id}>
                <td>{index + 1}</td>
                <td>{driver.name}</td>
                <td>{driver.mobile}</td>
                <td>{driver.data_of_birth}</td>
                <td>{driver.license_id_number}</td>
                <td>{driver.license_expire_date}</td>
                <td>{driver.select_id_proof}</td>

                {/* Documents column with dropdown */}
                <td>
                  <select
                    onChange={(e) => handleDocumentChange(driver._id, e.target.value)}
                    className="documents-dropdown"
                  >
                    <option value="">Select Document</option>
                    <option value="driver_photo">Driver Photo</option>
                    <option value="license_front_photo">License Front Photo</option>
                    <option value="license_back_photo">License Back Photo</option>
                    <option value="id_proof_front_photo">ID Proof Front Photo</option>
                    <option value="id_proof_back_photo">ID Proof Back Photo</option>
                    <option value="pcc_document">PCC Form</option>
                  </select>
                </td>

                {/* Actions */}
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditDriver(driver._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="blacklist-btn"
                    onClick={() => handleBlacklistDriver(driver._id)}
                  >
                    Block
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">No drivers found matching the search term.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DriverList;
