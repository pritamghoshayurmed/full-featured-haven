import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './user.model';

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export interface IPatient extends Document {
  user: Types.ObjectId | IUser;
  dateOfBirth: Date;
  gender: Gender;
  bloodType?: BloodType;
  height?: number; // in cm
  weight?: number; // in kg
  allergies?: string[];
  chronicConditions?: string[];
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
  }[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: Object.values(Gender),
    required: true
  },
  bloodType: {
    type: String,
    enum: Object.values(BloodType)
  },
  height: {
    type: Number
  },
  weight: {
    type: Number
  },
  allergies: {
    type: [String]
  },
  chronicConditions: {
    type: [String]
  },
  medications: [
    {
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: Date
    }
  ],
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phoneNumber: { type: String }
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  insuranceInfo: {
    provider: { type: String },
    policyNumber: { type: String },
    expiryDate: { type: Date }
  }
}, {
  timestamps: true
});

const Patient = mongoose.model<IPatient>('Patient', patientSchema);

export default Patient; 