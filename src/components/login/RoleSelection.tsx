import patientRecord from "../../assets/svg/patientRecord.svg";
import doctor from "../../assets/svg/doctorIcon.svg";
import { Button } from "../ui/button";
import {  useNavigate } from "react-router-dom";


export default function RoleSelection() {
  const navigate=useNavigate();
  return (
    <div className="flex flex-row justify-center items-center space-x-4 relative">
  <Button 
    className="p-4 w-1/2 rounded-md bg-transparent shadow-md cursor-pointer 
    hover:bg-blue-500 transition-all duration-500 relative overflow-hidden 
    group"
    
  >
    <div className="flex items-center justify-center space-x-2">
      <img src={patientRecord} alt="" className="w-5 h-5 transition-all duration-300" />
      <span className="text-black group-hover:text-white transition-colors duration-300">Patient</span>
    </div>
  </Button>

  <Button 
    className="p-4 w-1/2 rounded-md bg-transparent shadow-md cursor-pointer 
    hover:bg-blue-500 transition-all duration-500 relative overflow-hidden 
   group"
   onClick={()=> navigate("/registerDoctor") }
  >
    <div className="flex items-center justify-center space-x-2">
      <img src={doctor} alt="" className="w-5 h-5 transition-all duration-300" />
      <span className="text-black group-hover:text-white transition-colors duration-300">Doctor</span>
    </div>
  </Button>
</div>
  )
}
