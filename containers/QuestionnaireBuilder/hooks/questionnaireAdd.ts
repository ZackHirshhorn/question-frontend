import { useState } from "react";
import { useExpandedSet } from "./toggleExpanded";
import type {   
  QuestionnaireData, 
  Category,
  SubCategory,
  Topic,
  Question, 
} from "types/questionnaire";
import { buildId } from "containers/QuestionnaireBuilder/utils/build-id";

export function useQuestionnaire() {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({ ... });
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("questionnaires");
  const { expandedItems, toggleExpanded, isExpanded } = useExpandedSet();

  const handleTemplateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setQuestionnaire((prev) => ({
      ...prev,
      template: { ...prev.template, name },
    }));
  };

  //Either based on category ect. or either based on action type (add, delete, render)
  const saveTemplate = async () => { ... }

  const addCategory = () => { ... }
  const addSubCategory = () => { ... }
  const addTopic = () => { ... }
  const addQuestion = () => { ... }

  const deleteCategory = () => { ... }
  const deleteSubCategory = () => { ... }
  const deleteTopic = () => { ... }

  const renderQuestion = (...) => { ... }
  const renderTopic = (...) => { ... }
  const renderSubCategory = (...) => { ... }
  const renderCategory = (category, index) => (
    <CategoryBox
      category={category}
      index={index}
      // pass other props
    />
  );

  return {
    questionnaire,
    setQuestionnaire,
    handleTemplateNameChange,
    saveTemplate,
    addCategory,
    renderCategory,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
  };
}
