import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EditVehicle.css';  // Optional: Import CSS for styling

const EditVehicle = () => {
  const { id } = useParams(); // Get the id from the URL
  const [vehicle, setVehicle] = useState({
    vehicle_number: '',
    vehicle_category: '',
    brand: '',
    model_type: '',
    fuel_type: '',
    vehicle_ownership: '',
    registration_date: '',
    insurance_valid: '',
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch vehicle details from the server
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/get/vehicle/${id}`);
        setVehicle(res.data?.vehicle);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicle details', error);
        setLoading(false);
      }
    };
    fetchVehicleDetails();
  }, [id]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission to update vehicle details
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:8080/update/vehicle/${id}`, vehicle);
      alert(res.data.message);
      navigate('/vehicles'); // Redirect to the vehicles list after successful update
    } catch (error) {
      console.error('Error updating vehicle', error);
      alert('Failed to update vehicle details');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="edit-vehicle">
      <h2>Edit Vehicle Details</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Vehicle Number:
          <input
            type="text"
            name="vehicle_number"
            value={vehicle.vehicle_number}
            onChange={handleChange}
          />
        </label>
        <label>
          Category:
          <input
            type="text"
            name="vehicle_category"
            value={vehicle.vehicle_category}
            onChange={handleChange}
          />
        </label>
        <label>
          Brand:
          <input
            type="text"
            name="brand"
            value={vehicle.brand}
            onChange={handleChange}
          />
        </label>
        <label>
          Model Type:
          <input
            type="text"
            name="model_type"
            value={vehicle.model_type}
            onChange={handleChange}
          />
        </label>
        <label>
          Fuel Type:
          <input
            type="text"
            name="fuel_type"
            value={vehicle.fuel_type}
            onChange={handleChange}
          />
        </label>
        <label>
          Vehicle Ownership:
          <input
            type="text"
            name="vehicle_ownership"
            value={vehicle.vehicle_ownership}
            onChange={handleChange}
          />
        </label>
        <label>
          Registration Date:
          <input
            type="date"
            name="registration_date"
            value={vehicle.registration_date}
            onChange={handleChange}
          />
        </label>
        <label>
          Insurance Valid Up To:
          <input
            type="date"
            name="insurance_valid"
            value={vehicle.insurance_valid}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditVehicle;
