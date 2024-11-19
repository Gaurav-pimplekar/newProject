import express from "express";
import { Driver } from "../module/driver.module.js";
import { Vehicle } from "../module/vehicle.module.js";
import Pair from "../module/pair.module.js";
import mongoose from "mongoose"
import { Employee } from "../module/employee.module.js";
import Trip from "../module/trip.module.js";
import History from "../module/tripHistory.module.js";
import { verifyToken } from "../utils/jwt.js";
import cros from "node-cron";
import moment from "moment";

const router = express.Router();

router.get("/searchVehicle/:vehicleNumber", async (req, res) => {
  try {
    // Destructure vehicleNumber from the request parameters
    const { vehicleNumber } = req.params;

    // Create a case-insensitive regex to search for the vehicle number
    const regex = new RegExp("^" + vehicleNumber, 'i');

    // Search for vehicles that match the regex, are not paired, and not blacklisted
    const vehicles = await Vehicle.find({
      vehicle_number: { $regex: regex },
      paired: false,
      black_list: false
    });

    // If no vehicles are found, return a descriptive response
    if (vehicles.length === 0) {
      return res.status(404).json({
        message: "No vehicle found matching the criteria",
        status: "error",
        success: false,
        data: null
      });
    }

    // Return the found vehicles
    res.status(200).json({
      message: "Vehicles found successfully",
      status: "success",
      success: true,
      data: vehicles
    });
  } catch (error) {
    // Log and return error details for debugging
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      status: "error",
      success: false,
      data: error.message
    });
  }
});


router.get("/searchDriver/:driverName", async (req, res) => {
  try {
    // Destructure driverName from the request parameters
    const { driverName } = req.params;

    // Create a case-insensitive regex to search for the driver's name
    const regex = new RegExp("^" + driverName, 'i');

    // Search for drivers that match the regex, are not paired, and not blacklisted
    const drivers = await Driver.find({
      name: { $regex: regex },
      paired: false,
      black_list: false
    });

    // If no drivers are found, return a descriptive response
    if (drivers.length === 0) {
      return res.status(404).json({
        message: "No driver found matching the criteria",
        status: "error",
        success: false,
        data: null
      });
    }

    // Return the found drivers
    res.status(200).json({
      message: "Drivers found successfully",
      status: "success",
      success: true,
      data: drivers
    });
  } catch (error) {
    // Log and return error details for debugging
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      status: "error",
      success: false,
      data: error.message
    });
  }
});



router.get("/searchEmployee/:employeeName", async (req, res) => {
  try {
    // Destructure employeeName from the request parameters
    const { employeeName } = req.params;

    // Create a case-insensitive regex to search for the employee's name
    const regex = new RegExp("^" + employeeName, 'i');

    // Search for employees who match the regex, are not paired with a driver, and are not blacklisted
    const employees = await Employee.find({
      name: { $regex: regex },
      driver: null,
      black_list: false
    });

    // If no employees are found, return a descriptive response
    if (employees.length === 0) {
      return res.status(404).json({
        message: "No employee found matching the criteria",
        status: "error",
        success: false,
        data: null
      });
    }

    // Return the found employees
    res.status(200).json({
      message: "Employees found successfully",
      status: "success",
      success: true,
      data: employees
    });
  } catch (error) {
    // Log and return error details for debugging
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      status: "error",
      success: false,
      data: error.message
    });
  }
});



router.put("/unpair/:vehicle/:driver/:pair", async (req, res) => {
  try {
    // Destructure vehicle, driver, and pair from request parameters
    const { vehicle, driver, pair } = req.params;

    // Convert pair to ObjectId for accurate querying
    const pairId = new mongoose.Types.ObjectId(pair);

    // Find the pair to check if it is active
    const existingPair = await Pair.findById(pair);

    // If the pair is active, return an error message and prevent unpairing
    if (existingPair && existingPair.status === "active") {
      return res.status(400).json({
        message: "Pair is active and cannot be unpaired.",
        status: "error",
        success: false,
        data: null
      });
    }

    // If the pair is not active, proceed with unpairing the vehicle and driver
    const updatedVehicle = await Vehicle.findByIdAndUpdate(vehicle, { paired: false }, { new: true });
    const updatedDriver = await Driver.findByIdAndUpdate(driver, { paired: false }, { new: true });

    // Update employees who were assigned this driver to have no driver
    const updatedEmployees = await Employee.updateMany({ driver: pairId }, { driver: null });

    // Remove the pair record from the database
    await Pair.findByIdAndDelete(pair);

    // Respond with success
    res.status(200).json({
      message: "Unpaired data successfully",
      status: "success",
      success: true,
      data: {
        updatedVehicle,
        updatedDriver,
        updatedEmployeesCount: updatedEmployees.modifiedCount,
      }
    });
  } catch (error) {
    console.error("Error unpairing data:", error);

    // Return server error response
    res.status(500).json({
      message: "Error unpairing data",
      status: "error",
      success: false,
      data: error.message
    });
  }
});





router.post("/addPair/:vehicle/:driver", async (req, res) => {
  try {
    const { vehicle, driver } = req.params;

    // Check if the vehicle and driver are already paired
    const existingVehicle = await Vehicle.findById(vehicle);
    const existingDriver = await Driver.findById(driver);

    if (!existingVehicle || !existingDriver) {
      return res.status(404).json({
        message: "Vehicle or Driver not found",
        status: "error",
        success: false,
        data: null,
      });
    }

    if (existingVehicle.paired || existingDriver.paired) {
      return res.status(400).json({
        message: "Vehicle or Driver already paired",
        status: "error",
        success: false,
        data: null,
      });
    }

    // Create new pair
    const pairData = await Pair.create({ vehicle, driver });

    // Update the paired status of the vehicle and driver
    await Vehicle.findByIdAndUpdate(vehicle, { paired: true });
    await Driver.findByIdAndUpdate(driver, { paired: true });

    // Respond with success
    res.status(201).json({
      message: "Pair created successfully",
      status: "success",
      success: true,
      data: pairData,
    });
  } catch (error) {
    console.error("Error creating pair:", error);
    res.status(500).json({
      message: "Error creating pair",
      status: "error",
      success: false,
      data: error.message,
    });
  }
});


router.get("/getPairs", async (req, res) => {
  try {
    // Fetch pairs along with populated vehicle and driver data
    const pairs = await Pair.find({}).populate("vehicle").populate("driver").populate({ path: "passengers.id", model: "Employee" }).populate({ path: "canceledBy.id", model: "Employee" });

    // Check if no pairs are found
    if (pairs.length === 0) {
      return res.status(404).json({
        message: "No pairs found",
        status: "error",
        success: false,
        data: null,
      });
    }

    // Return the pairs data
    res.status(200).json({
      message: "Pairs retrieved successfully",
      status: "success",
      success: true,
      data: pairs,
    });
  } catch (error) {
    console.error("Error retrieving pairs:", error);
    res.status(500).json({
      message: "Error retrieving pairs",
      status: "error",
      success: false,
      data: error.message,
    });
  }
});



router.patch("/pairEmployee/:user/:pairId", async (req, res) => {
  try {
    const { user, pairId } = req.params;
    //const pairId = req.pair._id;

    // Find the employee by user ID
    const employee = await Employee.findById(user);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        status: "error",
        success: false,
        data: null
      });
    }

    // Find the pair by pairId
    const pair = await Pair.findById(pairId);
    if (!pair) {
      return res.status(404).json({
        message: "Pair not found",
        status: "error",
        success: false,
        data: null
      });
    }

    // Update the employee with the driver's pairId
    const updatedEmployee = await Employee.findByIdAndUpdate(user, { driver: pairId }, { new: true });

    // Add the employee to the passengers array in the pair
    const updatedPair = await Pair.findByIdAndUpdate(pairId, { $push: { passengers: { id: updatedEmployee._id } } }, { new: true });

    // Optional: Check for existing trip, if not create a new one
    // const trip = await Trip.findOne({ pair: pairId, status: "upcoming" });
    // if (!trip) {
    //   await Trip.create({ pair: pairId, status: "upcoming" });
    // }

    // Send the response back with updated employee and pair
    res.status(200).json({
      message: "Employee successfully paired with driver",
      status: "success",
      success: true,
      data: {
        employee: updatedEmployee,
        pair: updatedPair
      }
    });

  } catch (error) {
    console.error("Error pairing employee:", error);
    res.status(500).json({
      message: "Error pairing employee",
      status: "error",
      success: false,
      data: error.message
    });
  }
});


router.get("/getPairedEmployee", async (req, res) => {
  try {
    const pairs = await Pair.find()
      .populate('vehicle')        // Populate vehicle details
      .populate('driver')         // Populate driver details
      .populate({ path: "passengers.id", model: "Employee" });  // Populate employee details

    if (pairs.length === 0) {
      return res.status(404).json({
        message: "No pairs found",
        status: "error",
        success: false,
        data: null
      });
    }

    res.status(200).json({
      message: "Successfully fetched paired employees",
      status: "success",
      success: true,
      data: pairs
    });

  } catch (error) {
    console.error("Error fetching paired employees:", error);
    res.status(500).json({
      message: "Failed to fetch pair details",
      status: "error",
      success: false,
      data: error.message
    });
  }
});




router.patch("/unpairEmployee/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Convert the `id` from string to ObjectId
    const objectId =id

    // Update all pairs by removing the passenger with the given id
    const result = await Pair.updateMany(
      { "passengers.id": objectId }, // Find all pairs with this passenger
      { $pull: { passengers: { id: objectId } } } // Remove the passenger object from the passengers array
    );
    console.log(result);

    // Remove the driver's assignment from the employee
    const emp = await Employee.findByIdAndUpdate(objectId, { driver: null });
    console.log(emp, id);
    // Send success response
    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} pairs updated, passenger removed.`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Error removing passenger from pairs:', error);

    // Send error response
    return res.status(500).json({
      success: false,
      message: 'Error removing passenger from pairs',
      error: error.message
    });
  }
});


router.put("/trip/complete", verifyToken, async (req, res) => {
  try {
    // Check if pair data exists before proceeding
    if (!req.pair) {
      return res.status(400).json({
        success: false,
        message: "No pair data found. Unable to complete the trip."
      });
    }

    // Create a new history record to mark the trip as completed
    const trip = await History.create({
      driver: req.pair.driver,
      vehicle: req.pair.vehicle,
      passengers: req.pair.passengers,
      canceledBy: req.pair.canceledBy,
      status: "completed"
    });

    console.log(req.pair);

    // Remove the driver assignment from all passengers
    const updateEmployeeResult = await Employee.updateMany(
      { _id: { $in: req.pair.passengers } },
      { driver: null }
    );


    // Update the pair to clear canceledBy and passengers
    const updatedPair = await Pair.findByIdAndUpdate(req.pair._id, {
      canceledBy: [],
      passengers: [],
      status: "upcoming"
    });

    // If pair was not updated, handle the case
    if (!updatedPair) {
      return res.status(500).json({
        success: false,
        message: "Failed to update pair details. Try again later."
      });
    }

    // Send success response with trip data
    res.status(200).json({
      success: true,
      message: "Trip completed successfully",
      trip
    });

  } catch (error) {
    console.error('Error completing trip:', error);

    // Check for specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error: " + error.message
      });
    }

    // Handle MongoDB connection errors
    if (error.name === 'MongoError') {
      return res.status(500).json({
        success: false,
        message: "Database error: " + error.message
      });
    }

    // General error handling for unexpected errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});


router.put("/trip/active", verifyToken, async (req, res) => {
  try {
    // Check if pair data exists before proceeding
    if (!req.pair) {
      return res.status(400).json({
        success: false,
        message: "No pair data found. Unable to complete the trip."
      });
    }

    // Create a new history record to mark the trip as completed
    const trip = await Pair.findByIdAndUpdate(req.pair._id, { status: "active" }, {new: true});


    // Send success response with trip data
    res.status(200).json({
      success: true,
      message: "Trip actived successfully",
      trip
    });

  } catch (error) {
    console.error('Error completing trip:', error);

    // Check for specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error: " + error.message
      });
    }

    // Handle MongoDB connection errors
    if (error.name === 'MongoError') {
      return res.status(500).json({
        success: false,
        message: "Database error: " + error.message
      });
    }

    // General error handling for unexpected errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});


router.get("/api/todaysTripsCount", async (req, res) => {
  try {
    // Get start and end of the current day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Query to count documents created today
    const tripCount = await History.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Send the response
    res.status(200).json({
      success: true,
      data: { totalTrips: tripCount },
      message: "Successfully fetched today's trips count",
    });
  } catch (error) {
    console.error("Error fetching today's trips count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch today's trips count",
      error: error.message,
    });
  }
});


router.put("/cancel/employee/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Find the pair for the given trip
    const pair = await Pair.findById(req.pair._id);
    if (!pair) {
      return res.status(404).json({
        message: "Pair not found for this trip",
        status: 404,
        success: false,
        data: null
      });
    }

    // Check if the employee is part of the passengers array
    const employeeIndex = pair.passengers.findIndex(
      (passenger) => passenger.id.toString() === id
    );

    // If employee is not found in passengers, return an error
    if (employeeIndex === -1) {
      return res.status(400).json({
        message: "Employee is not a passenger in this trip",
        status: 400,
        success: false,
        data: null
      });
    }

    // Remove the employee from the passengers array
    pair.passengers.splice(employeeIndex, 1);
    await pair.save(); // Save the updated pair with removed passenger

    // Update the employee record to remove the driver assignment
    const employeeUpdate = await Employee.findByIdAndUpdate(id, { driver: null });
    if (!employeeUpdate) {
      return res.status(404).json({
        message: "Employee not found or failed to update employee",
        status: 404,
        success: false,
        data: null
      });
    }

    const pairId = new mongoose.Types.ObjectId(req.pair._id);
    // Add the employee to the canceledBy array
    const updatedPair = await Pair.findByIdAndUpdate(pairId, { $push: { canceledBy: { id: id, status: "Employee Not Reach" } } }, { new: true })
      .populate("vehicle")
      .populate("driver")
      .populate({ path: "passengers.id", model: "Employee" })
      .populate({ path: "canceledBy.id", model: "Employee" });

    console.log(updatedPair, req.pair, req.pair._id);

    res.status(200).json({
      message: "Trip canceled successfully for employee",
      status: 200,
      success: true,
      data: updatedPair
    });
  } catch (error) {
    console.error('Error canceling trip for employee:', error);

    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error: " + error.message,
        status: 400,
        success: false,
        data: null
      });
    }

    // Handle MongoDB specific errors
    if (error.name === 'MongoError') {
      return res.status(500).json({
        message: "Database error: " + error.message,
        status: 500,
        success: false,
        data: null
      });
    }

    // Handle any unexpected errors
    res.status(500).json({
      message: "Error canceling trip",
      status: 500,
      success: false,
      data: null,
      error: error.message
    });
  }
});



router.get("/trip/history/:period", verifyToken, async (req, res) => {
  try {
    const { period } = req.params;
    const now = new Date();
    let startDate;

    // Determine the start date based on the period
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0)); // Start of the day
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7); // 7 days ago
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1); // 1 month ago
        break;
      default:
        startDate = new Date(0); // Default to the beginning of time (or all records)
        break;
    }

    // Fetch trip history for the given period
    const tripHistory = await History.find({ driver: req.driver._id, createdAt: { $gte: startDate } })
      .populate("vehicle")
      .populate("driver")
      .populate({ path: "passengers", model: "Employee" })
      .populate({ path: "canceledBy", model: "Employee" });

    // Check if there are any trip records
    if (tripHistory.length === 0) {
      return res.status(404).json({
        message: "No trip history found for the given period",
        status: 404,
        success: false,
        data: []
      });
    }

    // Send the trip history data
    res.status(200).json({
      message: "Trip history retrieved successfully",
      status: 200,
      success: true,
      data: tripHistory
    });

  } catch (error) {
    console.error('Error fetching trip history:', error);

    res.status(500).json({
      message: "Failed to fetch trip history",
      status: 500,
      success: false,
      data: null,
      error: error.message
    });
  }
});






//block vehicle and driver if there insurance or license get expired
cros.schedule("0 0 * * *", async () => {
  try {

    const today = moment().format("YYYY-MM-DD");

    const expiredDrivers = await Driver.find({
      license_expire_date: { $lte: today },
      black_list: false
    })

    const expiredVehicle = await Vehicle.find({
      insurance_valid: { $lte: today },
      black_list: false
    })

    for (const driver of expiredDrivers) {
      driver.black_list = true; // Mark as blacklisted
      await driver.save(); // Save to the database
      console.log(`Driver ${driver.name} has been blacklisted due to expired license.`);
    }

    for (const vehicle of expiredVehicle) {
      vehicle.black_list = true; // Mark as blacklisted
      await vehicle.save(); // Save to the database
      console.log(`Vehicle ${vehicle.vehicle_number} has been blacklisted due to expired insurance.`);
    }


  } catch (error) {
    console.error("Error during the cron job:", error.message);

  }

})



router.post('/trip/history', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Both startDate and endDate are required.',
        status: 400,
        success: false,
        data: null,
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format.',
        status: 400,
        success: false,
        data: null,
      });
    }

    // Query for History based on authenticated user (Driver or Employee)
    const query = {
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    if (req.driver) {
      // If the user is a driver, filter history by driver
      query.driver = req.driver._id;
    } else if (req.employee) {
      // If the user is an employee, filter history by passengers (employee)
      query.passengers = req.employee._id;
    } else {
      return res.status(401).json({
        message: 'Unauthorized user.',
        status: 401,
        success: false,
        data: null,
      });
    }

    // Fetch the history records based on the above query
    const historyRecords = await History.find(query)
      .populate('vehicle')
      .populate('driver')
      .populate('passengers')
      .populate('canceledBy');

    return res.status(200).json({
      message: 'Trip history fetched successfully.',
      status: 200,
      success: true,
      data: historyRecords,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error fetching history records.',
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});



router.patch("/updatePassengerStatusOutCab/:passengerId",verifyToken, async (req, res) => {
  const { passengerId } = req.params;  // Get the passengerId from the URL
  const pairId = req.pair._id; // Get the pairId from the token (assumed to be set earlier in the auth middleware)

  if (!pairId) {
    return res.status(400).json({
      success: false,
      message: "Pair ID is missing in the token"
    });
  }

  try {
    // Convert passengerId and pairId to ObjectIds (in case they are not in ObjectId format)
    const passengerObjectId = mongoose.Types.ObjectId(passengerId);
    const pairObjectId = mongoose.Types.ObjectId(pairId);

    // Find the pair and update the passenger's status to "outCab"
    const result = await Pair.updateOne(
      { _id: pairObjectId, "passengers.id": passengerObjectId }, // Match the specific pair and passenger
      { $set: { "passengers.$.status": "outCab" } } // Update the passenger's status to 'outCab'
    );

    if (result.nModified === 0) {
      return res.status(404).json({
        success: false,
        message: "Pair or Passenger not found"
      });
    }

    // If the update was successful, return a success response
    return res.status(200).json({
      success: true,
      message: "Passenger status updated to 'outCab'",
    });

  } catch (error) {
    console.error('Error updating passenger status:', error);

    // Send error response if there was an issue
    return res.status(500).json({
      success: false,
      message: 'Error updating passenger status',
      error: error.message
    });
  }
});

export default router;