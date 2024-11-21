import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import SellCar from "../pages/SellCar";
import Settings from "../pages/Settings";
import Employees from "../pages/Employees";
import AddEmployees from "../pages/AddEmployees";
import AddVehicle from "../pages/AddVehicles";
import Drivers from "../pages/Drivers"
import AddDrivers from "../pages/AddDrivers";
import Vehicles from "../pages/Vehicles";
import PairingVehicle from "../pages/PairingVehicle";
import PairingEmployees from "../pages/PairingEmployees"
import UploadExcelSheet from "../pages/UploadExcelSheet";
import BlacklistedCabs from "../pages/BlacklistedCabs";
import BlacklistedDrivers from "../pages/BlacklistedDrivers";
import EditDriver from "../pages/EditDriver";
import EditVehicle from "../pages/EditVehicle";

// import Drivers from "../pages/Drivers";

const Router = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" element={<Dashboard />} />}
      />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/sell-car" element={<SellCar />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/employees" element={<Employees/>} />
      <Route path="/addEmployees" element={<AddEmployees/>} />
      <Route path="/addVehicles" element={<AddVehicle/>} />
      <Route path="/Drivers" element={<Drivers/>} />
      <Route path="/blacklisted" element={<BlacklistedDrivers />} />
      <Route path="/addDrivers" element={<AddDrivers/>} />
      <Route path="/vehicles" element={<Vehicles/>} />
      <Route path="/blacklistedcab" element={<BlacklistedCabs />} /> 
      <Route path="/PairingVehicle" element={<PairingVehicle/>}/>
      <Route path="/PairingEmployees" element={<PairingEmployees/>}/>
      <Route path="/UploadExcelSheet" element={<UploadExcelSheet/>}/>
      <Route path="/edit-driver/:id" element={<EditDriver />} />
      <Route path="/edit-vehicle/:id" element={<EditVehicle />} />
      {/* <Route path="/drivers" element={<Drivers/>} /> */}
    </Routes>
  );
};

export default Router;
