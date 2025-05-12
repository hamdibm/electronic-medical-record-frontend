import axios from "axios";

export const fetchPatientDashboardData = async (patientId: string) => {
  const response = await axios.get(`http://localhost:3000/api/patient/dashboard/${patientId}`);
  return response.data.response;
};
// Fonction corrigée pour accorder l'accès à un médecin
export const grantAccessToDoctor = async (recordId: string, doctorId: string) => {
  try {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    // URL et corps de la requête corrigés
    const response = await axios.post(
      `http://localhost:3000/api/fabric/patient/invoke/chaincode?channelName=record-manager&chaincodeName=recordManagement`,
      {
        method: "grantAccess",
        args: [recordId, doctorId],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )

    return response.data
  } catch (error: any) {
    console.error("Error granting access:", error)
    // Amélioration de la gestion des erreurs pour afficher les détails de l'erreur du serveur
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || JSON.stringify(error.response.data))
    }
    throw new Error(error.message || "Failed to grant access to doctor")
  }
}

// Fonction corrigée pour révoquer l'accès d'un médecin
export const revokeAccessFromDoctor = async (recordId: string, doctorId: string) => {
  try {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    // URL et corps de la requête corrigés
    const response = await axios.post(
      `http://localhost:3000/api/fabric/patient/invoke/chaincode?channelName=record-manager&chaincodeName=recordManagement`,
      {
        method: "revokeAccess",
        args: [recordId, doctorId],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )

    return response.data
  } catch (error: any) {
    console.error("Error revoking access:", error)
    // Amélioration de la gestion des erreurs pour afficher les détails de l'erreur du serveur
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || JSON.stringify(error.response.data))
    }
    throw new Error(error.message || "Failed to revoke access from doctor")
  }
}
