// models/location.model.js
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name:{
    type:String,
    required: true,
    unique: true
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
