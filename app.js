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

const userSockets = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for the 'userConnected' event to store the user's socket ID
  socket.on("userConnected", (userId) => {
    // Store user socket ID against their unique user identifier (e.g., email, userId)
    userSockets[userId] = socket.id;
    console.log(userId)
    console.log(`User connected: ${userId} with Socket ID: ${socket.id}`);
  });

  // Listen for incoming location data from clients
  socket.on("sendLocation", (locationData) => {
    console.log("Location data received:", locationData);

    // Broadcast the location update to all connected clients
    io.emit("locationUpdate", locationData);
  });


  socket.on("sendOtp", async (userId) =>{
    const otp = crypto.randomInt(1000, 9999).toString();
    console.log(otp, userId);

    const userSocketId = userSockets[userId];
      if (userSocketId) {
        io.to(userSocketId).emit("receiveOtp", otp);
        console.log(`OTP sent to ${userId}`);
      } else {
        console.log(`User ${userId} is not connected.`);
      }
    await Otp.create({otp});
    io.emit("receiveOtp", {otp});
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});


server.listen(port, ()=>{
  console.log("app listening on port "+port);
})