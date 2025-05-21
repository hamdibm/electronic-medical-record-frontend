
import { Record, RecordEntry } from "@/types";
import axios from "axios";




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

    const record: Record = res.data.message.response;
    console.log("Fetched akel record:", record);
    
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

export const revokeAccessFromDoctor = async (recordId: string, doctorId: string) => {
  try {
    
    const response = await axios.post(
      `http://localhost:3970/api/fabric/patient/invoke/chaincode?channelName=record-manager&chaincodeName=recordManagement`,
      {
        method: "revokeAccess",
        args: [recordId, doctorId],
      },
      {
        headers: {
   
          "Content-Type": "application/json",
        },
      },
    )

    return response.data
  } catch (error) {
    console.error("Error revoking access:", error)
    throw new Error( "Failed to revoke access from doctor")
  }
}

export const fetchPatientDashboardData = async (patientId: string) => {
  const response = await axios.get(`http://localhost:3970/api/patient/dashboard/${patientId}`);
  const record =response.data.response;
  return {
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
  }
};