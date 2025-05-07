import axios from "axios";
import {Case,CaseStatus,CaseType} from "@/types/index";

export async function getCasesByDoctor(doctorId: string): Promise<Case[] | undefined> {
    try {
        const backendPort = import.meta.env.BACKEND_PORT || '3970';

        const res =await axios.get(
            `http://localhost:${backendPort}/api/cases/getCasesByDoctor/${doctorId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const cases: Case[] = res.data;
        console.log("Cases fetched:", cases);
        return cases.map((caseItem: Case) => ({
            ...caseItem,
            id: caseItem.id,
            title: caseItem.title,
            patientName: caseItem.patientName,
            patientId: caseItem.patientId,
            description: caseItem.description,
            status: caseItem.status as CaseStatus,
            type: caseItem.type as CaseType,
            createdAt: caseItem.createdAt,
            updatedAt: caseItem.updatedAt,
            createdBy: {
                id: caseItem.createdBy.id,
                name: caseItem.createdBy.name,
                avatar: caseItem.createdBy.avatar,
                specialty: caseItem.createdBy.specialty,
            },
            participants: caseItem.participants.map((participant) => ({
                id: participant.id,
                name: participant.name,
                avatar: participant.avatar,
                specialty: participant.specialty,
            })),
            tags: caseItem.tags,
        }));
    }catch (error) {
        console.error("Error fetching cases:", error);
        return [];
    }
}
export async function updateCase(caseId:string ,data:Partial<Case>) {
    try {
        const res = await axios.put(
            `http://localhost:${import.meta.env.VITE_BACKEND_URL}/api/cases/updateCase/${caseId}`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("Error updating case:", error);
        throw error;
    }
}       
export async function createCase(data: Case) {
    try {
        const backendPort = import.meta.env.BACKEND_PORT || '3970';
        const res = await axios.post(
            `http://localhost:${backendPort}/api/cases/createCase`,
            data, 
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        return res.data;
    } catch (error) {
        console.error("Error creating case:", error);
        throw error;
    }
}


export async function getCasesByRecordId(recordId: string): Promise<Case[]> {
  try {
    const backendPort = import.meta.env.BACKEND_PORT || "3970";
    const res = await axios.get(
      `http://localhost:${backendPort}/api/cases/getCasesByRecordId/${recordId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const cases: Case[] = res.data;
        console.log("Cases fetched:", cases);
        return cases.map((caseItem: Case) => ({
            ...caseItem,
            id: caseItem.id,
            title: caseItem.title,
            patientName: caseItem.patientName,
            patientId: caseItem.patientId,
            description: caseItem.description,
            status: caseItem.status as CaseStatus,
            type: caseItem.type as CaseType,
            createdAt: caseItem.createdAt,
            updatedAt: caseItem.updatedAt,
            createdBy: {
                id: caseItem.createdBy.id,
                name: caseItem.createdBy.name,
                avatar: caseItem.createdBy.avatar,
                specialty: caseItem.createdBy.specialty,
            },
            participants: caseItem.participants.map((participant) => ({
                id: participant.id,
                name: participant.name,
                avatar: participant.avatar,
                specialty: participant.specialty,
            })),
            tags: caseItem.tags,
        }));
  } catch (error) {
    console.error("Error fetching cases by recordId:", error);
    return [];
  }
}