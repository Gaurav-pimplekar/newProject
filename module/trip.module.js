import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
    pair: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pair",
        required: true,
    },
    // status: {
    //     type: String,
    //     enum: ["active", "completed", "upcoming"],
    //     default: "active",
    // },
    canceledBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
    }],
    canceledAt: [{
        type: Date,
    }],
}, {
    timestamps: true,
});

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
