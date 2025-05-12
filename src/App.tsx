


import './App.css'
import RegisterAsDoc from './modules/RegisterAsDoctor'
import RegisterPatient from './components//register/RegisterAsPatient/RegisterPatient'
import Login from './modules/Login';
import {Route,Routes} from 'react-router-dom'
import EmailVerification from './lib/emailVerification';
import { Toaster } from "sonner";
import PatientDashboard from './components/patientHome/patientDashboard';
function App() {

 
  
  return (
    <>
     <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/registerDoctor" element={<RegisterAsDoc/>}/>
      <Route path="/registerPatient" element={<RegisterPatient/>}/>
      <Route path="/verify-email/:token" element={<EmailVerification />} />
      <Route path="/patientDashboard" element={<PatientDashboard/>}/>
      <Route path="/login" element={<Login/>}/>
    </Routes>
    <Toaster position="bottom-right" richColors />
    </>
   
 
  );
};


export default App;
