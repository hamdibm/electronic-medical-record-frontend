import { Button } from "@/components/ui/button";
import FaGoogle from "../../assets/svg/google.svg";

const SocialLoginButtons=() =>{
  return (
    <div className="flex justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2 w-full max-w-xs border-gray-300 cursor-pointer"
              onClick={() => console.log("clicked")}
            >
              <img src={FaGoogle} alt="google" className="w-5 h-5" />
              Sign in with Google
            </Button>
    </div>
  )
}
export default SocialLoginButtons;