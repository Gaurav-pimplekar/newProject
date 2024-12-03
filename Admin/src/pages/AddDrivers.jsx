import React, { useState } from 'react';
import '../styles/addDrivers.css'; // Import CSS
import { useDispatch } from 'react-redux';
import { addDriver } from '../storage/adminStorage';
import axios from 'axios'; // Make sure axios is installed

const AddDriver = () => {
  const [driverData, setDriverData] = useState({
    name: '',
    mobile: '',
    data_of_birth: '',
    driver_photo: '',
    license_id_number: '',
    license_expire_date: '',
    license_front_photo: '',
    license_back_photo: '',
    select_id_proof: '',
    id_proof_front_photo: '',
    id_proof_back_photo: '',
    pcc_document: ''
  });

  const [loading, setLoading] = useState(false); // Loading state
  const dispatch = useDispatch();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setDriverData({
        ...driverData,
        [name]: files[0] // Store the selected file
      });
    } else {
      setDriverData({
        ...driverData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData object
    const formData = new FormData();

    formData.append('name', driverData.name);
    formData.append('mobile', driverData.mobile);
    formData.append('data_of_birth', driverData.data_of_birth);
    formData.append('driver_photo', driverData.driver_photo);
    formData.append('license_id_number', driverData.license_id_number);
    formData.append('license_expire_date', driverData.license_expire_date);
    formData.append('license_front_photo', driverData.license_front_photo);
    formData.append('license_back_photo', driverData.license_back_photo);
    formData.append('select_id_proof', driverData.select_id_proof);
    formData.append('id_proof_front_photo', driverData.id_proof_front_photo);
    formData.append('id_proof_back_photo', driverData.id_proof_back_photo);
    formData.append('pcc_document', driverData.pcc_document);

    // Show loading indicator
    setLoading(true);

    try {
      // Send POST request to backend
      const response = await axios.post('https://worldtriplink.com/ets/addDriver', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check if the backend response is successful
      if (response.status === 200) {
        // Dispatch action to Redux if needed (optional)
        dispatch(addDriver(driverData));

        // Show success message
        alert('Submit Successfully');

        // Clear form fields after successful submission
        setDriverData({
          name: '',
          mobile: '',
          data_of_birth: '',
          driver_photo: '',
          license_id_number: '',
          license_expire_date: '',
          license_front_photo: '',
          license_back_photo: '',
          select_id_proof: '',
          id_proof_front_photo: '',
          id_proof_back_photo: '',
          pcc_document: ''
        });
      }
    } catch (error) {
      // Handle any errors (e.g., network issues, server errors)
      console.error('Error submitting driver data:', error);
      alert('Error submitting driver data. Please try again.');
    } finally {
      // Hide loading indicator after submission
      setLoading(false);
    }
  };

  return (
    <div className="add-driver-container">
      <div className='h2'>
        <h2>Add New Driver</h2>
      </div>
      <div className="details">
        <form onSubmit={handleSubmit} className="add-driver-form">
          <div className="form-row">
            <div className="form-group">
              <label>Driver Name:</label>
              <input
                type="text"
                name="name"
                value={driverData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Mobile Number:</label>
              <input
                type="text"
                name="mobile"
                value={driverData.mobile}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth:</label>
              <input
                type="date"
                name="data_of_birth"
                value={driverData.data_of_birth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Driver Photo:</label>
              <input
                type="file"
                name="driver_photo"
                accept="image/*"
                onChange={handleChange}
                
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>License ID No:</label>
              <input
                type="text"
                name="license_id_number"
                value={driverData.license_id_number}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>License Expiry Date:</label>
              <input
                type="date"
                name="license_expire_date"
                value={driverData.license_expire_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>License Front Photo:</label>
              <input
                type="file"
                name="license_front_photo"
                accept="image/*"
                onChange={handleChange}
                
              />
            </div>
            <div className="form-group">
              <label>License Back Photo:</label>
              <input
                type="file"
                name="license_back_photo"
                accept="image/*"
                onChange={handleChange}
                
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ID Proof Type:</label>
              <select
                name="select_id_proof"
                value={driverData.select_id_proof}
                onChange={handleChange}
                required
              >
                <option value="">Select ID Proof</option>
                <option value="Aadhar Card">Aadhar Card</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Driving License">Driving License</option>
              </select>
            </div>
            <div className="form-group">
              <label>ID Proof Front Photo:</label>
              <input
                type="file"
                name="id_proof_front_photo"
                accept="image/*"
                onChange={handleChange}
                
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ID Proof Back Photo:</label>
              <input
                type="file"
                name="id_proof_back_photo"
                accept="image/*"
                onChange={handleChange}
                
              />
            </div>
            <div className="form-group">
              <label>PCC Form: (Optional)</label>
              <input
                type="file"
                name="pcc_document"
                accept="application/pdf"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className='submit'>
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDriver;
