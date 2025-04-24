import {jwtDecode} from 'jwt-decode';
export interface jwtPayload {
    userId: string;
}
export const getToken = ():string |null => {
    const token= localStorage.getItem("accessToken");
    console.log("Token from localStorage:", token);
    return token;

}
export const getDecodedToken = ():jwtPayload | null => {
    const token = getToken();
    if (!token) return null;
    try {
        const decoded = jwtDecode<jwtPayload>(token);
        return decoded;
    } catch (error) {
        console.error("Invalid token", error);
        return null;
    }
}