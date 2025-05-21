import React, { useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFormStore } from '../../store/formStore';
import { profilePictureSchema } from '../../schemas/formSchema';
import { useDropzone } from 'react-dropzone';
import axios from 'axios'

type ProfilePictureInputs = z.infer<typeof profilePictureSchema>;

const ProfilePictureStep: React.FC = () => {
  
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  const { handleSubmit, setValue, formState: { errors }, watch } = useForm<ProfilePictureInputs>({
    resolver: zodResolver(profilePictureSchema),
    defaultValues: {
      profilePicture: null,
    },
  });

  const profilePicture = watch('profilePicture');

  // Set initial preview URL when component mounts
  useEffect(() => {
  
    if (formData.profilePicture instanceof File) {
      // Create new object URL
      const newPreviewUrl = URL.createObjectURL(formData.profilePicture);
      
      // Set the new preview URL
      setPreviewUrl(newPreviewUrl);
      
      // Clean up function to revoke the URL when component unmounts or effect re-runs
      return () => {
        URL.revokeObjectURL(newPreviewUrl);
      };
    }
  }, [formData.profilePicture]); 
  useEffect(() => {
    // Only cleanup when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);// Only depend on formData.profilePicture // Remove previewUrl from dependencies

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setValue('profilePicture', file);
      // Clean up previous preview URL if it exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
  }
  }, [setValue, previewUrl]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const onSubmit = async (data: ProfilePictureInputs) => {
    if (!data.profilePicture) {
      alert('Please select a profile picture before submitting.');
      return;
    }
  
    const form = new FormData();
    form.append('file', data.profilePicture);
    form.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); 
    form.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
  
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        form
      );
  
      const imageUrl = response.data.secure_url;
      
      // Mettre à jour le store avec l’URL au lieu du fichier
      updateFormData({ profilePicture: imageUrl });
  
      // Envoyer le formulaire final
      const formToSend = { ...formData, profilePicture: imageUrl, documents: formData.documents  };
      console.log('Data being sent to backend:', formToSend);

      try {
        const result = await axios.post(
          'http://localhost:3970/api/auth/registerDoctor',
          formToSend,
          { headers: { 'Content-Type': 'application/json' } }
        );
  
      const { data, status } = result.data;
      if (status.success) {
        console.log('Message: ', data.message);
        alert('Form submitted successfully!');
      } else {
        console.log('Error Message: ', status.errorMessages);
      }
  
    } catch (backendError) {
      console.error('Backend registration failed:', backendError);
      alert('Doctor registration failed.');
    }
  } catch (uploadError) {
    console.error('Cloudinary upload failed:', uploadError);
    alert('Image upload failed.');
  }
  };
  
  const onBack = () => {
    setCurrentStep(2);
  };

  const removeImage = () => {
    setValue('profilePicture', null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-800 to-blue-500 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-center text-white mb-8">Update Your Profile Picture</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center justify-center mb-8">
            {previewUrl ? (
              <div 
                className="relative w-48 h-48 rounded-full overflow-hidden bg-white cursor-pointer"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => document.getElementById('profile-upload')?.click()}
              >
                <img 
                  src={previewUrl} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
                {isHovering && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 bg-opacity-70 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                )}
                <input 
                  id="profile-upload" 
                  type="file" 
                  accept="image/jpeg, image/png" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue('profilePicture', file);
                      // Clean up previous preview URL if it exists
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                      }
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            ) : (
              <div {...getRootProps()} className="w-48 h-48 rounded-full bg-gray-100 cursor-pointer flex items-center justify-center">
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-purple-700 mt-2">Upload your image</span>
                </div>
              </div>
            )}
            
            {previewUrl && (
              <button
                type="button"
                onClick={removeImage}
                className="mt-5 px-4 py-2 bg-red-100 text-red-500 hover:bg-red-200 transition-colors rounded-md flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Image
              </button>
            )}
          </div>
          
          <div className="text-center text-white mb-8">
            <p>Upload a clear photo of yourself to help others recognize you.</p>
            <p>We recommend using a square image of at least 400×400 pixels.</p>
          </div>
          
          {errors.profilePicture && <p className="text-red-300 text-sm text-center mb-4">{errors.profilePicture.message}</p>}
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!profilePicture}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                profilePicture 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
                  : 'bg-blue-300 text-white cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePictureStep;