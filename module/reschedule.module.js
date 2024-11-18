import mongoose from 'mongoose';

const RescheduleSchema = new mongoose.Schema({
  resheduledata: { type: Date, required: true }, // Use String or another type based on your needs
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  resheduletime: { type: String, required: true },
});

const Reschedule = mongoose.model('Reschedule', RescheduleSchema);
export default Reschedule;
