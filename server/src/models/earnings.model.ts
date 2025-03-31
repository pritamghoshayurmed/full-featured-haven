import mongoose, { Document, Schema, Types } from 'mongoose';
import { IDoctor } from './doctor.model';
import { IAppointment } from './appointment.model';

export enum EarningType {
  APPOINTMENT = 'appointment',
  PRESCRIPTION = 'prescription',
  CONSULTATION = 'consultation',
  OTHER = 'other'
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed'
}

export interface IEarning extends Document {
  doctor: Types.ObjectId | IDoctor;
  appointment?: Types.ObjectId | IAppointment;
  amount: number;
  type: EarningType;
  description: string;
  date: Date;
  platformFee: number;
  netAmount: number;
  isPaid: boolean;
  payoutDate?: Date;
  payoutStatus: PayoutStatus;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const earningSchema = new Schema<IEarning>({
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(EarningType),
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  platformFee: {
    type: Number,
    required: true,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  payoutDate: {
    type: Date
  },
  payoutStatus: {
    type: String,
    enum: Object.values(PayoutStatus),
    default: PayoutStatus.PENDING
  },
  transactionId: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate net amount before saving
earningSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('platformFee')) {
    this.netAmount = this.amount - this.platformFee;
  }
  next();
});

const Earning = mongoose.model<IEarning>('Earning', earningSchema);

export default Earning; 