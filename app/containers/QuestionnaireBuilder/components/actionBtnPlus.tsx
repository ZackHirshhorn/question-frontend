import { Plus } from "lucide-react";

const actionBtnPlus = () => {
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-200"
  >
    <Plus className="h-5 w-5 ml-2" />
    {label}
  </button>
}

export default actionBtnPlus