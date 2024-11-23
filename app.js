import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./utils/db.js";
import userRouter from "./routes/user.route.js";
import employeeRouter from "./routes/employee.route.js"
import vehicleRouter from "./routes/vehicle.route.js"
import driverRouter from "./routes/driver.route.js"
import pairRouter from "./routes/pair.route.js"
import authRouter from "./routes/auth.route.js"
import locationRouter from "./routes/location.route.js";
import uploadRouter from "./controller/upload.controller.js"
import rescheduleRouter from "./routes/reschedule.route.js"
import feedbackRouter from "./routes/feedback.route.js"
import cors from "cors";
import crypto from "crypto";

import http from "http"; // Import http to create a server
import { Server } from "socket.io"; // Import Socket.io
import Otp from "./module/otp.module.js";
import { Socket } from "dgram";
import Pair from "./module/pair.module.js";
import mongoose from "mongoose";

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Specify allowed origins
    methods: ["GET", "POST"], // Specify allowed methods
  },
}); // Initialize Socket.io with the server


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

// When a new socket connects
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Registering users and drivers
    socket.on('registerUser', (userId) => {
        users[userId] = socket.id;
        console.log(`User registered: ${userId}`);
    });

    socket.on('registerDriver', (driverId) => {
        users[driverId] = socket.id;
        console.log(`Driver registered: ${driverId}`);
    });

    // Event: Trip starts
    socket.on('startTrip', async (pairId) => {
        try {
            // Find the trip using Pair ID
            const pair = await Pair.findById(pairId);
            if (pair) {
                pair.status = 'active'; // Set trip status to active
                await pair.save();

                // Notify the driver and passengers
                io.to(users[pair.driver.toString()]).emit('tripStarted', { message: 'Your trip has started.' });
                pair.passengers.forEach((passenger) => {
                    io.to(users[passenger.id.toString()]).emit('tripStarted', { message: 'Your trip has started.' });
                });
                console.log(`Trip started for pairId: ${pairId}`);
            }
        } catch (err) {
            console.error('Error starting trip:', err);
        }
    });

    // Event: Driver arrives at pickup location
    socket.on('driverArrived', async (pairId) => {
        try {
            const pair = await Pair.findById(pairId);
            if (pair && pair.status === 'active') {
                // Notify the driver and passengers
                io.to(users[pair.driver.toString()]).emit('driverArrived', { message: 'You have arrived at the pickup location.' });
                pair.passengers.forEach((passenger) => {
                    io.to(users[passenger.id.toString()]).emit('driverArrived', { message: 'Driver has arrived at your location.' });
                });
                console.log(`Driver arrived for pairId: ${pairId}`);
            }
        } catch (err) {
            console.error('Error notifying driver arrival:', err);
        }
    });

    // Event: Send OTP to passenger
    socket.on('sendOtp', async (pairId, otp) => {
        try {
            const pair = await Pair.findById(pairId);
            if (pair && pair.status === 'active') {
                // Notify the passenger
                pair.passengers.forEach((passenger) => {
                    io.to(users[passenger.id.toString()]).emit('otpSent', { otp });
                });
                console.log(`OTP sent for pairId: ${pairId} - OTP: ${otp}`);
            }
        } catch (err) {
            console.error('Error sending OTP:', err);
        }
    });

    // Event: Verify OTP
    socket.on('verifyOtp', async (pairId, otp) => {
        try {
            const pair = await Pair.findById(pairId);
            if (pair && pair.status === 'active') {
                // Notify the passenger that OTP is verified
                pair.passengers.forEach((passenger) => {
                    io.to(users[passenger.id.toString()]).emit('otpVerified', { message: 'OTP verified successfully!' });
                });
                console.log(`OTP verified for pairId: ${pairId}`);
            }
        } catch (err) {
            console.error('Error verifying OTP:', err);
        }
    });

    // Event: Driver drops off passenger
    socket.on('driverDropPassenger', async (pairId, passengerId) => {
        try {
            const pair = await Pair.findById(pairId);
            if (pair && pair.status === 'active') {
                // Update passenger status
                const passenger = pair.passengers.find((p) => p.id.toString() === passengerId.toString());
                if (passenger) {
                    passenger.status = 'outCab'; // Set the status to 'outCab'
                    await pair.save();

                    // Notify the passenger and driver
                    io.to(users[pair.driver.toString()]).emit('driverDropped', { message: `Driver dropped passenger ${passengerId}.` });
                    io.to(users[passengerId]).emit('driverDropped', { message: 'You have been dropped off.' });
                }
                console.log(`Driver dropped passenger ${passengerId} for pairId: ${pairId}`);
            }
        } catch (err) {
            console.error('Error dropping passenger:', err);
        }
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        // Remove user from the users object
        for (let userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
                break;
            }
        }
    });
});


server.listen(port, ()=>{
  console.log("app listening on port "+port);
})





// PORT=8080
// MONGO_URL=mongodb+srv://gpimplekar:gaurav2001@cluster0.kxg9yaw.mongodb.net/test
// MONGO=mongodb+srv://user:user@cluster0.2l8rd.mongodb.net/
// SECRET_KEY=thisismysecretkey
// API_SECRET=Ro53YARPufzK69nYPewW4vIzi1I
// API_KEY=456748329592332
// EMAIL_USER="leola.zulauf64@ethereal.email"
// EMAIL_PASS="yVPhJWkKv73D8xMQ13"