import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  subject: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  message: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

export default mongoose.model('SupportTicket', supportTicketSchema);
