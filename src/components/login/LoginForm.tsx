import InputWithLabel from "../commonComponents/InputField";
import coverForLogin from "../../assets/images/coverForLogin.png";
import RegisterRole from "../commonComponents/PopUpDialogWindow";
import SocialLoginButtons from "./SocialLoginButtons";
import Check from "../commonComponents/checkboxComp";
import ForgetPassword from "./ForgetPassword";
import RoleSelection from "../login/RoleSelection";
import { Button } from "../ui/button";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import{toast} from "sonner" ;

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      console.log("Login success:", response.data);

      toast.success("Connexion réussie ! Redirection en cours...");
      console.log("Access Token:", response.data.accessToken);
      const token = response.data.data?.accessToken;
      console.log("Token reçu du backend :", token);

    if (token) {
      localStorage.setItem("token", token);
    } else {
      console.error(" Aucun token reçu depuis le backend.");
      toast.error("Erreur lors de la connexion. Token manquant.");
    return;
}
      setTimeout(() => {
        navigate("/patientDashboard");
      }, 2000);

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.errorMessages || "Login failed");
      toast.error("Échec de la connexion. Veuillez vérifier vos identifiants.");
  
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 p-4">
      <form className="flex flex-col sm:flex-row bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden">
        <div className="hidden sm:block sm:w-1/2 bg-blue-500">
          <img
            src={coverForLogin}
            alt="login"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full sm:w-1/2 p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
          <h1 className="text-xl sm:text-2xl font-bold">Welcome back!</h1>
          <p className="text-sm text-gray-500">
            Enter your credentials to access your account
          </p>

          <InputWithLabel
            id="email"
            label="Email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputWithLabel
            id="password"
            label="Password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        
          />

          <div className="space-y-2">
            <Check prop="Remember Me"/>
            <ForgetPassword />
          </div>

          <button 
          onClick={handleLogin}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer" >
            Login
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </button>
         

          {/* Divider */}
          <div className="flex items-center my-2 sm:my-4">
            <div className="w-full border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-xs bg-white">Or</span>
            <div className="w-full border-t border-gray-300"></div>
          </div>

          <SocialLoginButtons />

          <p className="text-xs text-gray-500 text-center">
            Don't have an account? <RegisterRole trigger={<Button
          variant="outline"
          className="border-0 font-light text-blue-500 cursor-pointer"
        >
          Sign up
        </Button>}
        content={
          <RoleSelection />}
        title="Register"
        description="Register as a patient or doctor"
        submitButton={<Button type="submit" size="sm" className="px-3 cursor-pointer">
          submit
        </Button>}
      />
          </p>
        </div>
      </form>
    </div>
  );
}
