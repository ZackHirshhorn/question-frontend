import { useState } from "react";

export const useExpanded = () => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isExpanded = (id: string) => !!expandedItems[id];

  return {
    expandedItems,
    toggleExpanded,
    isExpanded,
  };
};
