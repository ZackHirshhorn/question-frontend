import ActionHeader from "./actionHeader";

type toggleBoxProps = {
  id: string;
  expanded: boolean;
  toggleExpanded: (id: string) => void;
  title: string;
  className?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  moreActions?: React.ReactNode;
  children?: React.ReactNode;
};

export const ToggleBox = ({
  id,
  expanded,
  toggleExpanded,
  title,
  className = "",
  onDelete,
  onEdit,
  moreActions,
  children,
}: toggleBoxProps) => {
  return (
    <div className={`${className}`}>
      <div className={`mb-2 border rounded-md`}>
        <div className="p-3">
          <ActionHeader
            title={title}
            isExpanded={expanded}
            onToggle={() => toggleExpanded(id)}
            onDelete={onDelete}
            onEdit={onEdit}
            moreActions={moreActions}
          />

          {expanded && (
            <div className="mt-4 space-y-4 border-t pt-4">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
};
