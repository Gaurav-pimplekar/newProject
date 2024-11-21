import express from "express";
import upload from "../utils/multer.js";
import { Vehicle } from "../module/vehicle.module.js";
import { Driver } from "../module/driver.module.js";
const router = express.Router();


router.post(
  "/addVehicle",
  upload.fields([
    { name: "insurance_copy" },
    { name: "register_certificate_front" },
    { name: "register_certificate_back" },
    { name: "car_number_photo" },
  ]),
  async (req, res) => {
    try {
      // Extract vehicle data from the request body
      const vehicleData = {
        vehicle_number: req.body.vehicle_number,
        vehicle_category: req.body.vehicle_category,
        brand: req.body.brand,
        model_type: req.body.model_type,
        fuel_type: req.body.fuel_type,
        vehicle_ownership: req.body.vehicle_ownership,
        insurance_valid: req.body.insurance_valid,
        registration_date: req.body.registration_date,
      };

      // Create a new vehicle entry in the database
      const vehicle = await Vehicle.create(vehicleData);

      return res.status(201).json({
        message: "Vehicle added successfully",
        status: 201,
        success: true,
        data: vehicle,
      });
    } catch (error) {
      console.error("Error adding vehicle:", error);
      return res.status(500).json({
        message: "Error adding vehicle",
        status: 500,
        success: false,
        data: null,
        error: error.message,
      });
    }
  }
);




router.get("/getVehicles", async (req, res) => {
  try {
    // Fetch all vehicles that are not blacklisted
    const vehicles = await Vehicle.find({ black_list: false });

    // Respond with the list of vehicles
    return res.status(200).json({
      message: "Vehicles retrieved successfully",
      status: 200,
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.error("Error retrieving vehicles:", error);

    // Handle errors
    return res.status(500).json({
      message: "Error retrieving vehicles",
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});


router.get("/totalVehicles", async (req, res) => {
  try {
    // Fetch all vehicles
    const vehicles = await Vehicle.find();

    // Respond with the total number of vehicles
    return res.status(200).json({
      message: "Total vehicles retrieved successfully",
      status: 200,
      success: true,
      data: {
        totalVehicles: vehicles.length,
      },
    });
  } catch (error) {
    console.error("Error retrieving total vehicles:", error);

    // Handle errors
    return res.status(500).json({
      message: "Error retrieving total vehicles",
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});




router.get("/vehicles/:id", async (req, res) => {
  try {
    const vehicleId = req.params.id;

    // Fetch the vehicle by ID
    const vehicle = await Vehicle.findById(vehicleId);

    // Handle case where vehicle is not found
    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
        status: 404,
        success: false,
        data: null,
      });
    }

    // Respond with vehicle details
    return res.status(200).json({
      message: "Vehicle retrieved successfully",
      status: 200,
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Error fetching vehicle:", error);

    // Handle server errors
    return res.status(500).json({
      message: "Server error while retrieving vehicle",
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});



router.patch("/addVehicleToBlockList/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the vehicle by ID
    const vehicle = await Vehicle.findById(id);

    // Handle case where vehicle is not found
    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
        status: 404,
        success: false,
        data: null,
      });
    }

    // Check if the vehicle is paired (on a trip)
    if (vehicle.paired === true) {
      return res.status(400).json({
        message: "Vehicle is currently on a trip and cannot be blocked",
        status: 400,
        success: false,
        data: null,
      });
    }

    // Update the vehicle's blacklist status
    await Vehicle.findByIdAndUpdate(id, { black_list: true });

    return res.status(200).json({
      message: "Vehicle blocked successfully",
      status: 200,
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Error blocking vehicle:", error);

    return res.status(500).json({
      message: "Error blocking vehicle",
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});

router.get("/getBlockVehicles", async (req, res) => {
  try {
    // Fetch all vehicles that are in the blacklist
    const blockVehicles = await Vehicle.find({ black_list: true });

    // Return success response with the list of blocked vehicles
    res.status(200).json({
      message: "Blocked vehicles retrieved successfully",
      status: 200,
      success: true,
      data: blockVehicles,
    });
  } catch (error) {
    console.error("Error retrieving blocked vehicles:", error);

    // Handle server errors
    res.status(500).json({
      message: "Error retrieving blocked vehicles",
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});


router.patch("/unblockVehicle/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update the vehicle's blacklist status
    const vehicle = await Vehicle.findByIdAndUpdate(id, { black_list: false }, { new: true });

    // If the vehicle does not exist, return a 404 response
    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
        status: 404,
        success: false,
        data: null,
      });
    }

    // Success response
    res.status(200).json({
      message: "Vehicle unblocked successfully",
      status: 200,
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Error unblocking vehicle:", error);

    // Handle server errors
    res.status(500).json({
      message: "Error unblocking vehicle",
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});



router.put("/update/vehicle/:id", async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const { id } = req.params;

    // Update vehicle details by ID
    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, { ...data }, { new: true });

    // If the vehicle does not exist, return a 404 response
    if (!updatedVehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
        status: 404,
        success: false,
        data: null,
      });
    }

    // Success response
    res.status(200).json({
      message: "Vehicle updated successfully",
      status: 200,
      success: true,
      data: updatedVehicle,
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);

    // Handle server errors
    res.status(500).json({
      message: "Error updating vehicle",
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});


export default router