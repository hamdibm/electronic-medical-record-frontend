import { Button } from "@/components/ui/button";

import RoleSelection from "../login/RoleSelection";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactElement } from "react";
interface DialogWindowProps {
  trigger :ReactElement;
  title : string;
  description? : string;
  submitButton? : ReactElement;
  content: ReactElement;

}

export default function LoginAsWindow({trigger,title,description,submitButton,content}:DialogWindowProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        
        {trigger}

      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter className="sm:justify-center">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="cursor-pointer"
            >
              Close
            </Button>
          </DialogClose>
          {submitButton}
          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
