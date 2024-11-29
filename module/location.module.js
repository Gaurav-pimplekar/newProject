// models/location.model.js
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  driverId: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
});

const Location = mongoose.model('Location', locationSchema);

export {Location}
