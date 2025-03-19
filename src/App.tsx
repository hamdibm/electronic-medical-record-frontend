
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Registre from './components/register/RegisterAsPatient/RegisterPatient.tsx'; // Chemin relatif correct
import './App.css'; // Import du CSS

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Registre" element={<Registre />} />
      
      </Routes>
    </BrowserRouter>
  );
}

export default App;
