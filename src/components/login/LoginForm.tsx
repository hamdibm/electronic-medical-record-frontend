import InputWithLabel from "../commonComponents/InputField";
import coverForLogin from "../../assets/images/coverForLogin.png";
import RegisterRole from "../commonComponents/PopUpDialogWindow";
import SocialLoginButtons from "./SocialLoginButtons";
import Check from "../commonComponents/checkboxComp";
import ForgetPassword from "./ForgetPassword";
import RoleSelection from "../login/RoleSelection";
import { Button } from "../ui/button";
export default function LoginForm() {
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
          />
          <InputWithLabel
            id="password"
            label="Password"
            type="password"
            placeholder="Password"
          />

          <div className="space-y-2">
            <Check prop="Remember Me"/>
            <ForgetPassword />
          </div>

          <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
            Login
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
