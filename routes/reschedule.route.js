import express from 'express';
import { Employee } from '../module/employee.module.js';
import Reschedule from '../module/reschedule.module.js';

const router = express.Router();

// Create a new reschedule notification
router.post('/reschedule', async (req, res) => {
  const { resheduledata, employee, resheduletime } = req.body;

  // Validate input
  if (!resheduledata || !employee || !resheduletime) {
    return res.status(400).json({
      message: 'All fields are required',
      status: 400,
      success: false,
      data: null,
    });
  }

  try {
    // Check if employee exists
    const existingEmployee = await Employee.findById(employee);
    if (!existingEmployee) {
      return res.status(404).json({
        message: 'Employee not found',
        status: 404,
        success: false,
        data: null,
      });
    }

    // Create a new Reschedule document
    const newReschedule = new Reschedule({
      resheduledata,
      employee,
      resheduletime,
    });

    // Save to the database
    await newReschedule.save();

    // Send success response
    res.status(201).json({
      message: 'Reschedule notification created successfully',
      status: 201,
      success: true,
      data: newReschedule,
    });
  } catch (error) {
    console.error('Error creating reschedule notification:', error);
    res.status(500).json({
      message: 'Server error',
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});


router.get('/reschedules', async (req, res) => {
  try {
    // Retrieve all reschedule entries
    const reschedules = await Reschedule.find().populate('employee'); // Populate to get employee details

    return res.status(200).json({
      message: 'Reschedules retrieved successfully',
      status: 200,
      success: true,
      data: reschedules,
    });
  } catch (error) {
    console.error('Error fetching reschedules:', error);
    return res.status(500).json({
      message: 'Server error',
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});


router.delete('/reschedule/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the reschedule entry exists
    const reschedule = await Reschedule.findById(id);

    if (!reschedule) {
      return res.status(404).json({
        message: 'Reschedule entry not found',
        status: 404,
        success: false,
        data: null,
      });
    }

    // Delete the reschedule entry
    await reschedule.remove();

    return res.status(200).json({
      message: 'Reschedule entry deleted successfully',
      status: 200,
      success: true,
      data: reschedule, // Optionally return the deleted document
    });
  } catch (error) {
    console.error('Error deleting reschedule entry:', error);
    return res.status(500).json({
      message: 'Server error',
      status: 500,
      success: false,
      data: null,
      error: error.message,
    });
  }
});


export default router;
