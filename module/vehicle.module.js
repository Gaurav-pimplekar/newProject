import mongoose from "mongoose";


const vehicleSchema = new mongoose.Schema({
  vehicle_number:{
    type:String,
    required:true,
    unique:true
  },
  vehicle_category:{
    type:String,
    require:true,
  },
  brand:{
    type:String,
    require:true,
  },
  model_type:{
    type:String,
    require:true,
  },
  fuel_type:{
    type:String,
    require:true,
  },
  vehicle_ownership:{
    type:String,
    require:true,
  },
  insurance_valid:{
    type:String,
    require:true,
  },
  // insurance_copy:{
  //   type:String,
  //   require:true,
  //   unique:true
  // },
  // register_certificate_front:{
  //   type:String,
  //   require:true,
  // },
  // register_certificate_back:{
  //   type:String,
  //   require:true,
  // },
  registration_date:{
    type:String,
    require:true,
  },
  // car_number_photo:{
  //   type:String,
  //   require:true,
  // },
  black_list:{
    type:Boolean,
    default:false,
  },
  paired:{
    type:Boolean,
    default:false
  }
},{
  timestamps:true
})


const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export {Vehicle};