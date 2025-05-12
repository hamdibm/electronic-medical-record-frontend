import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStore } from '../../store/formStore';
import { documentsSchema } from '../../schemas/formSchema';
import { useDropzone } from 'react-dropzone';
import * as z from 'zod';
import axios from 'axios'


type DocumentsUploadInputs = z.infer<typeof documentsSchema>;

const DocumentsUploadStep: React.FC = () => {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  
  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<DocumentsUploadInputs>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
        documents: (formData.documents || []).filter(
  (file): file is File => file instanceof File && file.size > 0
),
    },
  });

  const documents = watch('documents');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalFiles = [...documents, ...acceptedFiles].slice(0, 3);
    setValue('documents', totalFiles);
  }, [documents, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/html': ['.html'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxFiles: 3,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    const updatedFiles = [...documents];
    updatedFiles.splice(index, 1);
    setValue('documents', updatedFiles);
  };

  const onSubmit = async (data: DocumentsUploadInputs) => {
    try {
      const uploadedUrls: string[] = [];
  
      for (const file of data.documents) {
        const form = new FormData();
        form.append('file', file);
        form.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        form.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
  
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          form
        );
  
        uploadedUrls.push(response.data.secure_url);
      }
  
      updateFormData({ documents: uploadedUrls });
      setCurrentStep(3);
  
    } catch (error) {
      console.error('Document upload failed:', error);
      alert('Failed to upload documents.');
    }
  };

  const onBack = () => {
    updateFormData({ documents });
    setCurrentStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Upload Documents</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <p className="text-lg font-medium text-purple-700">Drag & Drop your Documents Below / Click Below to Select File</p>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG, PDF, DOC, DOCX, HTML, TXT, CSV and Smaller than 10MB</p>
              <p className="text-sm text-gray-500 mt-1">Maximum 3 files allowed</p>
            </div>
          </div>
          {errors.documents && <p className="text-red-500 text-sm mt-2">{errors.documents.message}</p>}
        </div>
        
        {documents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Selected Files:</h3>
            <ul className="space-y-2">
              {documents.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
  {file && file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '0 MB'}
</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
export default DocumentsUploadStep;
