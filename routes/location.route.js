// routes/location.route.js
import express from 'express';
import { getAllLocations, createLocation } from '../controller/location.controller.js';

const router = express.Router();

// Define routes
router.get('/location', getAllLocations); // Get all locations for a specific user
router.post('/location', createLocation); // Create a new location

export default router;
