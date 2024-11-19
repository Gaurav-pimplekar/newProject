// Import dependencies
import Otp from '../module/otp.module.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Employee } from '../module/employee.module.js';
import { Driver } from '../module/driver.module.js';
import Pair from '../module/pair.module.js';

// Configure nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "maddison53@ethereal.email",
      pass: "jn7jnAPss4f63QBp6D",
    },
  });
  

// Generate and send OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
  try {
    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP to database
    await Otp.create({ email, otp });

    // Send OTP via email
    // const  info = await transporter.sendMail({
    //   from: "leola.zulauf64@ethereal.email",
    //   to: email,
    //   subject: 'Your OTP Code',
    //   text: `Your OTP code is ${otp}`,
    // });
    // console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    res.status(200).json({ message: 'OTP sent successfully', status: 200, success: true, data: null });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { otp, email } = req.body;
  
  if (!otp) {
    return res.status(400).json({
      message: 'Email and OTP are required',
      status: 400,
      success: false,
      data: { otpVerified: false },
    });
  }

  try {
    // Check if the OTP is valid
    const record = await Otp.findOne({ otp, email });
    if (!record) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
        status: 400,
        success: false,
        data: { otpVerified: false },
      });
    }

    // OTP is valid, delete it from the database
    await Otp.deleteOne({ otp, email });
    const employee = await Employee.findOne({email});
    const pair = await Pair.updateOne({"passengers.id": employee._id, "_id": req.pair._id}, { $set: { "passengers.$.status": "inCab" } })
    .populate("vehicle")
                .populate("driver")
                .populate({ path: "passengers.id", model: "Employee" })
                .populate({path: "canceledBy.id", model: "Employee" })

    const pair2 = await Pair.findById(req.pair._id)
    res.status(200).json({
      message: 'OTP verified successfully',
      status: 200,
      success: true,
      data: { otpVerified: true, pair: pair2 },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error verifying OTP',
      status: 500,
      success: false,
      data: { error, otpVerified: false },
    });
  }
};


export const getOtp = async (req, res) => {
  // const { email } = req.body;
  const { email } = req.employee
  console.log("emila:", email)
  const otps = await Otp.find({});
  console.log(otps);

  if (!email) {
    return res.status(400).json({
      message: 'Email is required',
      status: 400,
      success: false,
      data: {},
    });
  }

  try {
    // Fetch the OTP associated with the email
    const otpRecord = await Otp.findOne({ email });
    const otps = await Otp.find({});
    console.log(otps);

    if (!otpRecord) {
      return res.status(404).json({
        message: 'No OTP found for the provided email',
        status: 404,
        success: false,
        data: {},
      });
    }

    res.status(200).json({
      message: 'OTP retrieved successfully',
      status: 200,
      success: true,
      data: { otp: otpRecord.otp, email: otpRecord.email, createdAt: otpRecord.createdAt },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving OTP',
      status: 500,
      success: false,
      data: { error },
    });
  }
};




export const getEmployeeByMobileNo = async (req, res)=>{
  try {
    const {mobile} = req.body;

    const employee =await Employee.findOne({phone_number : mobile})

    if(!employee){
      res.status(402).json({
        message:"employee is not found with this number"
      })
    }
    else{
      res.status(201).json({
        employee
      })
    }
    
  } catch (error) {
    res.status(500).json({ message: 'Error with mobile number', error });
  }
}


export const getDriverByMobileNo = async (req, res)=>{
  try {
    const {mobile} = req.body;

    const driver =await Driver.findOne({mobile});

    if(!driver){
      res.status(402).json({
        message:"driver is not found with this number"
      })
    }
    else{
      res.status(201).json({
        driver
      })
    }
    
  } catch (error) {
    res.status(500).json({ message: 'Error with mobile number', error });
  }
}