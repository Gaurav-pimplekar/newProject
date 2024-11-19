import express from "express"
import { sendOtp, verifyOtp, getOtp } from '../controller/auth.controller.js';
import { Driver } from "../module/driver.module.js";
import { Employee } from "../module/employee.module.js";
import Pair from "../module/pair.module.js";
import jwt from "jsonwebtoken"

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get("/get-otp", getOtp);


router.post('/login', async (req, res) => {
    const { mobile, password } = req.body;  // `password` will be used to validate the user

    try {
        // Check if the password is correct
        if (password !== "password") {
            return res.status(401).json({
                message: "Invalid credentials",
                status: "error",
                success: false,
                data: null
            });
        }

        // Check if the user is a driver
        const driver = await Driver.findOne({ mobile });
        if (driver) {
            // Generate JWT token for the driver
            const token = jwt.sign({ mobile }, "123", { expiresIn: '10h' });

            // Find the paired vehicle (if any)
            const pair = await Pair.findOne({ driver: driver._id }).populate("vehicle").populate("driver");

            return res.status(200).json({
                message: "Driver login successful",
                status: "success",
                success: true,
                data: { login: true, token, role:"driver" }
            });
        }

        // Check if the user is an employee
        const employee = await Employee.findOne({ phone_number: mobile });
        if (employee) {
            // Generate JWT token for the employee
            const token = jwt.sign({ mobile }, "123", { expiresIn: '1h' });

            // Find the pair if needed (Optional, depending on the use case)
            const pair = await Pair.findOne({ passengers: employee._id }).populate("vehicle").populate("driver");

            return res.status(200).json({
                message: "Employee login successful",
                status: "success",
                success: true,
                data: { login: true, token, role: "employee" }
            });
        }

        // If neither driver nor employee is found
        return res.status(404).json({
            message: "User not found",
            status: "error",
            success: false,
            data: null
        });

    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({
            message: "Server error",
            status: "error",
            success: false,
            data: error.message
        });
    }
});


export default router;
