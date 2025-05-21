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
  
  export interface CollaborationCase{
    caseId: string;
    patientId: string;
    collabTitle: string;
    collaborators: string[];
    finalDecision?: FinalDecision;
    isClosed: boolean;
    createdAt: string;
    createdBy: string;
}
export interface FinalDecision {
    doctorId: string;
    content: string;
}
export interface BasicInfo {
    insuranceProvider?: string;
    insuranceNumber?: string;
    allergies?: string[];
    bloodType?: string;
    conditions?: string[];
    medications?: { name: string; dosage: string; frequency: string }[];
    recentVisits?: { date: Date; reason: string; doctor: string }[];
}

export interface Record {
  id: string;
  owner: string;
  patientName: string;
  age: number;
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  data: RecordEntry[];
  accessList: string[];
  accessHistory: string[];
  collabs: Case[];
  basicInfo?: BasicInfo;
  status: string;
}

export type RecordEntry=ClinicalNote | Prescription | Document;
export interface Data {
    type: 'ClinicalNote' | 'Prescription' | 'Document';
    specialty: string;
    doctorID: string;
}

export interface ClinicalNote extends Data {
    type: 'ClinicalNote';
    title: string;
    id: string;
    NoteType: string;
    NoteContent: string; 
    tags: string[];
}

export interface Prescription extends Data {
    type: 'Prescription';
    id: string;
    MedicationName: string;
    Dosage: string;
    Frequency: string;
    Duration: string;
    quantity: string;
    instructions?: string; 
    AdditionalNotes?: string; 
    status: string;
    
}

export interface Document extends Data {
    id : string;
    type: 'Document';
    documentUrls: string[];
    title: string;
    documentType: string;
    Description?: string; 
    tags: string[];
    file:File
}
export type CaseStatus = "Open" | "Closed" | "Urgent"
export type CaseType = "Consultation" | "Diagnosis" | "Treatment" | "Follow-up"
export type Case = {
  id: string
  title: string
  patientName: string
  patientId: string
  description: string
  status: CaseStatus
  type: CaseType
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    avatar: string
    specialty: string
  }
  participants: {
    id: string
    name: string
    avatar: string
    specialty: string
  }[]
  tags: string[]
  commentCount: number
  attachmentCount: number
  isStarred: boolean
}