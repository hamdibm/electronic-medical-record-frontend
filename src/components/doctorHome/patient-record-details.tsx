"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Heart,
  Phone,
  Home,
  Shield,
  Plus,
  Upload,
  PenLine,
  Pill,
  MessageSquare,
  Users,
  ChevronRight,
  Stethoscope,
  Brain,
  TreesIcon as Lungs,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  findRecordsForSpecificDoctor,
  updateRecord,
} from "../../assets/data/records";
import { NewCaseDialog } from "./new-case-dialog";
import { getDecodedToken } from "@/lib/jwtUtils";
import { getPrescriptions } from "@/assets/data/prescriptions";
import { ClinicalNote, Prescription } from "@/types";
import { getNotes } from "@/assets/data/clinicalNotes";

const token = getDecodedToken();
const doctorId = token?.userId;

if (!doctorId) {
  console.error("No doctor ID found in token");
}

const records = await findRecordsForSpecificDoctor(doctorId as string)
  .then((res) => {
    console.log("Fetched records for specific doctor:", res);
    return res;
  })
  .catch((err) => {
    console.error("Error fetching records:", err);
    return [];
  });

interface PatientRecordDetailProps {
  patientId: string;
  onBack: () => void;
  onCaseSelect?: (caseId: string) => void;
}

// const clinicalNotes = [
//   {
//     id: "1",
//     title: "Annual Checkup",
//     content:
//       "Patient presents for annual checkup. Blood pressure is 130/85, which is slightly elevated from previous visit. Discussed lifestyle modifications including reduced sodium intake and increased physical activity. Patient reports compliance with current medications. ECG shows normal sinus rhythm. Recommended follow-up in 3 months to reassess blood pressure.",
//     date: "2023-04-10",
//     specialty: "Cardiology",
//     doctor:  { name: "Unknown Doctor", specialty: "Unknown", avatar: "/placeholder.svg" }, // Add fallback
//     tags: ["Checkup", "Hypertension"],
//   },
//   {
//     id: "2",
//     title: "Medication Review",
//     content:
//       "Conducted comprehensive medication review. Patient reports good tolerance of current regimen. Metformin dosage adjusted from 500mg to 750mg twice daily due to persistent elevated fasting glucose levels. Discussed potential side effects and monitoring requirements. Patient demonstrates good understanding of medication purposes and administration.",
//     date: "2023-02-15",
//     specialty: "Endocrinology",
//     doctor:  { name: "Unknown Doctor", specialty: "Unknown", avatar: "/placeholder.svg" }, // Add fallback
//     tags: ["Medication", "Diabetes"],
//   },
//   // Continue with the same pattern for the remaining clinical notes
//   {
//     id: "3",
//     title: "Respiratory Assessment",
//     content:
//       "Patient reports occasional shortness of breath during moderate exertion. Lung examination reveals clear breath sounds bilaterally. No wheezing or crackles. Oxygen saturation 97% at rest. Recommended pulmonary function testing to establish baseline. Discussed importance of avoiding respiratory irritants.",
//     date: "2023-03-05",
//     specialty: "Pulmonology",
//     doctor:  { name: "Unknown Doctor", specialty: "Unknown", avatar: "/placeholder.svg" }, // Add fallback
//     tags: ["Respiratory", "Assessment"],
//   },
//   {
//     id: "4",
//     title: "Neurological Consultation",
//     content:
//       "Patient reports intermittent headaches, primarily frontal, lasting 2-3 hours. No aura or associated symptoms. Neurological examination normal. No focal deficits. Recommended headache diary and over-the-counter analgesics as needed. Will reassess in 6 weeks.",
//     date: "2023-01-20",
//     specialty: "Neurology",
//     doctor:  { name: "Unknown Doctor", specialty: "Unknown", avatar: "/placeholder.svg" }, // Add fallback
//     tags: ["Headache", "Consultation"],
//   },
// ]

// Sample medical files organized by specialty
const medicalFiles = [
  {
    id: "1",
    title: "ECG Report",
    filename: "ECG_Report_Smith_John_20230410.pdf",
    fileSize: "2.4 MB",
    date: "2023-04-10",
    specialty: "Cardiology",
    doctor: {
      name: "Unknown Doctor",
      specialty: "Unknown",
      avatar: "/placeholder.svg",
    }, // Dr. Sarah Johnson
    tags: ["ECG", "Cardiology"],
  },
  {
    id: "2",
    title: "Blood Work Results",
    filename: "Blood_Work_Smith_John_20230408.pdf",
    fileSize: "1.8 MB",
    date: "2023-04-08",
    specialty: "Internal Medicine",
    doctor: {
      name: "Unknown Doctor",
      specialty: "Unknown",
      avatar: "/placeholder.svg",
    }, // Dr. Emily Rodriguez
    tags: ["Lab Results", "Blood Work"],
  },
  {
    id: "3",
    title: "Chest X-Ray",
    filename: "Chest_XRay_Smith_John_20230305.jpg",
    fileSize: "3.2 MB",
    date: "2023-03-05",
    specialty: "Pulmonology",
    doctor: {
      name: "Unknown Doctor",
      specialty: "Unknown",
      avatar: "/placeholder.svg",
    }, // Dr. Sarah Chen
    tags: ["X-Ray", "Imaging", "Chest"],
  },
  {
    id: "4",
    title: "MRI Brain",
    filename: "MRI_Brain_Smith_John_20230120.dicom",
    fileSize: "15.6 MB",
    date: "2023-01-20",
    specialty: "Neurology",
    doctor: {
      name: "Unknown Doctor",
      specialty: "Unknown",
      avatar: "/placeholder.svg",
    }, // Dr. David Kim
    tags: ["MRI", "Imaging", "Neurology"],
  },
];

// Helper function to group items by specialty
function groupBySpecialty<T extends { specialty: string }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const { specialty } = item;
    if (!acc[specialty]) {
      acc[specialty] = [];
    }
    acc[specialty].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// Get specialty icon
function getSpecialtyIcon(specialty: string) {
  switch (specialty) {
    case "Cardiology":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "Neurology":
      return <Brain className="h-4 w-4 text-purple-500" />;
    case "Pulmonology":
      return <Lungs className="h-4 w-4 text-blue-500" />;
    case "Endocrinology":
      return <Activity className="h-4 w-4 text-green-500" />;
    case "Internal Medicine":
      return <Stethoscope className="h-4 w-4 text-indigo-500" />;
    case "Radiology":
      return <FileText className="h-4 w-4 text-cyan-500" />;
    case "Surgery":
      return <Stethoscope className="h-4 w-4 text-amber-500" />;
    default:
      return <Stethoscope className="h-4 w-4 text-gray-500" />;
  }
}

export function PatientRecordDetail({
  patientId,
  onBack,
  onCaseSelect,
}: PatientRecordDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [isAddPrescriptionDialogOpen, setIsAddPrescriptionDialogOpen] =
    useState(false);
  const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState(false);
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );

  const [PrescriptionData, setPrescriptionData] = useState<Prescription>({
    id: Math.random().toString(36), // Generate a unique ID
    type: "Prescription",
    specialty: "",
    status: "Active", // Default to Active
    MedicationName: "",
    Dosage: "",
    Frequency: "",
    Duration: "",
    quantity: "",
    doctorID: doctorId || "", // Use current doctor's ID
    instructions: "",
    AdditionalNotes: "",
  });
  const handlePrescriptionChange = (field: string, value: string) => {
    setPrescriptionData({
      ...PrescriptionData,
      [field]: value,
    });
  };

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (patientId) {
        const fetchedPrescriptions = await getPrescriptions(
          doctorId as string,
          patientId
        );

        // Normalize prescription data to ensure all fields are present
        const normalizedPrescriptions = fetchedPrescriptions.map(
          (prescription) => ({
            id: prescription.id || Date.now().toString(),
            type: prescription.type || "Prescription",
            specialty: prescription.specialty || "",
            status: prescription.status || "Active",
            MedicationName: prescription.MedicationName || "",
            Dosage: prescription.Dosage || "",
            Frequency: prescription.Frequency || "",
            Duration: prescription.Duration || "",
            quantity: prescription.quantity || "",
            doctorID: prescription.doctorID || doctorId || "",
            instructions: prescription.instructions || "",
            AdditionalNotes: prescription.AdditionalNotes || "",
          })
        );

        setPrescriptions(normalizedPrescriptions);
      }
    };
    fetchPrescriptions();
  }, [patientId]);
  console.log("Fetched prescriptions:", prescriptions);

  const [clinicalNotesData, setClinicalNotesData] = useState<ClinicalNote>({
    id: Math.random().toString(), // Generate a unique ID
    type: "ClinicalNote",
    specialty: "",
    title: "",
    NoteContent: "",
    NoteType: "",
    doctorID: doctorId || "",
    tags: [],
  });
  const handleClinicalNoteChange = (field: string, value: string) => {
    if (field === "tags") {
      // Convert comma-separated string to array
      setClinicalNotesData({
        ...clinicalNotesData,
        tags: value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      });
    } else {
      setClinicalNotesData({
        ...clinicalNotesData,
        [field]: value,
      });
    }
  };
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  useEffect(() => {
    const fetchClinicalNotes = async () => {
      if (patientId) {
        const fetchedClinicalNotes = await getNotes(
          doctorId as string,
          patientId
        );

        // Normalize clinical notes data to ensure all fields are present
        const normalizedClinicalNotes = fetchedClinicalNotes.map(
          (note) => ({
            id: note.id || Date.now().toString(),
            type: note.type || "ClinicalNote",
            specialty: note.specialty || "",
            title: note.title || "",
            NoteContent: note.NoteContent || "",
            NoteType: note.NoteType || "",
            doctorID: note.doctorID || doctorId || "",
            tags: Array.isArray(note.tags) ? note.tags : 
            (typeof note.tags === 'string' ? (note.tags as string).split(',').map(t => t.trim()) : []),
          })
        );

        setClinicalNotes(normalizedClinicalNotes);
      }
    };
    fetchClinicalNotes();
  }, [patientId]);
  console.log("Fetched clinical notes:", clinicalNotes);
  const handleAddClinicalNotes = async () => {
    try {
      // Create a complete clinical note object
      const newClinicalNote: ClinicalNote = {
        ...clinicalNotesData,
        id: `${Math.random().toString(36)}`, // Generate a unique ID
        doctorID: doctorId || "",
        type: "ClinicalNote",
      };

      // Add the new clinical note to the UI state immediately
      setClinicalNotes((prev) => [...prev, newClinicalNote]);

      // Prepare the clinical note data for blockchain
      const typeConvertedClinicalNote = JSON.stringify({
        ...newClinicalNote,
      });

      // Update the record in the blockchain
      await updateRecord(
        patientId,
        doctorId as string,
        newClinicalNote.specialty,
        "", // phoneNumber (not updating)
        "", // address (not updating)
        "null", // prescriptions (not updating)
        typeConvertedClinicalNote, // notes
        "null", // document (not updating)
        "null", // updated basicInfo
        "null" // collab (not updating)
      );

      // Reset the form
      setClinicalNotesData({
        id: "",
        specialty: "",
        title: "",
        NoteContent: "",
        NoteType: "",
        type: "ClinicalNote",
        doctorID: doctorId || "",
        tags: [],
      });

      // Close the dialog
      setIsAddNoteDialogOpen(false);

      // Optional: Show success notification
      console.log("Clinical note added successfully!");
    } catch (error) {
      console.error("Error adding clinical note:", error);
      // Optional: Show error notification
    }
  }

  const handleAddPrescription = async () => {
    try {
      // Create a complete prescription object
      const newPrescription: Prescription = {
        ...PrescriptionData,
        id: `${Math.random().toString(36)}`, // Generate a unique ID
        status: "Active",
        doctorID: doctorId || "",
        type: "Prescription",
      };

      // Add the new prescription to the UI state immediately
      setPrescriptions((prev) => [...prev, newPrescription]);

      // Prepare the prescription data for blockchain
      const typeConvertedPrescription = JSON.stringify({
        ...newPrescription,
      });

      // Update the record in the blockchain
      await updateRecord(
        patientId,
        doctorId as string,
        newPrescription.specialty,
        "", // phoneNumber (not updating)
        "", // address (not updating)
        typeConvertedPrescription, // prescriptions
        "null", // notes (not updating)
        "null", // document (not updating)
        "null", // updated basicInfo
        "null" // collab (not updating)
      );

      // Reset the form
      setPrescriptionData({
        id: "",
        specialty: "",
        status: "Active",
        type: "Prescription",
        MedicationName: "",
        Dosage: "",
        Frequency: "",
        Duration: "",
        quantity: "",
        doctorID: doctorId || "",
        instructions: "",
        AdditionalNotes: "",
      });

      // Close the dialog
      setIsAddPrescriptionDialogOpen(false);

      // Optional: Show success notification
      console.log("Prescription added successfully!");
    } catch (error) {
      console.error("Error adding prescription:", error);
      // Optional: Show error notification
    }
  };
  //clinical notes part
  // Find the patient by ID
  const record = records?.find((p) => p.id === patientId);

  // Group notes, prescriptions, and files by specialty
  const notesBySpecialty = groupBySpecialty(clinicalNotes);
  const prescriptionsBySpecialty = groupBySpecialty(prescriptions);
  const filesBySpecialty = groupBySpecialty(medicalFiles);

  // Get unique specialties
  const specialties = Array.from(
    new Set([
      ...Object.keys(notesBySpecialty),
      ...Object.keys(prescriptionsBySpecialty),
      ...Object.keys(filesBySpecialty),
    ])
  ).sort();

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Patient Not Found</h2>
        <p className="text-gray-500 mb-4">
          The patient record you're looking for doesn't exist.
        </p>
        <Button onClick={onBack}>Back to Patient Records</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" className="gap-1" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Patient Record</h1>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={"/placeholder.svg"} alt={record.patientName} />
              <AvatarFallback>
                {record.patientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{record.patientName}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{record.id}</span>
                <span>•</span>
                <span>
                  {record.age} years, {record.gender}
                </span>
                <span>•</span>
                <span>
                  DOB: {new Date(record.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 gap-1"
              onClick={() => setIsNewCaseDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Collaboration Case
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <div className="border-b px-4">
            <TabsList className="bg-transparent p-0 h-10">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="medical-history"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
              >
                Medical History
              </TabsTrigger>
              <TabsTrigger
                value="prescriptions"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
              >
                Prescriptions
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
              >
                Files
              </TabsTrigger>
              <TabsTrigger
                value="cases"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
              >
                Cases
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="overview" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Phone:</span>
                          <span>{record.phoneNumber}</span>
                        </div>
                        {/* <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Email:</span>
                          <span>{record.email}</span>
                        </div> */}
                        <div className="flex items-start gap-2 text-sm">
                          <Home className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span className="font-medium">Address:</span>
                          <span>{record.address}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Insurance:</span>
                          <span>{record.basicInfo?.insuranceProvider}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Policy Number:</span>
                          <span>{record.basicInfo?.insuranceNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Heart className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Blood Type:</span>
                          <span>{record.basicInfo?.bloodType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Allergies</h3>
                      <div className="flex flex-wrap gap-1">
                        {record.basicInfo?.allergies?.length === 0 ? (
                          <span className="text-sm text-gray-500">
                            No known allergies
                          </span>
                        ) : (
                          record.basicInfo?.allergies?.map((allergy, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              {allergy}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">
                        Current Conditions
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {record.basicInfo?.conditions?.map((condition, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setIsAddNoteDialogOpen(true)}
                    >
                      <PenLine className="h-4 w-4" />
                      Add Clinical Note
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setIsAddPrescriptionDialogOpen(true)}
                    >
                      <Pill className="h-4 w-4" />
                      Add Prescription
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setIsAddFileDialogOpen(true)}
                    >
                      <Upload className="h-4 w-4" />
                      Upload File
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setIsNewCaseDialogOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Start Collaboration
                    </Button>
                  </CardContent>
                </Card>

                {/* Medications by Specialty */}
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>Current Medications by Specialty</CardTitle>
                    <CardDescription>
                      Medications prescribed by different specialists for this
                      patient
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(prescriptionsBySpecialty).map(
                        ([specialty, medications]) => (
                          <div key={specialty}>
                            <div className="flex items-center gap-2 mb-3">
                              {getSpecialtyIcon(specialty)}
                              <h3 className="text-base font-medium">
                                {specialty}
                              </h3>
                            </div>
                            <div className="space-y-3 pl-6">
                              {medications.map((medication) => (
                                <div
                                  key={medication.id}
                                  className="flex items-start gap-3 p-3 border rounded-md"
                                >
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                                    <Pill className="h-4 w-4 text-indigo-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium">
                                        {medication.MedicationName}
                                      </h4>
                                      <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200"
                                      >
                                        {medication.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                      <span>Dosage: {medication.Dosage}</span>
                                      <span>•</span>
                                      <span>
                                        Frequency: {medication.Frequency}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      <span>
                                        Instructions: {medication.instructions}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Avatar className="h-5 w-5">
                                        <AvatarImage
                                          src={"/placeholder.svg"}
                                          alt={medication.doctorID}
                                        />
                                        <AvatarFallback>
                                          {medication.doctorID
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-gray-500">
                                        Prescribed by {medication.doctorID}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                      <Button
                        variant="outline"
                        className="w-full gap-1"
                        onClick={() => setIsAddPrescriptionDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Medication
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Visits */}
                {/* <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Visits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patient.recentVisits.map((visit, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 border rounded-md">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{visit.reason}</h4>
                              <span className="text-xs text-gray-500">{new Date(visit.date).toLocaleDateString()}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{visit.doctor}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card> */}
              </div>
            </TabsContent>

            <TabsContent value="medical-history" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                  <CardDescription>
                    Patient's complete medical history and conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Chronic Conditions
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {record.basicInfo?.conditions?.map((condition, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Allergies</h3>
                      <div className="flex flex-wrap gap-1">
                        {record.basicInfo?.allergies?.length === 0 ? (
                          <span className="text-sm text-gray-500">
                            No known allergies
                          </span>
                        ) : (
                          record.basicInfo?.allergies?.map((allergy, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              {allergy}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    {/* ################################## still not treated */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Visit History
                      </h3>
                      <div className="space-y-3">
                        {record.basicInfo?.recentVisits?.map((visit, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 border rounded-md"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{visit.reason}</h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(visit.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {visit.doctor}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* ######################################## */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions" className="m-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Prescriptions</h2>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 gap-1"
                  onClick={() => setIsAddPrescriptionDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Prescription
                </Button>
              </div>

              <div className="flex mb-4 overflow-x-auto pb-2">
                <Button
                  variant={selectedSpecialty === null ? "default" : "outline"}
                  size="sm"
                  className={`mr-2 ${
                    selectedSpecialty === null
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : ""
                  }`}
                  onClick={() => setSelectedSpecialty(null)}
                >
                  All Specialties
                </Button>
                {specialties.map((specialty) => (
                  <Button
                    key={specialty}
                    variant={
                      selectedSpecialty === specialty ? "default" : "outline"
                    }
                    size="sm"
                    className={`mr-2 ${
                      selectedSpecialty === specialty
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : ""
                    }`}
                    onClick={() => setSelectedSpecialty(specialty)}
                  >
                    <span className="flex items-center gap-1">
                      {getSpecialtyIcon(specialty)}
                      {specialty}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                {Object.entries(groupBySpecialty(prescriptions))
                  .filter(
                    ([specialty]) =>
                      selectedSpecialty === null ||
                      specialty === selectedSpecialty
                  )
                  .map(([specialty, medications]) => (
                    <div key={specialty} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        {getSpecialtyIcon(specialty)}
                        <h3 className="text-base font-medium">{specialty}</h3>
                      </div>
                      <div className="space-y-3">
                        {medications.map((medication) => (
                          <Card key={medication.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>
                                  {medication.MedicationName}
                                </CardTitle>
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200"
                                >
                                  {medication.status}
                                </Badge>
                              </div>
                              <CardDescription>
                                Prescribed by {medication.doctorID}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">
                                    Dosage
                                  </h4>
                                  <p>{medication.Dosage}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">
                                    Frequency
                                  </h4>
                                  <p>{medication.Frequency}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">
                                    Duration
                                  </h4>
                                  <p>{medication.Duration}</p>
                                </div>
                              </div>
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                  Instructions
                                </h4>
                                <p className="text-sm">
                                  {medication.instructions}
                                </p>
                              </div>
                            </CardContent>
                            <CardFooter className="border-t bg-gray-50 flex justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={"/placeholder.svg"}
                                    alt={medication.doctorID}
                                  />
                                  <AvatarFallback>
                                    {medication.doctorID
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {medication.specialty}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Discontinue
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="m-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Clinical Notes</h2>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 gap-1"
                  onClick={() => setIsAddNoteDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />                                         {/* Add Note */}
                  Add Note
                </Button>
              </div>

              <div className="flex mb-4 overflow-x-auto pb-2">
                <Button
                  variant={selectedSpecialty === null ? "default" : "outline"}
                  size="sm"
                  className={`mr-2 ${
                    selectedSpecialty === null
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : ""
                  }`}
                  onClick={() => setSelectedSpecialty(null)}
                >
                  All Specialties
                </Button>
                {specialties.map((specialty) => (
                  <Button
                    key={specialty}
                    variant={
                      selectedSpecialty === specialty ? "default" : "outline"
                    }
                    size="sm"
                    className={`mr-2 ${
                      selectedSpecialty === specialty
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : ""
                    }`}
                    onClick={() => setSelectedSpecialty(specialty)}
                  >
                    <span className="flex items-center gap-1">
                      {getSpecialtyIcon(specialty)}
                      {specialty}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="space-y-6">
                {Object.entries(notesBySpecialty)
                  .filter(
                    ([specialty]) =>
                      selectedSpecialty === null ||
                      specialty === selectedSpecialty
                  )
                  .map(([specialty, notes]) => (
                    <div key={specialty} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        {getSpecialtyIcon(specialty)}
                        <h3 className="text-base font-medium">{specialty}</h3>
                      </div>
                      <div className="space-y-3">
                        {notes.map((note) => (
                          <Card key={note.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{note.title}</CardTitle>
                                <span className="text-sm text-gray-500">
                                  {new Date().toLocaleDateString()}
                                </span>
                              </div>
                              <CardDescription>
                                {note.doctorID} - {note.specialty}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">{note.NoteContent}</p>
                            </CardContent>
                            <CardFooter className="border-t bg-gray-50 flex justify-between">
                              <div className="flex items-center gap-2">
                              {(note.tags && Array.isArray(note.tags)) ? note.tags.map((tag, i) => (
  <Badge key={i} variant="outline">
    {tag}
  </Badge>
)) : null}
                              </div>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={
                                       "/placeholder.svg"
                                    }
                                    alt={note.doctorID}
                                  />
                                  <AvatarFallback>
                                    {note.doctorID
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="files" className="m-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Medical Files</h2>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 gap-1"
                  onClick={() => setIsAddFileDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Upload File
                </Button>
              </div>

              <div className="flex mb-4 overflow-x-auto pb-2">
                <Button
                  variant={selectedSpecialty === null ? "default" : "outline"}
                  size="sm"
                  className={`mr-2 ${
                    selectedSpecialty === null
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : ""
                  }`}
                  onClick={() => setSelectedSpecialty(null)}
                >
                  All Specialties
                </Button>
                {specialties.map((specialty) => (
                  <Button
                    key={specialty}
                    variant={
                      selectedSpecialty === specialty ? "default" : "outline"
                    }
                    size="sm"
                    className={`mr-2 ${
                      selectedSpecialty === specialty
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : ""
                    }`}
                    onClick={() => setSelectedSpecialty(specialty)}
                  >
                    <span className="flex items-center gap-1">
                      {getSpecialtyIcon(specialty)}
                      {specialty}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="space-y-6">
                {Object.entries(filesBySpecialty)
                  .filter(
                    ([specialty]) =>
                      selectedSpecialty === null ||
                      specialty === selectedSpecialty
                  )
                  .map(([specialty, files]) => (
                    <div key={specialty} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        {getSpecialtyIcon(specialty)}
                        <h3 className="text-base font-medium">{specialty}</h3>
                      </div>
                      <div className="space-y-3">
                        {files.map((file) => (
                          <Card key={file.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{file.title}</CardTitle>
                                <span className="text-sm text-gray-500">
                                  {new Date(file.date).toLocaleDateString()}
                                </span>
                              </div>
                              <CardDescription>
                                Uploaded by {file.doctor.name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                                  <FileText className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{file.filename}</p>
                                  <p className="text-sm text-gray-500">
                                    {file.fileSize}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="border-t bg-gray-50 flex justify-between">
                              <div className="flex items-center gap-2">
                                {file.tags.map((tag, i) => (
                                  <Badge key={i} variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  Download
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="cases" className="m-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Collaboration Cases</h2>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 gap-1"
                  onClick={() => setIsNewCaseDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  New Case
                </Button>
              </div>

              <div className="space-y-3">
                {record.collabs.length > 0 ? (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>Unusual Cardiac Symptoms</CardTitle>
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                            Open
                          </Badge>
                        </div>
                        <CardDescription>
                          Case #MED-2023-1234 • Created April 18, 2023
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">
                          Patient presents with atypical chest pain and
                          irregular ECG patterns. Initial tests show elevated
                          cardiac enzymes but inconclusive stress test results.
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge variant="outline" className="bg-gray-100">
                            #Cardiology
                          </Badge>
                          <Badge variant="outline" className="bg-gray-100">
                            #ECG
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-700"
                          >
                            #Urgent
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            4 participating doctors
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50 flex justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src="/placeholder.svg?height=40&width=40"
                              alt="Dr. Sarah Johnson"
                            />
                            <AvatarFallback>SJ</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            Created by Dr. Sarah Johnson
                          </span>
                        </div>
                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() =>
                            onCaseSelect && onCaseSelect("MED-2023-1234")
                          }
                        >
                          View Case
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>Diabetes Management Review</CardTitle>
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                            Closed
                          </Badge>
                        </div>
                        <CardDescription>
                          Case #MED-2023-1238 • Created April 10, 2023
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">
                          Quarterly review of diabetes management plan and
                          medication adjustments. Patient shows improved glucose
                          control with current regimen.
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge variant="outline" className="bg-gray-100">
                            #Diabetes
                          </Badge>
                          <Badge variant="outline" className="bg-gray-100">
                            #Chronic
                          </Badge>
                          <Badge variant="outline" className="bg-gray-100">
                            #Medication
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            2 participating doctors
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50 flex justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src="/placeholder.svg?height=40&width=40"
                              alt="Dr. Sarah Johnson"
                            />
                            <AvatarFallback>SJ</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            Created by Dr. Sarah Johnson
                          </span>
                        </div>
                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() =>
                            onCaseSelect && onCaseSelect("MED-2023-1238")
                          }
                        >
                          View Case
                        </Button>
                      </CardFooter>
                    </Card>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No collaboration cases
                    </h3>
                    <p className="text-gray-500 mb-4">
                      This patient doesn't have any active or past collaboration
                      cases
                    </p>
                    <Button
                      onClick={() => setIsNewCaseDialogOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Case
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Add Note Dialog */}
      <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Clinical Note</DialogTitle>
            <DialogDescription>
              Add a new clinical note to the patient's record. This will be
              visible to all healthcare providers with access to this patient.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="note-title">Title</Label>
              <Input id="note-title" placeholder="Enter note title" value={clinicalNotesData.title} onChange={(e)=>handleClinicalNoteChange("title",e.target.value)}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note-specialty">Specialty</Label>
              <Select onValueChange={(value) =>
                  handlePrescriptionChange("specialty", value)}>
                <SelectTrigger id="note-specialty">
                  <SelectValue placeholder="Select your specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="pulmonology">Pulmonology</SelectItem>
                  <SelectItem value="endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="internal-medicine">
                    Internal Medicine
                  </SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note-type">Note Type</Label>
              <Select onValueChange={(value) =>
                  handlePrescriptionChange("NoteType", value)}>
                <SelectTrigger id="note-type">
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Progress Note</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="procedure">Procedure Note</SelectItem>
                  <SelectItem value="medication">Medication Review</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note-content">Note Content</Label>
              <Textarea value={clinicalNotesData.NoteContent} onChange={(e)=>handleClinicalNoteChange("NoteContent",e.target.value)}
                id="note-content"
                placeholder="Enter detailed clinical note..."
                className="min-h-32"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note-tags">Tags</Label>
              <Input value={Array.isArray(clinicalNotesData.tags) ? clinicalNotesData.tags.join(', ') : ''}
  onChange={(e) => handleClinicalNoteChange("tags", e.target.value)}
                id="note-tags"
                placeholder="Enter tags separated by commas (e.g., checkup, hypertension)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => handleAddClinicalNotes()}
            >
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Prescription Dialog */}
      <Dialog
        open={isAddPrescriptionDialogOpen}
        onOpenChange={setIsAddPrescriptionDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Prescription</DialogTitle>
            <DialogDescription>
              Add a new prescription to the patient's record. Please ensure all
              information is accurate.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="medication-name">Medication Name</Label>
              <Input
                id="medication-name"
                placeholder="Enter medication name"
                value={PrescriptionData.MedicationName}
                onChange={(e) =>
                  handlePrescriptionChange("MedicationName", e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medication-specialty">Specialty</Label>
              <Select
                onValueChange={(value) =>
                  handlePrescriptionChange("specialty", value)
                }
              >
                <SelectTrigger id="medication-specialty">
                  <SelectValue placeholder="Select your specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="pulmonology">Pulmonology</SelectItem>
                  <SelectItem value="endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="internal-medicine">
                    Internal Medicine
                  </SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 10mg"
                  value={PrescriptionData.Dosage}
                  onChange={(e) =>
                    handlePrescriptionChange("Dosage", e.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  placeholder="e.g., Twice daily"
                  value={PrescriptionData.Frequency}
                  onChange={(e) =>
                    handlePrescriptionChange("Frequency", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 30 days, Ongoing"
                  value={PrescriptionData.Duration}
                  onChange={(e) =>
                    handlePrescriptionChange("Duration", e.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  placeholder="e.g., 60 tablets"
                  value={PrescriptionData.quantity}
                  onChange={(e) =>
                    handlePrescriptionChange("quantity", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Enter detailed instructions for taking this medication..."
                className="min-h-20"
                value={PrescriptionData.instructions}
                onChange={(e) =>
                  handlePrescriptionChange("instructions", e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes or warnings..."
                className="min-h-20"
                value={PrescriptionData.AdditionalNotes}
                onChange={(e) =>
                  handlePrescriptionChange("AdditionalNotes", e.target.value)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPrescriptionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleAddPrescription}
            >
              Add Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add File Dialog */}
      <Dialog open={isAddFileDialogOpen} onOpenChange={setIsAddFileDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Medical File</DialogTitle>
            <DialogDescription>
              Upload a medical file to the patient's record. Supported formats:
              PDF, JPG, PNG, DICOM.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium mb-1">
                Drag and drop files here
              </p>
              <p className="text-xs text-gray-500 mb-3">or</p>
              <Button variant="outline" size="sm">
                Browse Files
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file-specialty">Specialty</Label>
              <Select>
                <SelectTrigger id="file-specialty">
                  <SelectValue placeholder="Select your specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="pulmonology">Pulmonology</SelectItem>
                  <SelectItem value="endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="internal-medicine">
                    Internal Medicine
                  </SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file-type">File Type</Label>
              <Select>
                <SelectTrigger id="file-type">
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab">Lab Result</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="report">Medical Report</SelectItem>
                  <SelectItem value="consent">Consent Form</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file-description">Description</Label>
              <Textarea
                id="file-description"
                placeholder="Enter a description of this file..."
                className="min-h-20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file-tags">Tags</Label>
              <Input
                id="file-tags"
                placeholder="Enter tags separated by commas (e.g., ECG, cardiology)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddFileDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setIsAddFileDialogOpen(false)}
            >
              Upload File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Case Dialog */}
      <NewCaseDialog
        open={isNewCaseDialogOpen}
        onOpenChange={setIsNewCaseDialogOpen}
        preselectedPatient={record}
      />
    </div>
  );
}
