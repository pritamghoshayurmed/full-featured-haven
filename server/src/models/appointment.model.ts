import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './user.model';
import { IDoctor } from './doctor.model';
import { IPatient } from './patient.model';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  NO_SHOW = 'no-show'
}

export enum AppointmentType {
  IN_PERSON = 'in-person',
  VIDEO = 'video',
  PHONE = 'phone'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export interface IAppointment extends Document {
  doctor: Types.ObjectId | IDoctor;
  patient: Types.ObjectId | IPatient;
  date: Date;
  startTime: string; // Format: HH:MM (24-hour)
  endTime: string; // Format: HH:MM (24-hour)
  status: AppointmentStatus;
  type: AppointmentType;
  reasonForVisit: string;
  symptoms?: string[];
  notes?: string;
  diagnosis?: string;
  prescription?: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }[];
  followUpDate?: Date;
  fee: number;
  payment: {
    amount: number;
    status: PaymentStatus;
    transactionId?: string;
    paidAt?: Date;
  };
  cancellationReason?: string;
  cancelledBy?: Types.ObjectId | IUser;
  isFeedbackProvided: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.PENDING
  },
  type: {
    type: String,
    enum: Object.values(AppointmentType),
    required: true
  },
  reasonForVisit: {
    type: String,
    required: true
  },
  symptoms: {
    type: [String]
  },
  notes: {
    type: String
  },
  diagnosis: {
    type: String
  },
  prescription: [
    {
      medication: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: String, required: true },
      notes: String
    }
  ],
  followUpDate: {
    type: Date
  },
  fee: {
    type: Number,
    required: true
  },
  payment: {
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING
    },
    transactionId: String,
    paidAt: Date
  },
  cancellationReason: {
    type: String
  },
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isFeedbackProvided: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);

export default Appointment; 