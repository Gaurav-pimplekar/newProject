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
import { Employee } from "./module/employee.module.js";

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


    // Event: Trip starts
    socket.on('startTrip', async (pairId) => {
        try {
            // Find the trip using Pair ID
            const pair = await Pair.findById(pairId);
            if (pair) {
                pair.status = 'active'; // Set trip status to active
                await pair.save();

                const pairId = pair._id;
                users = {
                    ...users,
                    [pairId]: socket.id
                }

                // await Location.create({driverId, latitude, longitude})

                console.log("user and driver attach successfully")


                // Notify the driver and passengers
                io.emit(`tripStarted_${pair.driver._id}`, { message: 'Your trip has started.' });
                pair.passengers.forEach((passenger) => {
                    io.emit(`tripStarted_${passenger?.id}`, { message: 'Your trip has started.' });
                });
                console.log(`Trip started for pairId: ${pairId}`);
            }
        } catch (err) {
            console.error('Error starting trip:', err);
        }
    });

    // Event: Driver arrives at pickup location
    socket.on('driverArrived', async (employeeId) => {
        try {
            io.emit(`Arrive_${employeeId}`, { message: "driver arrive at your location" })
        } catch (err) {
            console.error('Error notifying driver arrival:', err);
        }
    });

    // Event: Send OTP to passenger
    socket.on('sendOtp', async ({ employeeId }) => {
        try {

            // Generate a 6-digit OTP
            const otp = crypto.randomInt(100000, 999999).toString();

            // Save OTP to database
            const otp2 = await Otp.create({ employeeId, otp });

            io.emit(`otpSent_${employeeId}`, { otp, createdAt: otp2.createdAt });

        } catch (err) {
            console.error('Error sending OTP:', err);
        }
    });

    // Event: Verify OTP
    socket.on('verifyOtp', async ({ otp, employeeId, driverId, pairId }) => {
        try {

            const verify = await Otp.findOne({ employeeId, otp });


            if (verify) {
                const pair = await Pair.updateOne({ "passengers.id": employeeId, "_id": pairId , "passengers.status": "waiting" }, { $set: { "passengers.$.status": "inCab" } }, {new: true})

                io.emit(`verifyOtp_${employeeId}`, { otp: true, pair, createdAt: verify.createdAt });
                io.emit(`verifyOtp_${driverId}`, { otp: true, pair, createdAt: verify.createdAt });
            }
            else {
                io.emit(`verifyOtp_${employeeId}`, { otp: false, createdAt: verify.createdAt });
                io.emit(`verifyOtp_${driverId}`, { otp: true, createdAt: verify.createdAt });
            }

        } catch (err) {
            console.error('Error verifying OTP:', err);
        }
    });


    socket.on(`noShowMore`,async (employeeId)=>{
        try {

            io.emit(`noShowMore_${employeeId}`, {noShow : true});
            
        } catch (error) {
            console.error('Error no show passenger:', error);
        }
    })


    socket.on("sendLocation", async ({long, late, pairId})=>{
        try {

            io.emit(`getLocation_${pairId}`, {long, late});
            
        } catch (error) {
            console.error("Error on send location", error);
        }
    })


    socket.on("pairEmployee", async ({pairId})=>{
        try {

            const pair = await Pair.findById(pairId).populate("vehicle")
            .populate("driver")
            .populate({ path: "passengers.id", model: "Employee" })
            .populate({ path: "canceledBy.id", model: "Employee" });

            if(pair){
                io.emit(`updatePair_${pairId}`, {pair});
            }
            
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("updateDriver", async ({driverId})=>{
        try {

            const pair = await Pair.findById(driverId).populate("vehicle")
            .populate("driver")
            .populate({ path: "passengers.id", model: "Employee" })
            .populate({ path: "canceledBy.id", model: "Employee" });

            if(pair){
                io.emit(`updateDriver_${driverId}`, {pair});
            }
            
        } catch (error) {
            console.log(error);
        }
    })

    socket.on("updateEmployee", async ({employeeId})=>{
        try {

            const pair = await Pair.findById(employeeId).populate("vehicle")
            .populate("driver")
            .populate({ path: "passengers.id", model: "Employee" })
            .populate({ path: "canceledBy.id", model: "Employee" });

            if(pair){
                io.emit(`updateEmployee_${employeeId}`, {pair});
            }
            
        } catch (error) {
            console.log(error);
        }
    })

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

                    Employee.findByIdAndUpdate(passengerId, {driver: null});

                    io.emit(`driverDropped_${passengerId}`, { message: 'You have been dropped off.' });
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


server.listen(port, () => {
    console.log("app listening on port " + port);
})





// PORT=8080
// MONGO_URL=mongodb+srv://gpimplekar:gaurav2001@cluster0.kxg9yaw.mongodb.net/test
// MONGO=mongodb+srv://user:user@cluster0.2l8rd.mongodb.net/
// SECRET_KEY=thisismysecretkey
// API_SECRET=Ro53YARPufzK69nYPewW4vIzi1I
// API_KEY=456748329592332
// EMAIL_USER="leola.zulauf64@ethereal.email"
// EMAIL_PASS="yVPhJWkKv73D8xMQ13"