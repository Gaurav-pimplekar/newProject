import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import { Employee } from "../module/employee.module.js"; // Ensure the model is correctly imported

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
                    case 'Email':
                        rowObject.email = cell;
                        break;
                    case 'Contact no.':
                        rowObject.phone_number = cell;
                        break;
                    case 'Male /Female':
                        rowObject.gender = cell.toLowerCase(); // Ensure it matches "male" or "female"
                        break;
                    case 'Shift':
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

        // Insert data into MongoDB
        await Employee.insertMany(employeesToInsert);

        res.status(200).json({ message: "Data imported successfully!", data });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Error uploading file", error });
    }
});




export default router;
