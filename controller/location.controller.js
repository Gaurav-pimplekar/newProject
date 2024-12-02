// controllers/location.controller.js

import { Location } from "../module/location.module.js";


// Get all locations for a user
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    res.status(200).json({
      message: "retrieve organization location successfully",
      status: 200,
      data: { locations }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving locations', error });
  }
};

// Create a new location
export const createLocation = async (req, res) => {
  const { name, latitude, longitude } = req.body;

  if (!name || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Organization, latitude, and longitude are required', status: 400, data: null });
  }


  try {
    const location = await Location.create({ name, latitude, longitude });


    res.status(201).json({ message: 'Location saved successfully', status: 201, data: { location } });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error saving location', error });

  }
};
