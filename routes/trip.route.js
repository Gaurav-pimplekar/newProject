import express from "express";
import Trip from "../module/trip.module.js"; // Adjust the import path as necessary
import Pair from "../module/pair.module.js"; // Ensure you import the Pair model
import { Employee } from "../module/employee.module.js";
import { verifyToken } from "../utils/jwt.js";

const router = express.Router();


// //to create new trip with driver and employee
// router.post("/trips/:pairId", async (req, res) => {
//     const { pairId } = req.params; // Get the pairId and employeeId from the request body

//     try {
//         // Validate if the pairId exists
//         const pair = await Pair.findById(pairId);
//         if (!pair) {
//             return res.status(404).json({ message: "Pair not found" });
//         }

//         // Create a new trip
//         const newTrip = new Trip({
//             pair: pairId,
//             status: "upcoming", // Set initial status to active
//         });

//         await newTrip.save(); // Save the new trip to the database

//         res.status(201).json({ message: "Trip created successfully", trip: newTrip });
//     } catch (error) {
//         console.error("Error creating trip:", error);
//         res.status(500).json({ message: "Server error", error });
//     }
// });

// //to change status to complete
// router.put("/trip/:id/complete", async (req, res) => {
//     const tripId = req.params.id; // Get the trip ID from the URL parameters

//     console.log(tripId);
//     try {
//         // Find the trip by ID
//         const trip = await Trip.findById(tripId);
//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found" });
//         }

//         // Check if the trip is already completed or canceled
//         if (trip.status === "completed") {
//             return res.status(400).json({ message: "Trip is already completed" });
//         }

//         // Update the trip status to completed
//         trip.status = "completed";

//         // Optionally, you can store the employeeId who completed the trip
//         // trip.completedBy = employeeId; // Uncomment this line if you want to store who completed the trip

//         await trip.save(); // Save the updated trip to the database

//         res.status(200).json({ message: "Trip completed successfully", trip });
//     } catch (error) {
//         console.error("Error completing trip:", error);
//         res.status(500).json({ message: "Server error", error });
//     }
// });


// //to return active status data
// router.get("/trips/activated", async (req, res) => {
//     try {
//         const completedTrips = await Trip.find({ status: "active" })
//             .populate({
//                 path: "pair",
//                 populate: [
//                     { path: "vehicle", model: "Vehicle" }, // Populate vehicle details
//                     { path: "driver", model: "Driver" }, // Populate driver details
//                     { path: "passengers", model: "Employee" }, // Populate each passenger's details
//                 ]
//             });

//         // Check if any completed trips exist
//         if (completedTrips.length === 0) {
//             return res.status(404).json({ message: "No active trips found" });
//         }

//         res.status(200).json(completedTrips); // Return the completed trips
//     } catch (error) {
//         console.error("Error fetching activate trips:", error);
//         res.status(500).json({ message: "Server error", error });
//     }
// });


// //to return complete status data
// router.get("/trips/completed",verifyToken, async (req, res) => {
//     try {
//         const pairs = await Pair.find({driver: req.driver._id});

//         const pairIds = pairs.map(pair => pair._id);
        
//         const trips = await Trip.find({
//             "pair": { $in: pairIds }  // Assuming the `pair` has a reference to the driver
//         })
//         .populate({
//             path: "pair",
//             populate: [
//                 { path: "vehicle", model: "Vehicle" }, // Populate vehicle details
//                 { path: "driver", model: "Driver" }, // Populate driver details
//                 { path: "passengers", model: "Employee" }, // Populate each passenger's details
//             ]
//         });

//             console.log(trips, req.driver._id, pairs);
//         // Return the found trips
//         res.json({
//             trips
//         })
//     } catch (error) {
//         console.error("Error fetching completed trips:", error);
//         res.status(500).json({ message: "Server error", error });
//     }
// });



// //to get upcoming trip data
// router.get("/trips/upcoming", async (req, res) => {
//     try {
//         const currentDate = new Date();

//         // Find trips with status "upcoming" and scheduledDate greater than the current date
//         const upcomingTrips = await Trip.find({
//             status: "upcoming"
//         })
//             .populate({
//                 path: "pair",
//                 populate: [
//                     { path: "vehicle", model: "Vehicle" },
//                     { path: "driver", model: "Driver" },
//                     { path: "passengers", model: "Employee" },
//                 ]
//             }); // Populate pair details if needed

//         // Check if any upcoming trips exist
//         if (upcomingTrips.length === 0) {
//             return res.status(404).json({ message: "No upcoming trips found" });
//         }

//         res.status(200).json(upcomingTrips); // Return upcoming trips
//     } catch (error) {
//         console.error("Error fetching upcoming trips:", error);
//         res.status(500).json({ message: "Server error", error });
//     }
// });






// router.get("/trips/pair/:pairId", async (req, res) => {
//     const { pairId } = req.params;

//     try {
//         // Find the trip by the provided pair ID
//         const trip = await Trip.findOne({ pair: pairId })
//             .populate({
//                 path: "pair",
//                 populate: [
//                     { path: "vehicle", model: "Vehicle" },
//                     { path: "driver", model: "Driver" },
//                     { path: "passengers", model: "Employee" },
//                 ]
//             })
//             .populate("canceledBy", "name email"); // Only populate certain fields for canceledBy

//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found with the given pair ID" });
//         }

//         res.status(200).json({
//             message: "Trip found successfully",
//             trip,
//         });
//     } catch (error) {
//         console.error("Error retrieving trip:", error.message);
//         res.status(500).json({ message: "Error retrieving trip", error: error.message });
//     }
// });





// //to cancel trip by employee
// router.put("/trips/:tripId/:employeeId/cancel", async (req, res) => {
//     const { tripId } = req.params;
//     const { employeeId } = req.params;

//     try {
//         // Check if the trip exists
//         const trip = await Trip.findById(tripId).populate("pair");
//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found" });
//         }

//         // Check if the employee is in the Pair's passengers list
//         const pair = await Pair.findById(trip.pair);
//         if (!pair) {
//             return res.status(404).json({ message: "Pair not found for this trip" });
//         }

//         // Ensure the employee is part of the passengers array
//         const employeeIndex = pair.passengers.findIndex(
//             (passenger) => passenger.toString() === employeeId
//         );


//         console.log(pair.passengers, employeeId);
//         if (employeeIndex === -1) {
//             return res.status(400).json({ message: "Employee is not a passenger in this trip" });
//         }

//         // Remove employee from passengers array
//         pair.passengers.splice(employeeIndex, 1);
//         await pair.save();

//         await Employee.findByIdAndUpdate(employeeId, { driver: null });
//         console.log(employeeId, pair);
//         // Add employee to canceledBy array in Trip
//         trip.canceledBy.push(employeeId);
//         trip.canceledAt.push(new Date());
//         await trip.save();

//         res.status(200).json({
//             message: "Trip canceled successfully for employee",
//             trip,
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Error canceling trip", error: error.message });
//     }
// });





export default router;