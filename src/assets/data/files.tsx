import { Document } from "@/types";
import { findRecordsForSpecificDoctor } from "./records";

export async function getFiles(doctorId: string, recordId: string): Promise<Document[]> {
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
      
      // Extract Documents from data
      let documents: Document[] = [];
      
      if (record.data && Array.isArray(record.data)) {
        // Find entries with type "Prescription"
        const documentEntries = record.data.filter(entry => 
          entry && typeof entry === 'object' && entry.type === "Document"
        );
        const documentList= documentEntries.map(entry => entry as Document);
        
        documents = documentList.map(entry => {
          // Ensure all fields are present and normalized
          return {
            id: entry.id ||Math.random().toString(36),
            type: "Document",
            specialty: entry.specialty || "",
            doctorID: entry.doctorID || doctorId,
            title: entry.title || "",
            description: entry.Description || "",
            date: new Date().toLocaleString(),
            documentType: entry.documentType || "Unknown",
            fileSize: 0,
            documentUrls: entry.documentUrls || [],
            tags: entry.tags || [],
            file: entry.file || new File([], "default.txt"), // Placeholder for file
            };
        });
      }
      
      console.log("Normalized documents:", documents);
      return documents;
    } catch (error) {
      console.error("Error in getFiles:", error);
      return [];
    }
  }