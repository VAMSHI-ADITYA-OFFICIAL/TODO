import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { Eye, EyeOff } from "lucide-react";
import { UseFormRegister, FieldValues, Path } from "react-hook-form";

type InputProps<T extends FieldValues = FieldValues> = {
  register: UseFormRegister<T>;
  error: string | undefined;
  label: string;
  name: Path<T>;
};

export default function InputPasswordComponent<T extends FieldValues = FieldValues>({
  register,
  error,
  label,
  name: _name,
}: InputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex relative">
      <Input
        label={label}
        {...register(_name)}
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
