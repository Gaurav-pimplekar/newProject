import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/EditDriver.css';

const EditDriver = () => {
  const { id } = useParams(); // Get driver ID from URL params
  const navigate = useNavigate();
  
  const [driver, setDriver] = useState({
    name: '',
    mobile: '',
    data_of_birth: '',
    license_id_number: '',
    license_expire_date: '',
    select_id_proof: ''
  });

  // Fetch driver details by ID
  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/get/driver/${id}`);
        console.log(res);
        setDriver(res.data?.data);
      } catch (error) {
        alert('Error fetching driver details: ' + error.message);
      }
    };
    
    fetchDriverDetails();
  }, [id]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriver(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission (update driver)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`http://localhost:8080/update/driver/${id}`, driver);
      alert(res.data.message);
      navigate('/'); // Redirect to the driver list page after successful update
    } catch (error) {
      console.log(error);
      alert('Error updating driver: ' + error.message);
    }
  };

  return (
    <div className="edit-driver-container">
      <h2>Edit Driver</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={driver.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Mobile:</label>
          <input
            type="text"
            name="mobile"
            value={driver.mobile}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Date of Birth:</label>
          <input
            type="date"
            name="data_of_birth"
            value={driver.data_of_birth}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>License ID:</label>
          <input
            type="text"
            name="license_id_number"
            value={driver.license_id_number}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>License Expiry Date:</label>
          <input
            type="date"
            name="license_expire_date"
            value={driver.license_expire_date}
            onChange={handleChange}
            required
          />
        </div>
        

        <button type="submit" className="submit-btn">Save Changes</button>
      </form>
    </div>
  );
};

export default EditDriver;
