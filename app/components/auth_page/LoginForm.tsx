import React, { useState } from "react";

import Input from "~/components/Input";
import PasswordInput from "~/components/PasswordInput";
import type { LoginData } from "~/types/auth";
import { login } from "app/auth/authSlice"
import { useAppDispatch } from 'app/store';
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    dispatch(login({ email, password })).unwrap();
  };

  const handleLoginChange = (field: keyof LoginData, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await handleLogin(loginData.email, loginData.password);
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <Input
        id="login-email"
        label="אימייל"
        type="email"
        icon={Mail}
        value={loginData.email}
        onChange={(val) => handleLoginChange("email", val)}
        placeholder="User@email.com"
        required
      />

      <PasswordInput
        id="login-password"
        label="סיסמה"
        value={loginData.password}
        onChange={(val) => handleLoginChange("password", val)}
        placeholder="Password"
        required
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="rounded border-gray-300" />
          <span>זכור אותי</span>
        </label>
        <button type="button" className="text-blue-600 hover:underline">
          ?שכחת סיסמה
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        התחבר
      </button>
    </form>
  );
}
