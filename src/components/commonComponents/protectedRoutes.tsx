// import { Navigate } from "react-router-dom";
// import { getDecodedToken, UserRole } from "@/lib/jwtUtils";

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   allowedRoles: UserRole[];
// }

// export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
//   const token = getDecodedToken(UserRole.DOCTOR) || getDecodedToken(UserRole.PATIENT) || getDecodedToken(UserRole.CERTIFICATE_AUTHORITY);
//   if (!token || !allowedRoles.includes(token.role)) {
//     return <Navigate to="/" replace />;
//   }
//   return <>{children}</>;
// }