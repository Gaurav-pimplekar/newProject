// BlacklistedDrivers.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDrivers } from '../storage/adminStorage';
import axios from 'axios';

const BlacklistedDrivers = () => {
  const [blacklistedDrivers, setBlacklistedDrivers] = useState([]);
  const dispatch = useDispatch();
  const state = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(getDrivers()); // Fetch all drivers on component mount
  }, [dispatch]);

  // Filter blacklisted drivers
  useEffect(() => {
    const getBlock = async () => {
      try {
        const res = await axios.get(`https://worldtriplink.com/ets/getBlockDrivers`);
        // Reload vehicles after unblocking


        console.log(res);
        setBlacklistedDrivers(res?.data?.data);

      } catch (error) {
        console.log(error);
        alert(error.response.data.message);
      }
    }

    getBlock();
  }, [dispatch]);

  // Handle unblocking a driver
  const handleUnblockDriver = async (id) => {
    try {
      console.log(id);
      const res = await axios.patch(`https://worldtriplink.com/ets/unblockDriver/${id}`);

      const res2 = await axios.get(`https://worldtriplink.com/ets/getBlockDrivers`);
      // Reload vehicles after unblocking


      setBlacklistedDrivers(res2?.data?.data);
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };




  return (
    <div className="blacklisted-drivers-container">
      <h2>Blacklisted Drivers</h2>
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
            <th>Actions</th> {/* Action column for Unblock */}
          </tr>
        </thead>
        <tbody>
          {blacklistedDrivers?.map((driver, index) => (
            <tr key={driver._id}>
              <td>{index + 1}</td>
              <td>{driver.name}</td>
              <td>{driver.mobile}</td>
              <td>{driver.data_of_birth}</td>
              <td>{driver.license_id_number}</td>
              <td>{driver.license_expire_date}</td>
              <td>{driver.select_id_proof}</td>
              <td>
                <button
                  className="unblock-btn"
                  onClick={() => handleUnblockDriver(driver._id)}
                >
                  Unblock
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {blacklistedDrivers?.length === 0 && <p>No blacklisted drivers found.</p>}
    </div>
  );
};

export default BlacklistedDrivers;
