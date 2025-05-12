import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios'
import {isValidPassword} from "@/lib/validatePassword";
import{toast} from "sonner" ;


interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  gender: string;
  country: string;
  age: string;
  city: string;
  agreeTerms: boolean;
}

const Register: React.FC = () => {
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    country: '',
    age: '',
    city: '',
    agreeTerms: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
  
    if (name === 'password') {
      const isValid = isValidPassword(value);
      setIsPasswordValid(isValid);
      setPasswordError(isValid ? '' : 'The password must contain at least 8 characters , An Uppercase letter , A Lowercase letter And a number');
    }
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const shouldDisableFields = !isPasswordValid;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
       
    if (!isPasswordValid) {
      alert('Veuillez corriger votre mot de passe avant de soumettre');
      return;
    }

    console.log('Form Data:', formData);
    toast.success("Account created successfully!");
    axios.post("http://localhost:3000/api/auth/registerPatient", formData, {headers: {
          'Content-Type': 'application/json'}}).then(result => { const { data, status } = result.data;

        if(status.success) {
          console.log("Message: ", data.message) 
        } else {
          console.log("Error Message: ", status.errorMessages)

        }
      })
      .catch(error => console.log(error))
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        
    {/* First Name */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        First Name
      </label>
      <input
      type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="Enter your First Name"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
    />
    </div>
  {/* Last Name */}
  <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Last Name
      </label>
      <input
      type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Enter your First Name"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
    />
    </div>

    {/* Email */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
       Email
      </label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
    />
    </div>

    {/* Phone Number */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
      Phone Number
      </label>
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Enter your Phone Number"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
    />
    </div>

    {/* Password */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Password
      </label>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your Password"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
    />
     {passwordError && (
            <div className="text-red-500 text-sm mt-1">{passwordError}</div>
          )}
    <div className="text-xs text-gray-600 mt-2">
    Password must contain:
    <ul className="list-disc list-inside">
      <li>At least 8 characters</li>
      <li>At least one Uppercase character (A-Z)</li>
      <li>At least one Lowercase character (a-z)</li>
      <li>At least one number (0-9)</li>
      
    </ul>

  </div>
  </div>

    {/* Confirm Password */}
    <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">
      Confirm Password
    </label>
    <input
      type="password"
      name="confirmPassword"
      value={formData.confirmPassword}
      onChange={handleChange}
      disabled={shouldDisableFields}
      placeholder="Confirm your Password"
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
    </div>

    {/* gender */}
    <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">Sex</label>
    <select
      name="gender"
      value={formData.gender}
      onChange={handleChange}
      disabled={shouldDisableFields}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
>
      <option value="">Select Sex</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
  </div>

    {/* Country */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Country
      </label>
      <input
        type="text"
        name="country"
        value={formData.country}
        onChange={handleChange}
        disabled={shouldDisableFields}
        placeholder="Enter your Country"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
        />
    </div>

    {/* age */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Age
      </label>
      <input
        type="number"
        name="age"
        value={formData.age}
        onChange={handleChange}
        disabled={shouldDisableFields}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
    />
    </div>

    {/* City */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        City
      </label>
      <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleChange}
        disabled={shouldDisableFields}
        placeholder="Select your City"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
    />
    </div>

      

        {/* Terms of Use */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              disabled={shouldDisableFields}
              className="mr-2"
              required
            />
            <span className="text-sm text-gray-700">
              By clicking here you agree with our Terms Of Use.
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};


export default Register;












