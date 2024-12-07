import express from "express"
import { sendOtp, verifyOtp, getOtp } from '../controller/auth.controller.js';
import { Driver } from "../module/driver.module.js";
import { Employee } from "../module/employee.module.js";
import Pair from "../module/pair.module.js";
import jwt from "jsonwebtoken"
import { verifyToken } from "../utils/jwt.js";
import bcrypt from "bcrypt"
import { Admin } from "../module/admin.module.js";

const router = express.Router();

router.post('/send-otp', verifyToken, sendOtp);
router.post('/verify-otp', verifyToken, verifyOtp);
router.get("/get-otp", verifyToken, getOtp);


router.post('/login', async (req, res) => {
    const { mobile, password } = req.body;  // `password` will be used to validate the user

    try {
        // Check if the password is correct
        // Check if the user is a driver
        const driver = await Driver.findOne({ mobile });
        const employee = await Employee.findOne({ phone_number: mobile });

        if (!driver && !employee) {
            return res.status(404).json({
                message: "User not found",
                status: "error",
                success: false,
                data: null
            });
        }
        else if (!employee) {

            const isCorrect =await bcrypt.compare(password, driver.password)

            if (!isCorrect) {
                return res.status(401).json({
                    message: "Invalid credentials, driver not found",
                    status: "error",
                    success: false,
                    data: null
                });
            }

            // Generate JWT token for the driver
            const token =await jwt.sign({ mobile }, process.env.SECRET_KEY);

            // Find the paired vehicle (if any)
            const pair = await Pair.findOne({ driver: driver._id }).populate("vehicle").populate("driver");

            return res.status(200).json({
                message: "Driver login successful",
                status: "success",
                success: true,
                data: { login: true, token, role: "driver" }
            });

        }
        else {

            const isCorrect2 =await bcrypt.compare(password, employee.password)


            if (isCorrect2 == false) {
                return res.status(401).json({
                    message: "Invalid credentials, employee not found",
                    status: "error",
                    success: false,
                    data: null
                });
            }

            // Generate JWT token for the employee
            const token = jwt.sign({ mobile }, process.env.SECRET_KEY);

            // Find the pair if needed (Optional, depending on the use case)
            const pair = await Pair.findOne({ passengers: employee._id }).populate("vehicle").populate("driver");

            return res.status(200).json({
                message: "Employee login successful",
                status: "success",
                success: true,
                data: { login: true, token, role: "employee" }
            });
        }



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


router.post('/forgot-password', async (req, res) => {
    const { mobile, password } = req.body;  // `mobile` is used to identify the user

    try {
        if (!mobile || !password) {
            return res.status(400).json({
                message: "Mobile & Password number is required",
                status: "error",
                success: false,
                data: null
            });
        }

        // Check if the user exists (driver or employee)
        const driver = await Driver.findOne({ mobile });
        const employee = await Employee.findOne({ phone_number: mobile });
        const newPassword =await bcrypt.hash(password, 10);

        if (!driver && !employee) {
            return res.status(404).json({
                message: "User not found",
                status: "error",
                success: false,
                data: null
            });
        }
        else if (!driver) {
            await Employee.findByIdAndUpdate(employee._id, { password: newPassword })

            return res.status(200).json({
                message: "Password updated successful",
                status: "success",
                success: true,
                data: null
            });
        }
        else {
            await Driver.findByIdAndUpdate(driver._id, { password: newPassword });

            return res.status(200).json({
                message: "Password updated successful",
                status: "success",
                success: true,
                data: null
            });
        }




    } catch (error) {
        console.error("Error in update password:", error);
        return res.status(500).json({
            message: "Server error",
            status: "error",
            success: false,
            data: error.message
        });
    }
});




// Create Account API
router.post('/admin/create-account', async (req, res) => {
    const { phone, password } = req.body;

    // Validate input fields
    if (!phone || !password) {
        return res.status(400).json({
            message: 'Phone, password, and email are required!',
            status: 'error',
            data: null,
            success: false
        });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
            message: 'Invalid phone number format. It should be 10 digits.',
            status: 'error',
            data: null,
            success: false
        });
    }

    // Check if the phone number already exists
    const existingAdminByPhone = await Admin.findOne({ phone });
    if (existingAdminByPhone) {
        return res.status(400).json({
            message: 'Phone number is already in use.',
            status: 'error',
            data: null,
            success: false
        });
    }

    try {
        // Create new admin
        const newpassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            phone,
            password: newpassword
        });

        // Save to the database
        await newAdmin.save();

        return res.status(201).json({
            message: 'Admin account created successfully!',
            status: 'success',
            data: { phone },
            success: true
        });

    } catch (error) {
        console.error('Error creating admin account:', error);
        return res.status(500).json({
            message: 'Server error!',
            status: 'error',
            data: null,
            success: false
        });
    }
});

// Admin Login API
router.post('/admin/login', async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({
            message: 'Phone and password are required!',
            status: 'error',
            data: null,
            success: false
        });
    }

    try {
        const admin = await Admin.findOne({ phone });
        if (!admin) {
            return res.status(404).json({
                message: 'User not found!',
                status: 'error',
                data: null,
                success: false
            });
        }

        console.log(admin)
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log(isMatch)
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid phone number or password!',
                status: 'error',
                data: null,
                success: false
            });
        }

        return res.status(200).json({
            message: 'Login successful!',
            status: 'success',
            data: { phone },
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error!',
            status: 'error',
            data: null,
            success: false
        });
    }
});

// Forgot Password API
router.post('/admin/forgot-password', async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({
            message: 'Phone & Password number is required!',
            status: 'error',
            data: null,
            success: false
        });
    }

    try {
        const admin = await Admin.findOne({ phone });
        if (!admin) {
            return res.status(404).json({
                message: 'User not found!',
                status: 'error',
                data: null,
                success: false
            });
        }

        // For simplicity, we'll reset the password to 'admin@123'
        console.log(password)
        const hashedPassword = await bcrypt.hash(password, 10);
        admin.password = hashedPassword;
        await admin.save();

        return res.status(200).json({
            message: "Password reset successful",
            status: 'success',
            data: { phone },
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error!',
            status: 'error',
            data: null,
            success: false
        });
    }
});



export default router;
