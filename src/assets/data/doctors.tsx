import axios from "axios";
export interface Doctor {
    _id : string;
    firstName: string;
    lastName: string;
    specialty: string;
    profilePicture: string;
    isOnline?: boolean;
}
export async function getDoctors() {
    const backendPort = import.meta.env.BACKEND_PORT || '3970'; 

     const response =await axios
        .get(`https://localhost:${backendPort}`)
        .then((response) => {
        return response.data;
        })
        .catch((error) => {
        console.error("Error fetching doctors:", error);
        throw error;
        });
        const doctors= response.data.map((doctor :Doctor) => ({
            ...doctor,
            id: doctor._id,
            name: doctor.firstName + " " + doctor.lastName,
            specialty: doctor.specialty,
            avatar: doctor.profilePicture,
            isOnline:true,
        }));
        return doctors;
}
