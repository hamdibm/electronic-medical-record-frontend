export interface FormData {
    // Step 1: Personal Information
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    country: string;
    city: string;
    speciality: string;
    licenseNumber: string;
    termsAccepted: boolean;
   
    // Step 2: Documents
    documents:  string[] | File[] ;
    
    // Step 3: Profile Picture
    profilePicture?: File | undefined | null;
  }
  