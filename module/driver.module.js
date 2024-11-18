import mongoose from "mongoose";


const DriverSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  mobile:{
    type:String,
    require:true,
    unique:true
  },
  data_of_birth:{
    type:String,
    require:true,
  },
  driver_photo:{
    type:String,
    // require:true,
  },
  license_id_number:{
    type:String,
    require:true,
    unique:true
  },
  license_expire_date:{
    type:String,
    require:true,
    unique:true
  },
  license_back_photo:{
    type:String,
    // require:true,
  },
  license_front_photo:{
    type:String,
    // require:true,
  },
  select_id_proof:{
    type:String,
    require:true,
  },
  id_proof_front_photo:{
    type:String,
    // require:true,
  },
  id_proof_back_photo:{
    type:String,
    // require:true,
  },
  pcc_document:{
    type:String,
    // require:true,
  },
  black_list:{
    type:Boolean,
    default:false,
  },
  paired:{
    type:Boolean,
    default:false
  },
  role:{
    type:String,
    default:"driver"
  }
},{
  timestamps:true
})


const Driver = mongoose.model("Driver", DriverSchema);
export {Driver};