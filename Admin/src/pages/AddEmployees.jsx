import React, { useState } from "react";
import "../styles/addEmployees.css";
import { useDispatch } from "react-redux";
import { addEmployee } from "../storage/adminStorage";
import axios from "axios";

const AddEmployeeForm = () => {
  const [name, setName] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("male");
  const [email, setEmail] = useState("");
  const [pickup_location, setPickupLocation] = useState("");
  const [drop_location, setDropLocation] = useState("");
  const [shift_time, setShiftTime] = useState("");
  const [loading, setLoading] = useState(false); // To handle loading state
  const dispatch = useDispatch();

  // Check for duplicate employee based on phone number or email
  const checkForDuplicateEmployee = async () => {
    try {
      const response = await axios.get(`https://worldtriplink.com/ets/checkEmployee`, {
        params: { phone_number, email }
      });
      return response.data.exists; // Assuming backend returns { exists: true/false }
    } catch (error) {
      console.error("Error checking for duplicate employee", error);
      return false; // If there was an error, assume no duplicate
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data for submission
    const newEmployee = {
      name,
      phone_number,
      gender,
      email,
      pickup_location,
      drop_location,
      shift_time,
    };

    // Check for duplicate employee before submitting
    const isDuplicate = await checkForDuplicateEmployee();
    if (isDuplicate) {
      alert("This employee already exists. Duplicate data found.");
      return; // Prevent form submission if it's a duplicate
    }

    try {
      // Set loading to true to show a loading indicator (optional)
      setLoading(true);

      // Send data to the backend using axios (or your backend request method)
      const response = await axios.post('https://worldtriplink.com/ets/addEmployee', newEmployee);
      
      if (response.status === 200) {
        // If the request is successful, show a success message
        alert("Submit Successfully");
        
        // Clear the form after successful submission
        setName("");
        setPhoneNumber("");
        setGender("male");
        setEmail("");
        setPickupLocation("");
        setDropLocation("");
        setShiftTime("");
        
        // Optionally dispatch the action to update your state if necessary
        dispatch(addEmployee(newEmployee));
      }
    } catch (error) {
      // Handle error if the backend request fails
      console.error("Error submitting employee data", error);
      alert("Error submitting employee data. Please try again.");
    } finally {
      // Set loading to false after submission (even if it failed)
      setLoading(false);
    }
  };

  return (
    <div className="add-employee-form">
      <div>
        <h2 className="form-title">Add New Employee</h2>
      </div>
      <form onSubmit={handleSubmit} className="allform">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="Enter your Phone Number"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Pickup Location</label>
          <input
            type="text"
            placeholder="Enter your Pickup Location"
            value={pickup_location}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Drop Location</label>
          <input
            type="text"
            placeholder="Enter your Drop Location"
            value={drop_location}
            onChange={(e) => setDropLocation(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Shift Time</label>
          <input
            type="time"
            value={shift_time}
            onChange={(e) => setShiftTime(e.target.value)}
            required
          />
        </div>

        <div className="addbtn">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeForm;
