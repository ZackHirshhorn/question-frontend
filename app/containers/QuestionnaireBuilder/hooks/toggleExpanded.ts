import { useState } from "react";

export const useExpandedSet = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return new Set(next); // triggers re-render
    });
  };

  const isExpanded = (id: string) => expandedItems.has(id);

  return {
    expandedItems,
    toggleExpanded,
    isExpanded,
  };
};