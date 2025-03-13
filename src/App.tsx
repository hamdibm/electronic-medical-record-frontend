import React from 'react';
import Login from './components/LoginRegistre/Login'; // Chemin relatif correct
import './App.css'; // Importez le fichier CSS si nécessaire

function App() {
  return (
    <div>
      <h1>Mon Application</h1>
      <Login /> {/* Utilisation du composant Login */}
    </div>
  );
}

export default App;