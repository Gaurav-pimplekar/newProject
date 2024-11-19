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

        const isCorrect = await jwt.verify(token, "123");

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

        let pair;

        if (!driver) {
            // If employee exists, attach the employee and pair information to the request
            req.employee = employee;
            pair = await Pair.findOne({ "passengers.id": employee._id })
                .populate("vehicle")
                .populate("driver")
                .populate({ path: "passengers.id", model: "Employee" })
                .populate({ path: "canceledBy.id", model: "Employee" });
            console.log("Pair for employee: ", pair); // Log the populated pair for employee
        } else {
            // If driver exists, attach the driver and pair information to the request
            req.driver = driver;
            pair = await Pair.findOne({ driver: driver._id })
                .populate("vehicle")
                .populate("driver")
                .populate({ path: "passengers.id", model: "Employee" })
                .populate({ path: "canceledBy.id", model: "Employee" });
            console.log("Pair for driver: ", pair); // Log the populated pair for driver
        }

        if (!pair) {
            return res.status(404).json({
                message: "Pair not found",
                status: 404,
                success: false,
                data: null
            });
        }

        req.pair = pair;
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
