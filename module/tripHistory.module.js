import mongoose, { Schema } from "mongoose";


const tripHistoriSchema = new mongoose.Schema({
    vehicle:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Vehicle",
    },
    driver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Driver",
    },
    passengers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Employee",
    }],
    status: {
        type: String,
        default: "completed",
    },
    canceledBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
    }],
},{
    timestamps: true
})


// pairSchema.index({ vehicle: 1, driver: 1 }, { unique: true });

const History = mongoose.model("History", tripHistoriSchema);
export default History;