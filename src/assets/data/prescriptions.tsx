import { Prescription } from "@/types";
import { findRecordsForSpecificDoctor } from "./records";

export async function getPrescriptions(doctorId: string, recordId: string): Promise<Prescription[]> {
    try {
      const records = await findRecordsForSpecificDoctor(doctorId);
      if (!records || records.length === 0) {
        console.log("No records found for doctor:", doctorId);
        return [];
      }
      
      const record = records.find(record => record.id === recordId);
      if (!record) {
        console.log("Record not found:", recordId);
        return [];
      }
      
      // Extract prescriptions from data
      let prescriptions: Prescription[] = [];
      
      if (record.data && Array.isArray(record.data)) {
        // Find entries with type "Prescription"
        const prescriptionEntries = record.data.filter(entry => 
          entry && typeof entry === 'object' && entry.type === "Prescription"
        );
        const prescriptionList= prescriptionEntries.map(entry => entry as Prescription);
        
        prescriptions = prescriptionList.map(entry => {
          // Ensure all fields are present and normalized
          return {
            id: entry.id || Math.random().toString(36),
            type: "Prescription",
            specialty: entry.specialty || "",
            status: entry.status || "Active",
            MedicationName: entry.MedicationName || "",
            Dosage: entry.Dosage || "",
            Frequency: entry.Frequency || "",
            Duration: entry.Duration || "",
            quantity: entry.quantity || "",
            doctorID: entry.doctorID || doctorId,
            instructions: entry.instructions || "",
            AdditionalNotes: entry.AdditionalNotes || ""
          };
        });
      }
      
      console.log("Normalized prescriptions:", prescriptions);
      return prescriptions;
    } catch (error) {
      console.error("Error in getPrescriptions:", error);
      return [];
    }
  }