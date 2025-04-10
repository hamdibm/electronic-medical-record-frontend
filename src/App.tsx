


import './App.css'
import RegisterAsDoc from './modules/RegisterAsDoctor'
import RegisterPatient from './components//register/RegisterAsPatient/RegisterPatient'

import Login from './modules/Login';
import {Route,Routes} from 'react-router-dom'
function App() {

 
  
  return (
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/registerDoctor" element={<RegisterAsDoc/>}/>
      <Route path="/registerPatient" element={<RegisterPatient/>}/>
    </Routes>
 
  );
};


export default App;
