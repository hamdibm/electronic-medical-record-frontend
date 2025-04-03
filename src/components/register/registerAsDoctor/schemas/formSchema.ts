
import { z } from 'zod';

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
  phone: z.string().min(10, 'Phone number is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  speciality: z.string().min(1, 'Specialty is required'),
  uid: z.string().min(1, 'UID is required'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const documentsSchema = z.object({
  documents: z.array(z.instanceof(File))
    .min(1, 'At least one document is required')
    .max(3, 'Maximum 3 documents allowed')
    .refine(
      (files) => files.every(file => file.size <= 10 * 1024 * 1024), 
      'Files must be smaller than 10MB'
    ),
});

export const profilePictureSchema = z.object({
  profilePicture: z.instanceof(File).nullable().optional()
    .refine(file => file !== undefined, 'Profile picture is required')
    
});
