import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
    pair: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pair",
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "completed", "upcoming"],
        default: "active",
    },
    canceledBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
    }],
    canceledAt: [{
        type: Date,
    }],
    isDropTrip:{
        type: Boolean,
        default: false
    },
    dropLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location"
    }
}, {
    timestamps: true,
});

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
