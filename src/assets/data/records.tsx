
import { Record, RecordEntry } from "@/types";
import axios from "axios";

// export const patients = [
//     {
//       id: "P-78901",
//       name: "John Smith",
//       age: 45,
//       gender: "Male",
//       dateOfBirth: "1978-05-12",
//       phone: "(555) 123-4567",
//       email: "john.smith@example.com",
//       address: "123 Main St, Anytown, CA 94321",
//       insuranceProvider: "Blue Cross",
//       insuranceNumber: "BC-12345678",
//       bloodType: "A+",
//       allergies: ["Penicillin", "Peanuts"],
//       conditions: ["Hypertension", "Type 2 Diabetes"],
//       medications: [
//         { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
//         { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
//       ],
//       recentVisits: [
//         { date: "2023-04-10", reason: "Annual checkup", doctor: "Dr. Sarah Johnson" },
//         { date: "2023-02-15", reason: "Flu symptoms", doctor: "Dr. Michael Chen" },
//       ],
//       avatar: "/placeholder.svg?height=40&width=40",
//       lastVisit: "2023-04-10",
//       status: "Active",
//       caseCount: 2,
//     },
//     {
//       id: "P-78902",
//       name: "Maria Garcia",
//       age: 38,
//       gender: "Female",
//       dateOfBirth: "1985-09-23",
//       phone: "(555) 987-6543",
//       email: "maria.garcia@example.com",
//       address: "456 Oak Ave, Somewhere, NY 10001",
//       insuranceProvider: "Aetna",
//       insuranceNumber: "AE-87654321",
//       bloodType: "O-",
//       allergies: ["Sulfa drugs", "Shellfish"],
//       conditions: ["Asthma", "Migraine"],
//       medications: [
//         { name: "Albuterol", dosage: "90mcg", frequency: "As needed" },
//         { name: "Sumatriptan", dosage: "50mg", frequency: "As needed for migraines" },
//       ],
//       recentVisits: [
//         { date: "2023-04-15", reason: "Asthma follow-up", doctor: "Dr. Sarah Chen" },
//         { date: "2023-03-02", reason: "Migraine consultation", doctor: "Dr. David Kim" },
//       ],
//       avatar: "/placeholder.svg?height=40&width=40",
//       lastVisit: "2023-04-15",
//       status: "Active",
//       caseCount: 1,
//     },
//     {
//       id: "P-78903",
//       name: "Robert Johnson",
//       age: 62,
//       gender: "Male",
//       dateOfBirth: "1961-03-17",
//       phone: "(555) 456-7890",
//       email: "robert.johnson@example.com",
//       address: "789 Pine St, Elsewhere, TX 75001",
//       insuranceProvider: "Medicare",
//       insuranceNumber: "MC-98765432",
//       bloodType: "B+",
//       allergies: ["Codeine", "Latex"],
//       conditions: ["COPD", "Osteoarthritis", "Hypertension"],
//       medications: [
//         { name: "Tiotropium", dosage: "18mcg", frequency: "Once daily" },
//         { name: "Acetaminophen", dosage: "500mg", frequency: "As needed for pain" },
//         { name: "Amlodipine", dosage: "5mg", frequency: "Once daily" },
//       ],
//       recentVisits: [
//         { date: "2023-04-05", reason: "COPD management", doctor: "Dr. Sarah Chen" },
//         { date: "2023-03-20", reason: "Joint pain", doctor: "Dr. James Wilson" },
//       ],
//       avatar: "/placeholder.svg?height=40&width=40",
//       lastVisit: "2023-04-05",
//       status: "Active",
//       caseCount: 1,
//     },
//     {
//       id: "P-78904",
//       name: "Lisa Thompson",
//       age: 29,
//       gender: "Female",
//       dateOfBirth: "1994-11-30",
//       phone: "(555) 789-0123",
//       email: "lisa.thompson@example.com",
//       address: "321 Elm St, Nowhere, WA 98001",
//       insuranceProvider: "United Healthcare",
//       insuranceNumber: "UH-56789012",
//       bloodType: "AB+",
//       allergies: ["None"],
//       conditions: ["Anxiety", "Migraines"],
//       medications: [
//         { name: "Sertraline", dosage: "50mg", frequency: "Once daily" },
//         { name: "Rizatriptan", dosage: "10mg", frequency: "As needed for migraines" },
//       ],
//       recentVisits: [
//         { date: "2023-04-18", reason: "Neurological symptoms", doctor: "Dr. David Kim" },
//         { date: "2023-02-28", reason: "Medication review", doctor: "Dr. Emily Rodriguez" },
//       ],
//       avatar: "/placeholder.svg?height=40&width=40",
//       lastVisit: "2023-04-18",
//       status: "Active",
//       caseCount: 1,
//     },
//     {
//       id: "P-78905",
//       name: "David Wilson",
//       age: 55,
//       gender: "Male",
//       dateOfBirth: "1968-07-04",
//       phone: "(555) 234-5678",
//       email: "david.wilson@example.com",
//       address: "654 Maple Dr, Anywhere, FL 33101",
//       insuranceProvider: "Cigna",
//       insuranceNumber: "CI-34567890",
//       bloodType: "O+",
//       allergies: ["Ibuprofen", "Contrast dye"],
//       conditions: ["Coronary artery disease", "Hyperlipidemia"],
//       medications: [
//         { name: "Atorvastatin", dosage: "40mg", frequency: "Once daily" },
//         { name: "Aspirin", dosage: "81mg", frequency: "Once daily" },
//         { name: "Metoprolol", dosage: "25mg", frequency: "Twice daily" },
//       ],
//       recentVisits: [
//         { date: "2023-03-25", reason: "Cardiac follow-up", doctor: "Dr. Michael Roberts" },
//         { date: "2023-01-15", reason: "Annual physical", doctor: "Dr. Sarah Johnson" },
//       ],
//       avatar: "/placeholder.svg?height=40&width=40",
//       lastVisit: "2023-03-25",
//       status: "Active",
//       caseCount: 0,
//     },
//   ]




export async function findRecordsForSpecificDoctor(doctorId: string): Promise<Record[] | undefined> {
  try {
    const backendPort = import.meta.env.BACKEND_PORT || '3970'; 
    const url = `http://localhost:${backendPort}/api/fabric/doctor/query/chaincode?channelName=record-manager&chaincodeName=recordManagement`;
    
    console.log("Making request to:", url);
    
    const res = await axios.post(
      url,
      {
        method: "getRecordsByDoctor",
        args: [doctorId]
      },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

   

    // Vérifier que les données existent
    if (!res.data) {
      console.log("No record found or invalid response format");
      return undefined;
    }

    const records: Record[] = res.data.message.response;
    console.log("Fetched record:", records);
    

    return records.map((record) => ({
      ...record,
      accessList: record.accessList || [],
      accessHistory: record.accessHistory || [],
      collabs: record.collabs || [],
      basicInfo: record.basicInfo || {},
      data: Array.isArray(record.data)
        ? record.data.map((entry: RecordEntry) => {
            if (entry.type === "ClinicalNote") {
              return {
                ...entry,
                type: "ClinicalNote",
                specialty: entry.specialty,
                doctorID: entry.doctorID,
                title: entry.title,
                NoteType: entry.NoteType,
                NoteContent: entry.NoteContent,
                tags: entry.tags,
              }
            } else if (entry.type === "Prescription") {
              return {
                ...entry,
                type: "Prescription",
                specialty: entry.specialty,
                doctorID: entry.doctorID,
                MedicationName: entry.MedicationName,
                Dosage: entry.Dosage,
                Frequency: entry.Frequency,
                Duration: entry.Duration,
                quantity: entry.quantity,
                instructions: entry.instructions,
                AdditionalNotes: entry.AdditionalNotes,
              }
            } else if (entry.type === "Document") {
              return {
                ...entry,
                type: "Document",
                specialty: entry.specialty,
                doctorID: entry.doctorID,
                documentUrls: entry.documentUrls,
                documentType: entry.documentType,
                Description: entry.Description,
                tags: entry.tags,
              }
            }
            return entry
          })
        : [],
    }))
  } catch (err) {
    console.error("Error in findRecordsForSpecificDoctor:", err)
    return []
  }
}
export async function findRecordByID(
  recordId: string
): Promise<Record | undefined> {
  try {
    console.log("Fetching record with ID:", recordId);
    
    const backendPort = import.meta.env.BACKEND_PORT || '3970'; 
    const url = `http://localhost:${backendPort}/api/fabric/doctor/query/chaincode?channelName=record-manager&chaincodeName=recordManagement`;
    
    console.log("Making request to:", url);
    
    const res = await axios.post(
      url,
      {
        method: "readRecord",
        args: [recordId]
      },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

   

    // Vérifier que les données existent
    if (!res.data) {
      console.log("No record found or invalid response format");
      return undefined;
    }

    const record: Record = res.data;
    console.log("Fetched record:", record);
    
    return {
      ...record,
      accessList: record.accessList || [],
      accessHistory: record.accessHistory || [],
      collabs: record.collabs || [],
      basicInfo: record.basicInfo || {},
      data: Array.isArray(record.data) 
        ? record.data.map((entry: RecordEntry) => {
            if (!entry || typeof entry !== 'object') {
              return entry;
            }
            
            switch (entry.type) {
              case "ClinicalNote":
                return {
                  ...entry,
                  type: "ClinicalNote",
                  specialty: entry.specialty || "",
                  doctorID: entry.doctorID || "",
                  title: entry.title || "",
                  NoteType: entry.NoteType || "",
                  NoteContent: entry.NoteContent || "",
                  tags: entry.tags || [],
                };
              case "Prescription":
                return {
                  ...entry,
                  type: "Prescription",
                  specialty: entry.specialty || "",
                  doctorID: entry.doctorID || "",
                  MedicationName: entry.MedicationName || "",
                  Dosage: entry.Dosage || "",
                  Frequency: entry.Frequency || "",
                  Duration: entry.Duration || "",
                  quantity: entry.quantity || "",
                  instructions: entry.instructions || "",
                  AdditionalNotes: entry.AdditionalNotes || "",
                };
              case "Document":
                return {
                  ...entry,
                  type: "Document",
                  specialty: entry.specialty || "",
                  doctorID: entry.doctorID || "",
                  documentUrls: entry.documentUrls || [],
                  documentType: entry.documentType || "",
                  Description: entry.Description || "",
                  tags: entry.tags || [],
                };
              default:
                return entry;
            }
          })
        : []
    };
  } catch (err) {
    console.error("Error in findRecordByID:", err);
    return undefined;
  }
}
export async function grantAccessForDoctor(
  recordId: string,
  doctorId: string
): Promise<boolean> {
  try {
    const backendPort = import.meta.env.BACKEND_PORT || '3970'; 
    const res = await axios.post(
      `http://localhost:${backendPort}/api/fabric/doctor/invoke/chaincode?channelName=record-manager&chaincodeName=recordManagement`,
      {
        method: "grantAccess",
        args: [recordId, doctorId]
      },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    console.log("Grant access response:", res.data);
    return res.data;
  } catch (err) {
    console.error(err);
    return false;
  }
}
export function updateRecord( 
  recordId: string,
  doctorID : string,
  speciality: string,
  phoneNumberStr: string,
  addressStr: string,
  prescriptionsStr: string,
  notesStr:string,
  basicInfoStr:string,
  documentStr: string,
  collabStr:string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const backendPort = import.meta.env.BACKEND_PORT || '3970'; 
        const res = await axios.post(
          `http://localhost:${backendPort}/api/fabric/doctor/invoke/chaincode?channelName=record-manager&chaincodeName=recordManagement`,
          {
            method: "updateRecord",
            args: [
              recordId,
              doctorID,
              speciality,
              phoneNumberStr,
              addressStr,
              prescriptionsStr,
              notesStr,
              documentStr,
              basicInfoStr,
              collabStr
            ]
          },
          {
            headers: {
              "Content-Type": "application/json",
            }
          }
        );

        console.log("Update record response:", res.data);
        resolve(true); 
      } catch (err) {
        console.error(err);
        reject(err);
      }
    })();
  });
}