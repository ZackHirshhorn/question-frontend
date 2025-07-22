import type { AuthTabsProps } from "../../types/auth";

export default function AuthTabs({ activeTab, setActiveTab }: AuthTabsProps) {
  return (
    <div className="grid grid-cols-2 mb-6">
      <button
        className={`py-2 font-medium ${
          activeTab === "login"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500"
        }`}
        onClick={() => setActiveTab("login")}
      >
        כניסה
      </button>
      <button
        className={`py-2 font-medium ${
          activeTab === "signup"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500"
        }`}
        onClick={() => setActiveTab("signup")}
      >
        הרשמה
      </button>
    </div>
  );
}