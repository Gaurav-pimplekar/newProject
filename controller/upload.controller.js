import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import { Employee } from "../module/employee.module.js"; // Ensure the model is correctly imported
import bcrypt from "bcrypt"

const router = express.Router();

// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to handle Excel file upload
router.post("/excel/employees", upload.single("file"), async (req, res) => {
    try {
        // Read the file buffer from multer
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Use the correct variable name here
        const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }); // Get data as a 2D array
        const headers = sheetData[0]; // First row as headers
        const data = sheetData.slice(1).map(row => {
            const rowObject = {};
            row.forEach((cell, i) => {
                rowObject[headers[i]] = cell;
            });
            return rowObject;
        });

        const employeesToInsert = sheetData.slice(1).map(row => {
            const rowObject = {};
            row.forEach((cell, i) => {
                // Map the sheet data to your model fields
                switch (headers[i].trim()) {
                    case 'Employee Name':
                        rowObject.name = cell;
                        break;
                    case "Davies Employee ID Number":
                        rowObject.employeeId = cell;
                        break;
                    case 'Contact no.':
                        rowObject.phone_number = cell;
                        break;
                    case 'Male /Female':
                        rowObject.gender = cell.toLowerCase(); // Ensure it matches "male" or "female"
                        break;
                    case 'Timing':
                        rowObject.shift_time = cell;
                        break;
                    case 'Pickup':
                        rowObject.pickup_location = cell;
                        break;
                    case 'Drop Location':
                        rowObject.drop_location = cell;
                        break;
                    case 'Black List':
                        rowObject.black_list = cell.toLowerCase() === 'yes'; // Adjust based on your input
                        break;
                    case 'Driver':
                        // Assuming you have a Driver model and ID, handle accordingly
                        break;
                    default:
                        break;
                }
            });
            return rowObject;
        });


        for(const i in employeesToInsert){
            const emp = await Employee.findOne({phone_number: employeesToInsert[i].phone_number, email: employeesToInsert[i].email});

            if (!emp) {
                try {
                    // If the employee does not exist, insert into the database
                    console.log("employee is",employeesToInsert[i])
                    const password =await bcrypt.hash(`${employeesToInsert[i].employeeId}`, 10);
                    await Employee.create({...employeesToInsert[i], password});
                } catch (err) {
                    // Handle Mongoose duplicate key error or other errors
                    if (err.code === 11000) { // Duplicate key error code
                        console.log("Employee is already exist with phone", employeesToInsert[i].phone_number);
                    } else {
                        console.error("Error saving employee:", err);
                    }
                }
            } else {
                // If employee already exists, log and skip
                console.log(`Employee with ${employeesToInsert[i].email || employeesToInsert[i].phone_number} already exists. Skipping.`);
            }
        }

        // Response includes both inserted and skipped employees
        res.status(200).json({
            message: `employees imported successfully!`,
            
        });

    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Error uploading file", error });
    }
});




export default router;
