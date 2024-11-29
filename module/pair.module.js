import mongoose, { Schema } from "mongoose";


const pairSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        unique: true,
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        unique: true
    },
    passengers: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee"
        },
        status: {
            type: String,
            enum: ["inCab", "outCab", "waiting"],
            default: "waiting"
        }
    }],
    status: {
        type: String,
        enum: ["active", "completed", "upcoming"],
        default: "upcoming",
    },
    canceledBy: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee"
        },
        status: {
            type: String,
            enum: ["cancelByEmployee", "Employee Not Reach"]
        }
    }],
    isDropTrip:{
        type: Boolean,
        default: false
    },
    dropLocation: {
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        },
    }
}, {
    timestamps: true
})


// pairSchema.index({ vehicle: 1, driver: 1 }, { unique: true });

const Pair = mongoose.model("Pair", pairSchema);
export default Pair;