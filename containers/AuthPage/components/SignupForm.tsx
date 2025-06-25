import React, { useState } from "react";
import axios from "../../../api/axios";

import Input from "components/Input";
import PasswordInput from "components/PasswordInput";
import type { SignupData, SignupFormProps } from "types/auth";

import { Mail, User } from "lucide-react";

export default function SignupForm({ switchToLogin }: SignupFormProps) {
  const [signupData, setSignupData] = useState<SignupData>({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignupChange = (
    field: keyof SignupData,
    value: string
  ) => {
    setSignupData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignupSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      return alert("Passwords do not match!");
    }

    try {
      const res = await axios.post("/signup", {
        name: signupData.userName,
        email: signupData.email,
        password: signupData.password,
      });
      alert("Account created successfully!");
      switchToLogin();
    } catch (err: any) {
      alert(err.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <form onSubmit={handleSignupSubmit} className="space-y-4">
      <Input
        id="signup-username"
        label="שם משתמש"
        type="text"
        icon={User}
        value={signupData.userName}
        onChange={(val) => handleSignupChange("userName", val)}
        placeholder="User"
        required
      />

      <Input
        id="signup-email"
        label="אימייל"
        type="email"
        icon={Mail}
        value={signupData.email}
        onChange={(val) => handleSignupChange("email", val)}
        placeholder="User@email.com"
        required
      />

      <PasswordInput
        id="signup-password"
        label="סיסמה"
        value={signupData.password}
        onChange={(val) => handleSignupChange("password", val)}
        placeholder="Password"
        required
      />

      <PasswordInput
        id="signup-confirm-password"
        label="אישור סיסמה"
        value={signupData.confirmPassword}
        onChange={(val) => handleSignupChange("confirmPassword", val)}
        placeholder="Password"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        צור חשבון
      </button>
    </form>
  );
}