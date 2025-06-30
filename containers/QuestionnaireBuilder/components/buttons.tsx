import React from "react";

const buttons = (toggleExpanded, setEditingItem) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button onClick={() => toggleExpanded(questionId)}>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
        <span className="font-medium">{question.q}</span>
      </div>

      <div className="flex items-center gap-1">
        <button>
          <Trash2 className="h-5 w-5" />
        </button>
        <button onClick={() => setEditingItem(isEditing ? null : questionId)}>
          <Edit className="h-5 w-5" />
        </button>
        <button>
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default buttons;
