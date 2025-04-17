
export const uploadToCloudinary = async (file: File, type: 'profile' | 'document') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', type === 'profile' ? 'doctor_profiles' : 'doctor_documents');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) throw new Error('Upload failed');
  return response.json(); 
};
