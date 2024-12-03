import React, { useEffect, useState } from 'react';
import '../styles/Vehicles.css';
import { useDispatch, useSelector } from 'react-redux';
import { getVehicles } from '../storage/adminStorage';
import axios from 'axios';

const CabList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({});
  const state = useSelector((state) => state.admin);
  const dispatch = useDispatch();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBlacklist = async (id) => {
    try {
      const res = await axios.patch(`https://worldtriplink.com/ets/addVehicleToBlockList/${id}`);
      dispatch(getVehicles());
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'An error occurred while blacklisting the vehicle.');
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle); // Set the vehicle to be edited
    setFormData(vehicle); // Populate form data with the selected vehicle details
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value })); // Update form data
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating vehicle with data:', formData); // Debug log
      const res = await axios.put(`https://worldtriplink.com/ets/update/vehicle/${editingVehicle._id}`, formData);

      if (res.status === 200) {
        alert(res.data.message || 'Vehicle updated successfully!');
        setEditingVehicle(null); // Exit edit mode
        dispatch(getVehicles()); // Refresh vehicle list
      } else {
        throw new Error('Failed to update the vehicle.');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error); // Log error
      alert(error.response?.data?.message || 'An error occurred while updating the vehicle.');
    }
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null); // Exit edit mode without saving
  };

  const filteredCabs = state?.vehicles?.filter((cab) =>
    cab.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cab.vehicle_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cab.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    dispatch(getVehicles()); // Load vehicles when component mounts
  }, [dispatch]);

  return (
    <div className="cablist">
      {editingVehicle ? (
        <div className="edit-vehicle">
          <h2>Edit Vehicle</h2>
          <form onSubmit={handleSaveEdit}>
            <div>
              <label>Vehicle Number:</label>
              <input
                type="text"
                name="vehicle_number"
                value={formData.vehicle_number || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Vehicle Category:</label>
              <input
                type="text"
                name="vehicle_category"
                value={formData.vehicle_category || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Brand:</label>
              <input
                type="text"
                name="brand"
                value={formData.brand || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Model Type:</label>
              <input
                type="text"
                name="model_type"
                value={formData.model_type || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Fuel Type:</label>
              <input
                type="text"
                name="fuel_type"
                value={formData.fuel_type || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Vehicle Ownership:</label>
              <input
                type="text"
                name="vehicle_ownership"
                value={formData.vehicle_ownership || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Registration Date:</label>
              <input
                type="date"
                name="registration_date"
                value={formData.registration_date || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Insurance Valid:</label>
              <input
                type="date"
                name="insurance_valid"
                value={formData.insurance_valid || ''}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit">Save</button>
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="title">
            <h2>Cab List</h2>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by Vehicle No, Brand or Category"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <table className="cablisttable">
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle No</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Model Type</th>
                <th>Fuel Type</th>
                <th>Vehicle Ownership</th>
                <th>Registration Date</th>
                <th>Insurance Valid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCabs?.map((cab, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{cab.vehicle_number}</td>
                  <td>{cab.vehicle_category}</td>
                  <td>{cab.brand}</td>
                  <td>{cab.model_type}</td>
                  <td>{cab.fuel_type}</td>
                  <td>{cab.vehicle_ownership}</td>
                  <td>{cab.registration_date}</td>
                  <td>{cab.insurance_valid}</td>
                  <td>
                    <button className="editbtn" onClick={() => handleEditVehicle(cab)}>
                      Edit
                    </button>
                    <button className="blacklistbtn" onClick={() => handleBlacklist(cab._id)}>
                      Blacklist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default CabList;
