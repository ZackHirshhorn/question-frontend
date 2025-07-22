type AuthData = {
  email: string;
  password: string;
};

export type LoginData = AuthData;

export type SignupData = AuthData & {
  userName: string;
  confirmPassword: string;
};

export type SignupFormProps = {
  switchToLogin: () => void;
};

type AuthTab = "login" | "signup";

export type AuthTabsProps = {
  activeTab: AuthTab;
  setActiveTab: (tab: AuthTab) => void;
};