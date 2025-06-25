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
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-3 text-gray-400">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <input
          id={id}
          type={type}
          className={`pl-10 pr-3 w-full border border-gray-300 rounded px-3 py-2 ${className}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );
}