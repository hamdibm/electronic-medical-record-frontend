import { Notification } from "@/components/doctorHome/notifications-dropdown";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3970";

export const getNotificationsByUser = async (userId: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/notifications/getNotifications/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
};

export const createNotification = async (notificationData: Notification) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/notifications/createNotification`, notificationData);
        return response.data;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};