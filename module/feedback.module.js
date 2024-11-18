import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    message:{
      type:String,
      
    }
  });
  
  // Feedback Model
  const Feedback = mongoose.model('Feedback', FeedbackSchema);
  
  // Export models
  export {Feedback}