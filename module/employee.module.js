import mongoose from "mongoose";


const employeeSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },
  employeeId:{
    type:String,
    required: true
  },
  phone_number:{
    type:String,
    require:true,
    unique:true
  },
  gender:{
    type:String,
    require:true,
    enum:["male", "female"]
  },
  shift_time:{
    type:String,
    require:true
  },
  pickup_location:{
    type:String,
    require:true
  },
  drop_location:{
    type:String,
    require:true
  },
  black_list:{
    type:Boolean,
    default:false,
  },
  driver:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Driver",
    default: null
  },
  role:{
    type:String,
    default:"employee"
  },
  longitude:{
    type:Number
  },
  latitude:{
    type:Number
  },
  password:{
    type:String,
    require: true
  }
},{
  timestamps:true
})


const Employee = mongoose.model("Employee", employeeSchema);
export {Employee};