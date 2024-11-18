import dotenv from "dotenv";
dotenv.config();
import {v2 as cloudinary} from "cloudinary"

console.log(process.env.CLOUD_NAME)
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

export default cloudinary;