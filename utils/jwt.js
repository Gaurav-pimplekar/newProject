import jwt from "jsonwebtoken";
import { Driver } from "../module/driver.module.js";
import { Employee } from "../module/employee.module.js";
import Pair from "../module/pair.module.js";

export const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];

    try {
        if (!token) {
            return res.status(400).json({
                message: "Authorization token is required",
                status: 400,
                success: false,
                data: null
            });
        }

        const isCorrect = await jwt.verify(token, process.env.SECRET_KEY);

        if (!isCorrect) {
            return res.status(401).json({
                message: "Invalid token. You are not authorized.",
                status: 401,
                success: false,
                data: null
            });
        }

        const { mobile } = isCorrect;

        const driver = await Driver.findOne({ mobile });
        const employee = await Employee.findOne({ phone_number: mobile });

        if (!driver && !employee) {
            return res.status(404).json({
                message: "Invalid email or mobile number",
                status: 404,
                success: false,
                data: null
            });
        }

        if (!driver) {
            // If employee exists, attach the employee and pair information to the request
            req.employee = employee;
            const pair = await Pair.findOne({ "passengers.id": employee._id })
                .populate("vehicle")
                .populate("driver")
                .populate({ path: "passengers.id", model: "Employee" });
            console.log(pair);
            req.pair = pair;
        } else {
            // If driver exists, attach the driver and pair information to the request
            req.driver = driver;
            
            const pair = await Pair.findOne({ driver })
                .populate("vehicle")
                .populate("driver")
            req.pair = pair;
            req.employee = employee
        }

        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error verifying token",
            status: 500,
            success: false,
            data: null,
            error: error.message
        });
    }
};