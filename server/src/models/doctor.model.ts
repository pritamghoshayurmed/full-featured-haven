import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './user.model';

export interface IDoctor extends Document {
  user: Types.ObjectId | IUser;
  specialization: string;
  qualifications: string[];
  experience: number; // In years
  hospitalAffiliations: string[];
  licenseNumber: string;
  consultationFee: number;
  bio: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  availability: {
    day: string;
    startTime: string; // Format: HH:MM (24-hour)
    endTime: string; // Format: HH:MM (24-hour)
  }[];
  rating: number;
  reviewCount: number;
  isAvailableForConsultation: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Please add a specialization']
  },
  qualifications: {
    type: [String],
    required: [true, 'Please add qualifications']
  },
  experience: {
    type: Number,
    required: [true, 'Please add experience in years']
  },
  hospitalAffiliations: {
    type: [String]
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please add a license number'],
    unique: true
  },
  consultationFee: {
    type: Number,
    required: [true, 'Please add a consultation fee']
  },
  bio: {
    type: String,
    required: [true, 'Please add a bio']
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  availability: [
    {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
      },
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      }
    }
  ],
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isAvailableForConsultation: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema);

export default Doctor; 