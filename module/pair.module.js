import mongoose, { Schema } from "mongoose";


const pairSchema = new mongoose.Schema({
    vehicle:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Vehicle",
        unique:true,
    },
    driver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Driver",
        unique:true
    },
    passengers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Employee",
    }],
    status: {
        type: String,
        enum: ["active", "completed", "upcoming"],
        default: "upcoming",
    },
    canceledBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
    }],
},{
    timestamps: true
})


// pairSchema.index({ vehicle: 1, driver: 1 }, { unique: true });

const Pair = mongoose.model("Pair", pairSchema);
export default Pair;