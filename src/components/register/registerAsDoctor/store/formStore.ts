import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { FormData } from '../../../../types';

interface FormState {
  currentStep: number;
  formData: FormData;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
}
const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  country: '',
  city: '',
  speciality: '',
  licenseNumber:'',
  termsAccepted: false,
  documents: [],
  profilePicture: null,
};

export const useFormStore = create<FormState>()(
  devtools(
    persist(
      (set) => ({
        currentStep: 1,
        formData: initialFormData,
        setCurrentStep: (step) => set({ currentStep: step }),
        updateFormData: (data) => 
          set((state) => ({ 
            formData: { ...state.formData, ...data } 
          })),
        resetForm: () => set({ formData: initialFormData, currentStep: 1 }),
      }),
      { name: 'form-storage' }
    )
  )
);
