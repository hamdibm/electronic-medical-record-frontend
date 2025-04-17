import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStore } from '../../store/formStore';
import { personalInfoSchema } from '../../schemas/formSchema';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

type PersonalInfoInputs = z.infer<typeof personalInfoSchema>;

const PersonalInfoStep: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  
  const { control, handleSubmit, formState: { errors } } = useForm<PersonalInfoInputs>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone,
      country: formData.country,
      city: formData.city,
      speciality: formData.speciality,
      licenseNumber: formData.licenseNumber,
      termsAccepted: formData.termsAccepted,
      
    },
  });

  const onSubmit = (data: PersonalInfoInputs) => {
    updateFormData(data);
    setCurrentStep(2);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
      <hr className="mb-6" />
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your first name"
                />
              )}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>
        </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your last name"
                />
              )}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                />
              )}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="********"
                />
              )}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="********"
                />
              )}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              )}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">License Number</label>
            <Controller
              name="licenseNumber"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123-4567"
                />
              )}
            />
            {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your country"
                />
              )}
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your city"
                />
              )}
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">speciality</label>
            <Controller
              name="speciality"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="speciality : cardiologist,diabetologist,etc"
                />
              )}
            />
            {errors.speciality && <p className="text-red-500 text-sm mt-1">{errors.speciality.message}</p>}
          </div>
          
          
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
          <div className="p-3 border rounded-md bg-white">
            <p className="text-sm text-gray-700">
              By accessing and using this platform, users (patients, doctors, and institutions) agree to comply with <a href="#" className="text-blue-600 hover:underline">these terms and conditions</a>.
            </p>
          </div>
          <div className="mt-2 flex items-center">
            <Controller
              name="termsAccepted"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              )}
            />
            <label className="ml-2 text-sm text-gray-700">
              I agree to the terms and conditions
            </label>
          </div>
          {errors.termsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAccepted.message}</p>}
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={() =>navigate('/')}
          >
            Back
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
};
export default PersonalInfoStep;
