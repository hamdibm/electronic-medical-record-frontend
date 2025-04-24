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
    // createdAt: string;
    createdBy: string;
}
export interface FinalDecision {
    doctorId: string;
    content: string;
    // closedAt: string;
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
  collabs: CollaborationCase[];
  basicInfo?: BasicInfo;
  status: string;
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
export type RecordEntry=ClinicalNote | Prescription | Document;
export interface Data {
    type: 'ClinicalNote' | 'Prescription' | 'Document';
    speciality: string;
    doctorID: string;
}

export interface ClinicalNote extends Data {
    type: 'ClinicalNote';
    title: string;
    NoteType: string;
    NoteContent: string; 
    tags: string[];
}

export interface Prescription extends Data {
    type: 'Prescription';
    MedicationName: string;
    Dosage: string;
    Frequency: string;
    Duration: string;
    quantity: string;
    instructions?: string; 
    AdditionalNotes?: string; 
}

export interface Document extends Data {
    type: 'Document';
    documentUrls: string[];
    documentType: string;
    Description?: string; 
    tags: string[];
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