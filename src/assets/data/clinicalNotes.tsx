import { ClinicalNote } from "@/types";
import { findRecordsForSpecificDoctor } from "./records";

export async function getNotes(doctorId: string, recordId: string): Promise<ClinicalNote[]> {
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
      
      let notes: ClinicalNote[] = [];
      
      if (record.data && Array.isArray(record.data)) {
        const notesEntries = record.data.filter(entry => 
          entry && typeof entry === 'object' && entry.type === "ClinicalNote"
        );
        const notesList= notesEntries.map(entry => entry as ClinicalNote);
        
        notes = notesList.map(entry => {
          // Ensure all fields are present and normalized
          return {
            id: entry.id || Math.random().toString(36),
            type: "ClinicalNote",
            specialty: entry.specialty || "",
            doctorID: entry.doctorID || doctorId,
            title: entry.title || "",
            NoteContent: entry.NoteContent || "",
            NoteType: entry.NoteType || "",
            tags: entry.tags || [],
        
          };
        });
      }
      
      console.log("Normalized notes:", notes);
      return notes;
    } catch (error) {
      console.error("Error in notes:", error);
      return [];
    }
  }