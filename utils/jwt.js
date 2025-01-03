import jwt from "jsonwebtoken";
import { Driver } from "../module/driver.module.js";
import { Employee } from "../module/employee.module.js";
import Pair from "../module/pair.module.js";

export const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

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

        const { mobile,role } = isCorrect;

        if (role == "driver") {
            const driver = await Driver.findOne({ mobile });
            if (!driver) {
                return res.status(404).json({
                    message: "Invalid password or mobile number",
                    status: 404,
                    success: false,
                    data: null
                });
            }
            const pair = await Pair.findOne({ driver : driver._id })
                .populate("vehicle")
                .populate("driver")
                .populate({ path: "passengers.id", model: "Employee" })
                .populate({ path: "canceledBy.id", model: "Employee" });
            req.pair = pair;
            req.user = driver;
            req.role = role;
        }
        else {
            const employee = await Employee.findOne({ phone_number: mobile });
            if (!employee) {
                return res.status(404).json({
                    message: "Invalid password or mobile number",
                    status: 404,
                    success: false,
                    data: null
                });
            }
            const pair = await Pair.findOne({ "passengers.id": employee._id })
                .populate("vehicle")
                .populate("driver")
                .populate({ path: "passengers.id", model: "Employee" });
            req.pair = pair;
            req.user = employee;
            req.role = role;
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