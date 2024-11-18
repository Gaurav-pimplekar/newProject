// controllers/location.controller.js

import { Location } from "../module/location.module.js";


// Get all locations for a user
export const getAllLocations = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const locations = await Location.find({ userId });
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving locations', error });
  }
};

// Create a new location
export const createLocation = async (req, res) => {
  const { userId, latitude, longitude } = req.body;
    
  if (!userId || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'User ID, latitude, and longitude are required' });
  }

  
  try {
    const location= await Location.create({userId, latitude, longitude});
    

    res.status(201).json({ message: 'Location saved successfully', location });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error saving location', error });

  }
};
