import React from "react";
import type { InputProps } from "../types/inputs"

export default function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
  className = "",
}: InputProps) {
  return (
    <input
          id={id}
          type={type}
          className={`pl-10 pr-3 border border-gray-300 rounded px-3 py-2 ${className}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
        />
  );
}