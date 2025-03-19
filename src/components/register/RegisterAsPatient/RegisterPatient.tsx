import React, { useState, ChangeEvent, FormEvent } from 'react';

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  sex: string;
  country: string;
  dateOfBirth: string;
  city: string;
  agreeTerms: boolean;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    sex: '',
    country: '',
    dateOfBirth: '',
    city: '',
    agreeTerms: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form Data:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        
    {/* Full Name */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Full Name
      </label>
      <input
      type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Enter your Full Name"
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
        name="phoneNumber"
        value={formData.phoneNumber}
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
    <p className="text-xs text-gray-600 mt-2">
    Password must contain:
    <ul className="list-disc list-inside">
      <li>At least 8 characters</li>
      <li>At least one Uppercase character (A-Z)</li>
      <li>At least one Lowercase character (a-z)</li>
      <li>At least one number (0-9)</li>
      <li>
        At least one Special character (~@@$%^&~,--\NUID;~.,7/)
      </li>
    </ul>
  </p>
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
      placeholder="Confirm your Password"
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
    </div>

    {/* Sex */}
    <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">Sex</label>
    <select
      name="sex"
      value={formData.sex}
      onChange={handleChange}
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
        placeholder="Enter your Country"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
        />
    </div>

    {/* Date of Birth */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Date of Birth
      </label>
      <input
        type="date"
        name="dateOfBirth"
        value={formData.dateOfBirth}
        onChange={handleChange}
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












