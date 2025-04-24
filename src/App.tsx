


import './App.css'
import RegisterAsDoc from './modules/RegisterAsDoctor'
import RegisterPatient from './components//register/RegisterAsPatient/RegisterPatient'
import Login from './modules/Login';
import {Route,Routes} from 'react-router-dom'
import EmailVerification from './lib/emailVerification';
import DoctorDashboard from './components/doctorHome/doctorDashboard'
import { Toaster } from 'sonner';

function App() {

 
  
  return (<>
    <Toaster/>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/registerDoctor" element={<RegisterAsDoc/>}/>
      <Route path="/registerPatient" element={<RegisterPatient/>}/>
      <Route path="/verify-email/:token" element={<EmailVerification />} />
      <Route path="/doctor-dashboard" element={<DoctorDashboard/>} />
    </Routes>
    </>
  );
};


export default App;
