import mongoose from "mongoose"



const connectDB = async ()=>{
  try {

    await mongoose.connect(process.env.MONGO);
    console.log("database connect successfully");

    //MONGO=mongodb+srv://user:user@cluster0.2l8rd.mongodb.net/
    
  } catch (error) {
    console.log(error);
  }
}

export default connectDB;