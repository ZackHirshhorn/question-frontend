import React, { useState } from "react";
import type { PasswordInputProps } from "../types/inputs"
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">
          <Lock className="h-5 w-5" />
        </span>
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className={`pl-10 pr-10 w-full border border-gray-300 rounded px-3 py-2 ${className}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          className="absolute right-3 top-3 text-gray-500 text-sm"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}