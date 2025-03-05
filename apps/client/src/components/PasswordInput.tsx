import { Input } from "@heroui/react";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps {
  label?: string;
}

export const PasswordInput = (props: PasswordInputProps) => {
  const { label } = props;

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const endContent = (
    <button onClick={toggleVisibility} type="button">
      {isVisible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );

  return (
    <Input
      endContent={endContent}
      isRequired
      label={label || "Password"}
      name="password"
      startContent={<LockIcon />}
      type={isVisible ? "text" : "password"}
    />
  );
};
