import axios from "axios";
import { findRecordByID } from "./records";
export interface Doctor {
    id : string;
    name: string;
    specialty: string;
    avatar: string;
    isOnline?: boolean;
}
// export async function getDoctors() {
//     const backendPort = import.meta.env.BACKEND_PORT || '3970'; 

//      const response =await axios
//         .get(`http://localhost:${backendPort}/api/doctor/getAllDoctors`)
//         .then((response) => {
//         return response.data;
//         })
//         .catch((error) => {
//         console.error("Error fetching doctors:", error);
//         throw error;
//         });
//         const doctors= response.data.map((doctor :Doctor) => ({
//             ...doctor,
//             id: doctor._id,
//             name: doctor.firstName + " " + doctor.lastName,
//             specialty: doctor.specialty,
//             avatar: doctor.profilePicture,
//             isOnline:true,
//         }));
//         return doctors;
// }
export async function getDoctorsByRecordId(recordId: string):Promise<Doctor[]> {
    try {
        const response = await findRecordByID(recordId);
        console.log("Response from findRecordByID:", response);
        if (!response || !response.data) {
            throw new Error("Response data is undefined");
        }
        const accessList = response.accessList;
        if (!accessList || accessList.length === 0) {
            throw new Error("Access list is empty");
        }
        const backendPort = import.meta.env.BACKEND_PORT || '3970';
        const doctors = await axios
            .post(`http://localhost:${backendPort}/api/doctor/getDoctorsByAccessList`, { accessList })
            .then((response) => {
                return response.data.data as Doctor[];
            })
            .catch((error) => {
                console.error("Error fetching doctors by access list:", error);
                throw error;
            });
        return doctors;
    } catch (error) {
        console.error("Error fetching doctors by record ID:", error);
        return [];
    }
}
export async function getDoctorById(doctorId: string): Promise<Doctor | null> {
    console.log("Fetching doctor by ID:", doctorId);
    if (!doctorId) {
        console.error("Doctor ID is undefined");
        return null;
    }
    try {
        const backendPort = import.meta.env.BACKEND_PORT || '3970';
        const response = await axios.get(
            `http://localhost:${backendPort}/api/doctor/getDoctorById/${doctorId}`
        );
        const doctorData = response.data.data; // Access the data inside the genericResponse wrapper
        if (!doctorData) {
            return null;
        }
        const doctor: Doctor = {
            id: doctorData._id,
            name: doctorData.firstName + " " + doctorData.lastName,
            specialty: doctorData.speciality,
            avatar: doctorData.profilePicture,
            isOnline: false,
        };
        return doctor;
    } catch (error) {
        console.error("Error fetching doctor by ID:", error);
        return null;
    }
}