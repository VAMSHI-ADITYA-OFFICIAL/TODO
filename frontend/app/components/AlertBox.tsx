import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import Button from "./Button";
// import { Button } from "@/components/ui/button";

interface AlertProps {
  title: string;
  description: string;
  submitHandler: () => void;
}

export function AlertDialogBox({
  title,
  description,
  submitHandler,
}: AlertProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="plane" aria-label="Delete todo" title="Delete">
          <Trash2 aria-hidden="true" className="text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="z-50">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={submitHandler}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
