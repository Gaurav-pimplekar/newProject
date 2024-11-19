import mongoose from "mongoose"



const connectDB = async ()=>{
  try {

    await mongoose.connect("mongodb://localhost:27017/database");
    console.log("database connect successfully");
    
  } catch (error) {
    console.log(error);
  }
}

export default connectDB;