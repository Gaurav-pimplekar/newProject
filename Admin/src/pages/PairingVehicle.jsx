import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/PairingVehicle.css";
import { useDispatch, useSelector } from "react-redux";
import { get_pair_vehicle_and_driver, pair_vehicle_and_driver, search_driver, search_vehicle, unpair_vehicle_and_driver } from "../storage/adminStorage";

const PairingVehicle = () => {
  const [driver, setDriver] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const dispatch = useDispatch();
  const state = useSelector(state => state.admin);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axios.get("https://worldtriplink.com/ets/getDrivers");
        setDriver(response.data);
      } catch (error) {
        console.error("Error fetching driver data", error);
      }
    };
    fetchDrivers();
  }, []);

  const handlePairDriver = (driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true); // Open the modal
  };

  const handleAddVehicle = (vehicle) => {
    console.log(`Vehicle added: ${vehicle.vehicle_number}`);
    console.log(selectedDriver);
    
    dispatch(pair_vehicle_and_driver({ vehicle: vehicle._id, driver: selectedDriver._id }));
    dispatch(get_pair_vehicle_and_driver());
    setIsModalOpen(false);
    setSearchTerm(false)
  };

  const handleSearchVehicle = (e) => {
    setVehicleSearchTerm(e.target.value);
    dispatch(search_vehicle(e.target.value));
  };

  console.log(state);
  useEffect(() => {
    console.log("useeffect call")
    dispatch(get_pair_vehicle_and_driver()).unwrap()
    .then((data) => console.log("Data:", data))
    .catch((error) => console.error("Error:", error));;
  }, []);

  const handleUnpairVehicle = async (paired) => {
    await dispatch(unpair_vehicle_and_driver({ vehicle: paired.vehicle._id, driver: paired.driver._id, pair: paired._id }));
    dispatch(get_pair_vehicle_and_driver());
  };

  return (
    <div className="pairing-vehicle-container">
      <h2>Pair Vehicle with Driver</h2>

      <div className="search_bar" style={{ display: "flex" }}>
        <input
          className="search"
          type="text"
          placeholder="Search by Driver Name"
          value={searchTerm}
          onChange={(e) => {dispatch(search_driver(e.target.value)); setSearchTerm(e.target.value)}}
        />
        
      </div>

      {/* Display the driver list only if there is a search term */}
      {state.search_driver.length == 0 ? <p>{state?.message}</p> :  (
        <div className="table">
          <div className="table_head">
            <table className="cab-list-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Driver Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                
                {state?.search_driver.map((driver, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{driver.name}</td>
                    <td>
                      {driver.paired === false && (
                        <button onClick={() => handlePairDriver(driver)}>
                          Pair Vehicle
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Vehicle List */}
      {isModalOpen && selectedDriver &&  (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2>Vehicle List for {selectedDriver.name}</h2>
            <input
              className="search"
              type="text"
              placeholder="Search Vehicle"
              value={vehicleSearchTerm}
              onChange={handleSearchVehicle}
            />
            {/* Display the vehicle list only if there is a search term */}
            {vehicleSearchTerm && (
              <table className="cab-list-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vehicle No</th>
                    <th>Action</th> {/* Added Action header */}
                  </tr>
                </thead>
                <tbody>
                  {state.search_vehicle.map((vehicle, index) => (
                    <tr key={vehicle.id}>
                      <td>{index + 1}</td>
                      <td>{vehicle.vehicle_number}</td>
                      <td>
                        {vehicle.paired === false && (
                          <button onClick={() => handleAddVehicle(vehicle)}>Pair</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Display Pairings */}
      {state?.paired_vehicle?.length > 0 && (
        <div className="pairing-list">
          <h2>Driver-Vehicle Pairings</h2>
          {state.paired_vehicle.map((pairing, index) => (
            <div key={index} className="pairing-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p><strong>Driver:</strong> {pairing?.driver?.name}</p>
                <p><strong>Vehicle:</strong> {pairing?.vehicle?.vehicle_number}</p>
              </div>
              <button onClick={() => handleUnpairVehicle(pairing)}>Unpair</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PairingVehicle;
