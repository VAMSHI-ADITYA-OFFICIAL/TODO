import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { Eye, EyeOff } from "lucide-react";

type InputProps = {
  register: any;
  error: string | undefined;
  label: string;
  name: string;
};

export default function InputPasswordComponent({
  register,
  error,
  label,
  name,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex relative">
      <Input
        label={label}
        {...register(name)}
        type={showPassword ? "text" : "password"}
        error={error}
      />
      <Button
        variant="plane"
        type="button"
        aria-label="password toggle"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute top-8 right-2"
      >
        {showPassword ? <Eye /> : <EyeOff />}
      </Button>
    </div>
  );
}
