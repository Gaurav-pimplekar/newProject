import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./utils/db.js";
import userRouter from "./routes/user.route.js";
import employeeRouter from "./routes/employee.route.js";
import vehicleRouter from "./routes/vehicle.route.js";
import driverRouter from "./routes/driver.route.js";
import pairRouter from "./routes/pair.route.js";
import authRouter from "./routes/auth.route.js";
import locationRouter from "./routes/location.route.js";
import uploadRouter from "./controller/upload.controller.js";
import rescheduleRouter from "./routes/reschedule.route.js";
import feedbackRouter from "./routes/feedback.route.js";
import cors from "cors";
import crypto from "crypto";

import http from "http"; // Import http to create a server
import { Server } from "socket.io"; // Import Socket.io
import Otp from "./module/otp.module.js";
import { Socket } from "dgram";
import Pair from "./module/pair.module.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Employee } from "./module/employee.module.js";
import { Driver } from "./module/driver.module.js";
import { Vehicle } from "./module/vehicle.module.js";
import expressWs from "express-ws";

const app = express();
app.use(express.json());
app.use(cors());

const expressWsInstance = expressWs(app);
const { app: wsApp } = expressWsInstance;

app.use(employeeRouter);
app.use(vehicleRouter);
app.use(driverRouter);
app.use(pairRouter);
app.use(authRouter);
app.use(locationRouter);
app.use(uploadRouter);
app.use(rescheduleRouter);
app.use(feedbackRouter);
connectDB();

const port = process.env.PORT;

// Store socket ids to emit messages to specific users
let users = {};

const stringToJson = (data) => {
  return JSON.stringify(data);
};

const JsonToString = (data) => {
  return JSON.parse(data);
};

wsApp.ws("/ws", (ws, req) => {
  ws.on("message", async (data) => {
    const message = JSON.parse(data);
    switch (message.event) {
      case "startTrip":
        try {
          const { pairId } = message.data;
          // Find the trip using Pair ID
          const pair = await Pair.findById(pairId);
          if (pair) {
            pair.status = "active"; // Set trip status to active
            await pair.save();

            const pairId = pair._id;

            // await Location.create({driverId, latitude, longitude})

            console.log("user and driver attach successfully");

            // Notify the driver and passengers
            ws.send(`tripStarted_${pair.driver._id}`, {
              message: "Your trip has started.",
            });
            pair.passengers.forEach((passenger) => {
              ws.send(`tripStarted_${passenger?.id}`, {
                message: "Your trip has started.",
              });
            });
            console.log(`Trip started for pairId: ${pairId}`);
          }
        } catch (err) {
          console.error("Error starting trip:", err);
        }
        break;

      case "register":
        try {
            const {id} = message;

            users[id] = ws;

            console.log('user register successfully');
            
        } catch (error) {
            console.log(error);
        }
        break;

      case "driverArrived":
        try {
          const { employeeId } = message.data;
          ws.send(`Arrive_${employeeId}`, {
            message: "driver arrive at your location",
          });
        } catch (err) {
          console.error("Error notifying driver arrival:", err);
        }
        break;
      case "sendOtp":
        try {
          const { employeeId } = message.data;
          const otp = crypto.randomInt(100000, 999999).toString();

          // Save OTP to database
          const otp2 = await Otp.create({ employeeId, otp });

          ws.send(`otpSent_${employeeId}`, { otp, createdAt: otp2.createdAt });
        } catch (err) {
          console.error("Error sending OTP:", err);
        }
        break;
      case "verifyOtp":
        try {
          const { otp, employeeId, driverId, pairId } = message.data;
          const verify = await Otp.findOne({ employeeId, otp });

          if (verify) {
            const pair = await Pair.updateOne(
              {
                "passengers.id": employeeId,
                _id: pairId,
                "passengers.status": "waiting",
              },
              { $set: { "passengers.$.status": "inCab" } },
              { new: true }
            );

            const p = await Pair.findById(pairId)
              .populate("vehicle")
              .populate("driver")
              .populate({ path: "passengers.id", model: "Employee" })
              .populate({ path: "canceledBy.id", model: "Employee" });

            ws.send(`verifyOtp_${employeeId}`, {
              otp: true,
              pair: p,
              createdAt: verify.createdAt,
            });
            ws.send(`verifyOtp_${driverId._id}`, {
              otp: true,
              pair: p,
              createdAt: verify.createdAt,
            });
          } else {
            console.log("verifyOtp_", employeeId, driverId);
            ws.send(`verifyOtp_${employeeId}`, { otp: false });
            ws.send(`verifyOtp_${driverId._id}`, { otp: false });
          }
        } catch (err) {
          console.error("Error verifying OTP:", err);
        }
        break;
      case "noShowMore":
        try {
          const { employeeId } = message.data;
          ws.send(`noShowMore_${employeeId}`, { noShow: true });
        } catch (error) {
          console.error("Error no show passenger:", error);
        }
        break;
      case "sendLocation":
        try {
          const { long, late, pairId } = message.data;
          ws.send(`getLocation_${pairId}`, { long, late });
        } catch (error) {
          console.error("Error on send location", error);
        }
        break;
      case "pairEmployee":
        try {
          const { pairId } = message.data;
          const pair = await Pair.findById(pairId)
            .populate("vehicle")
            .populate("driver")
            .populate({ path: "passengers.id", model: "Employee" })
            .populate({ path: "canceledBy.id", model: "Employee" });

          if (pair) {
            ws.send(`updatePair_${pairId}`, { pair });
          }
        } catch (error) {
          console.log(error);
        }
        break;
      case "updateDriver":
        try {
          const { driverId } = message.data;
          const pair = await Pair.findOne({ driver: driverId })
            .populate("vehicle")
            .populate("driver")
            .populate({ path: "passengers.id", model: "Employee" })
            .populate({ path: "canceledBy.id", model: "Employee" });

          if (pair) {
            ws.send(`updateDriver_${driverId}`, { pair });
          }
        } catch (error) {
          console.log(error);
        }
        break;
      case "updateEmployee":
        try {
          const { employeeId } = message.data;
          const pair = await Pair.findOne({ "passengers.id": employeeId })
            .populate("vehicle")
            .populate("driver")
            .populate({ path: "passengers.id", model: "Employee" })
            .populate({ path: "canceledBy.id", model: "Employee" });

          if (pair) {
            ws.send(`updateEmployee_${employeeId}`, { pair });
          }
        } catch (error) {
          console.log(error);
        }
        break;
      case "driverDropPassenger":
        try {
          const { pairId, passengerId } = message.data;
          console.log("id", pairId, "+++++++", passengerId);
          // Validate pairId and passengerId
          // if (!isValidObjectId(pairId) || !isValidObjectId(passengerId)) {
          //     console.error('Invalid pairId or passengerId');
          //     return; // Return early if either ID is invalid
          // }

          // Fetch the pair with the given pairId
          const pair = await Pair.findById(pairId);
          if (!pair) {
            console.error("Pair not found");
            return;
          }

          // Check if the pair status is 'active'
          if (pair.status === "active") {
            // Find the passenger within the pair
            const passenger = pair.passengers.find(
              (p) => p.id.toString() === passengerId.toString()
            );

            if (passenger) {
              // Update passenger status to 'outCab'
              passenger.status = "outCab";

              // Save the updated pair
              await pair.save();

              // Update the employee record to remove the driver reference
              await Employee.findByIdAndUpdate(passengerId, { driver: null });

              console.log(
                `Passenger ${passengerId} has been dropped for pairId: ${pairId}`
              );

              // Emit the events to notify the passenger and driver
              ws.send(`driverDropped_${passengerId}`, {
                message: "You have been dropped off.",
              });
              ws.send("updateDriver", { driverId: pair.driver?._id });
            } else {
              console.error("Passenger not found in pair");
            }
          } else {
            console.error("Pair is not active");
          }
        } catch (err) {
          console.error("Error dropping passenger:", err);
        }
        break;
      case "addPair":
        try {
          // Find the pair by driver (assuming each driver can only have one pair)
          const data = message.data;
          //   data = JsonToString(data);
          const pair = await Pair.findOne({ driver: data.driver });

          // Transform incoming passengers into the required format
          const updatedPassengers = data.passengers.map((item) => {
            return { id: item._id }; // Assuming item is an object containing the full passenger data
          });
          console.log("----------------", updatedPassengers);
          // Check if the pair already has passengers
          if (pair) {
            // Find the current passengers in the pair
            const currentPassengers = pair.passengers.map((p) =>
              p.id.toString()
            ); // Convert ObjectId to string for easy comparison

            // Filter out the passengers who need to be removed (those not in the updated list)
            const passengersToRemove = currentPassengers.filter(
              (id) =>
                !data.passengers.some(
                  (passenger) => passenger._id.toString() === id
                )
            );

            // Filter out the new passengers that are not already in the pair
            const passengersToAdd = data.passengers.filter(
              (passenger) =>
                !currentPassengers.includes(passenger._id.toString())
            );

            // Remove the passengers from the Pair
            if (passengersToRemove.length > 0) {
              // Remove passengers from pair
              await Pair.findByIdAndUpdate(pair._id, {
                $pull: { passengers: { id: { $in: passengersToRemove } } },
              });
              // Also update the Employee's driver field to null for removed passengers
              await Employee.updateMany(
                { _id: { $in: passengersToRemove } },
                { $set: { driver: null } }
              );
            }

            // Add the new passengers
            if (passengersToAdd.length > 0) {
              await Pair.findByIdAndUpdate(pair._id, {
                $push: {
                  passengers: {
                    $each: passengersToAdd.map((p) => ({ id: p._id })),
                  },
                },
              });

              // Also update the Employee's driver field to the new driver for added passengers
              await Employee.updateMany(
                { _id: { $in: passengersToAdd.map((p) => p._id) } },
                { $set: { driver: data.driver } }
              );
            }

            // Update the drop trip status if it's changed
            await Pair.findByIdAndUpdate(pair._id, {
              isDropTrip: data.isDropTrip,
              dropLocation: data.organization,
            });

            const p = await Pair.findById(pair._id)
              .populate("vehicle")
              .populate("driver")
              .populate({ path: "passengers.id", model: "Employee" })
              .populate({ path: "canceledBy.id", model: "Employee" })
              .populate({ path: "dropLocation", model: "Location" });

            if (p) {
              p.passengers.forEach((item) => {
                const eventName = `updateEmployee_${item.id}`;
                ws.send(
                  JSON.stringify({
                    event: eventName,
                    data: { pair },
                  })
                );
              });
            }

            if (p) {
              const eventName = `updateDriver_${pair.driver._id}`;
              ws.send(
                JSON.stringify({
                  event: eventName,
                  data: { pair },
                })
              );
            }

            console.log("pair updated", p);
          } else {
            // If no pair exists for the driver, create a new pair
            const newPair = new Pair({
              driver: data.driver,
              passengers: updatedPassengers,
              isDropTrip: data.isDropTrip,
              dropLocation: data.organization,
            });

            // Save the new pair
            const pair = await newPair.save();

            // Update the employees (passengers) with the new driver
            await Employee.updateMany(
              { _id: { $in: data.passengers.map((p) => p._id) } },
              { $set: { driver: data.driver } }
            );

            if (pair) {
              updatedPassengers.forEach((item) => {
                const eventName = `updateEmployee_${item.id}`;
                ws.send(
                  JSON.stringify({
                    event: eventName,
                    data: { pair },
                  })
                );
              });
            }

            if (pair) {
                const eventName = `updateDriver_${pair.driver._id}`;
                ws.send(
                  JSON.stringify({
                    event: eventName,
                    data: { pair },
                  })
                );
            }

            console.log("pair added", pair);
          }

          // Retrieve updated pair information to send to clients
          const updatedPairs = await Pair.find({})
            .populate("vehicle")
            .populate("driver")
            .populate({ path: "passengers.id", model: "Employee" })
            .populate({ path: "canceledBy.id", model: "Employee" })
            .populate({ path: "dropLocation", model: "Location" });

          // Emit updated pair data to the frontend
          ws.send(
            JSON.stringify({ event: "getPair", data: { pair: updatedPairs } })
          );
        } catch (error) {
          console.log(error);
        }
        break;
      case "unpair":
        try {
          // Find the pair to unpair
          const { pairId } = message.data;
          const pair = await Pair.findById(pairId);

          // Unpair the driver
          const driver = await Driver.findById(pair.driver._id);
          driver.paired = false;
          await driver.save();

          // Unpair the vehicle
          const vehicle = await Vehicle.findById(pair.vehicle._id);
          vehicle.paired = false;
          await vehicle.save();

          // Unpair the passengers (set their driver to null)
          for (let passenger of pair.passengers) {
            const passengerObj = await Employee.findById(passenger.id);
            passengerObj.driver = null;
            await passengerObj.save();
          }

          // Remove the pair
          await Pair.findByIdAndDelete(pairId);

          // Emit updated pairs list
          const updatedPairs = await Pair.find().populate(
            "driver vehicle passengers"
          );
          ws.send("updatedPairs", { pairs: updatedPairs }); // Send updated pairs to frontend
        } catch (error) {
          console.error("Error during unpairing:", error);
        }
        break;

      default:
        break;
    }
  });
  // Handle disconnections
  ws.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    // Remove user from the users object
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

app.listen(port, () => {
  console.log("app listening on port " + port);
});

// PORT=8080
// MONGO_URL=mongodb+srv://gpimplekar:gaurav2001@cluster0.kxg9yaw.mongodb.net/test
// MONGO=mongodb+srv://user:user@cluster0.2l8rd.mongodb.net/
// SECRET_KEY=thisismysecretkey
// API_SECRET=Ro53YARPufzK69nYPewW4vIzi1I
// API_KEY=456748329592332
// EMAIL_USER="leola.zulauf64@ethereal.email"
// EMAIL_PASS="yVPhJWkKv73D8xMQ13"
