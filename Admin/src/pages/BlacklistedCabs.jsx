import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVehicles } from '../storage/adminStorage';
import axios from 'axios';

const BlacklistedCabs = () => {
    const [searchTerm, setSearchTerm] = useState(''); // State for search input
    const [vehicles, setVehicles] = useState([]);
    const state = useSelector(state => state.admin); // Getting vehicles from Redux state
    const dispatch = useDispatch();

    // Function to handle search input changes
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value); // Update searchTerm with user input
    };

    // Function to unblock a blacklisted vehicle
    const handleUnblock = async (id) => {
        try {
            const res = await axios.patch(`http://localhost:8080/unblockVehicle/${id}`);
            // Reload vehicles after unblocking
            const res2 = await axios.get(`http://localhost:8080/getBlockVehicles`);
            // Reload vehicles after unblocking


            setVehicles(res2?.data?.data)

        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    };





    useEffect(() => {
        const getBlock = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/getBlockVehicles`);
                // Reload vehicles after unblocking

                console.log(res);
                setVehicles(res?.data?.data)

            } catch (error) {
                console.log(error);
                alert(error.response.data.message);
            }
        }

        getBlock();
    }, [dispatch]);

    return (
        <div className="blacklisted-cabs">
            <div className="title">
                <h2>Blacklisted Vehicles</h2>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by Vehicle No, Brand or Category"
                    value={searchTerm}
                    onChange={handleSearchChange} // Update searchTerm on input change
                />
            </div>

            {/* Blacklisted Vehicles Table */}
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
                        <th>Insurance Valid Up To</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicles?.map((cab, index) => (
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
                                <button className="unblockbtn" onClick={() => handleUnblock(cab._id)}>Unblock</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BlacklistedCabs;
