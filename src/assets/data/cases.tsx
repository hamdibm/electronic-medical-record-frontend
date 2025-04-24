import axios from "axios";
import {Case,CaseStatus,CaseType} from "@/types/index";

export async function getCasesByDoctor(doctorId: string): Promise<Case[] | undefined> {
    try {
        const res =await axios.post(
            `http://localhost:${import.meta.env}/api/cases/doctor/${doctorId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const cases: Case[] = res.data;
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
//   
        