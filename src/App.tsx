import Login from "./components/LoginRegistre/Login.jsx" // Chemin relatif correct
import './App.css'; // Importez le fichier CSS une seule fois

function App() {
  return (
    <div>
      <h1 className="text-center">Mon Application</h1>
      <Login /> {/* Utilisation du composant Login */}
    </div>
  );
}

export default App;