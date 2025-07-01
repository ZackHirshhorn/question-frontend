import { useState } from "react";
import AuthTabs from "containers/AuthPage/components/AuthTabs";
import LoginForm from "containers/AuthPage/components/LoginForm";
import SignupForm from "containers/AuthPage/components/SignupForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-800 bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <AuthTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "login" ? (
          <LoginForm />
        ) : (
          <SignupForm switchToLogin={() => setActiveTab("login")} />
        )}
      </div>
    </div>
  );
}