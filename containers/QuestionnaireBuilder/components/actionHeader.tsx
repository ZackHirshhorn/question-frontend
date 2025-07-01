import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import type { ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  Trash2,
  Edit,
  MoreHorizontal,
} from "lucide-react";

type ActionHeaderProps = {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  showEdit?: boolean;
  moreActions?: ReactNode;
};

const ActionHeader = ({
  title,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
  showEdit = true,
  moreActions,
}: ActionHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button onClick={onToggle}>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
        <span className="font-medium">{title}</span>
      </div>

      <div className="flex items-center gap-1 relative">
        {onDelete && (
          <button onClick={onDelete}>
            <Trash2 className="h-5 w-5" />
          </button>
        )}
        {showEdit && onEdit && (
          <button onClick={onEdit}>
            <Edit className="h-5 w-5" />
          </button>
        )}

        {moreActions && (
          <Popover className="relative">
            <Popover.Button className="focus:outline-none">
              <MoreHorizontal className="h-5 w-5" />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute right-0 mt-2 w-48 rounded-md border bg-white text-black shadow-md z-10">
                {moreActions}
              </Popover.Panel>
            </Transition>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default ActionHeader;