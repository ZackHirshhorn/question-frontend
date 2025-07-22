type BaseInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

export type InputProps = BaseInputProps & {
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export type PasswordInputProps = BaseInputProps;