import express from "express";
import { Driver } from "../module/driver.module.js";
import { Employee } from "../module/employee.module.js";
import { Feedback } from "../module/feedback.module.js";
const router = express.Router();


// POST feedback
router.post('/feedback', async (req, res) => {
  const { employeeId, driverId, rating, message } = req.body;

  try {
    // Validate the input fields
    if (!employeeId || !driverId || rating === undefined || message === undefined) {
      return res.status(400).json({
        message: 'Employee ID, Driver ID, Rating, and Message are required.',
        status: 'error',
        success: false,
        data: null
      });
    }

    // Check if employee and driver exist in the database
    const employee = await Employee.findById(employeeId);
    const driver = await Driver.findById(driverId);

    if (!employee || !driver) {
      return res.status(404).json({
        message: 'Employee or Driver not found.',
        status: 'error',
        success: false,
        data: null
      });
    }

    // Create feedback object with message
    const feedback = new Feedback({
      employee: employeeId,
      driver: driverId,
      rating,
      message  // Include message from the request body
    });

    // Save feedback to the database
    await feedback.save();

    // Return success response with a custom message
    res.status(201).json({
      message: 'Feedback submitted successfully.',
      status: 'success',
      success: true,
      data: feedback
    });
    
  } catch (err) {
    // Catch any unexpected errors and respond with internal error message
    console.log(err);
    res.status(500).json({
      message: 'An error occurred while submitting feedback.',
      status: 'error',
      success: false,
      data: err.message
    });
  }
});


// GET all feedback for a specific driver
router.get('/feedbacks', async (req, res) => {
  try {
    // Fetch feedbacks with populated employee and driver details
    const feedbacks = await Feedback.find({}).populate("employee").populate("driver");

    // If no feedback is found, return a 404 error with a descriptive message
    if (feedbacks.length === 0) {
      return res.status(404).json({
        message: 'No feedback found',
        status: 'error',
        success: false,
        data: null
      });
    }

    // Return the feedbacks if found
    res.status(200).json({
      message: 'Feedbacks retrieved successfully',
      status: 'success',
      success: true,
      data: feedbacks
    });
  } catch (err) {
    // Catch any server errors and return a 500 error with the error message
    console.log(err);
    res.status(500).json({
      message: 'Internal server error',
      status: 'error',
      success: false,
      data: err.message
    });
  }
});

  

export default router;
