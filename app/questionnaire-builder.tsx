import { useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  Trash2,
  Edit,
  MoreHorizontal,
  Menu,
  Search,
} from "lucide-react";
import type {
  QuestionnaireData,
  Category,
  SubCategory,
  Topic,
  Question,
} from "../types/questionnaire";

export default function QuestionnaireBuilder() {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    template: {
      name: "",
      categories: [],
    },
  });

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("questionnaires");

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const addCategory = () => {
    const newCategory: Category = {
      name: `קטגוריה ${questionnaire.template.categories.length + 1}`,
      questions: [],
      subCategories: [],
    };

    setQuestionnaire((prev) => ({
      template: {
        ...prev.template,
        categories: [...prev.template.categories, newCategory],
      },
    }));
  };

  const addSubCategory = (categoryIndex: number) => {
    const newSubCategory: SubCategory = {
      name: "תת-קטגוריה חדשה",
      questions: [],
      topics: [],
    };

    setQuestionnaire((prev) => {
      const newCategories = [...prev.template.categories];
      newCategories[categoryIndex].subCategories.push(newSubCategory);
      return {
        template: {
          ...prev.template,
          categories: newCategories,
        },
      };
    });
  };

  const addTopic = (categoryIndex: number, subCategoryIndex: number) => {
    const newTopic: Topic = {
      name: "נושא חדש",
      questions: [],
    };

    setQuestionnaire((prev) => {
      const newCategories = [...prev.template.categories];
      newCategories[categoryIndex].subCategories[subCategoryIndex].topics.push(
        newTopic
      );
      return {
        template: {
          ...prev.template,
          categories: newCategories,
        },
      };
    });
  };

  const addQuestion = (path: {
    categoryIndex: number;
    subCategoryIndex?: number;
    topicIndex?: number;
  }) => {
    const newQuestion: Question = {
      q: "שאלה חדשה",
      choice: [],
      qType: "text",
      required: false,
      answer: "",
    };

    setQuestionnaire((prev) => {
      const newCategories = [...prev.template.categories];

      if (
        path.topicIndex !== undefined &&
        path.subCategoryIndex !== undefined
      ) {
        newCategories[path.categoryIndex].subCategories[
          path.subCategoryIndex
        ].topics[path.topicIndex].questions.push(newQuestion);
      } else if (path.subCategoryIndex !== undefined) {
        newCategories[path.categoryIndex].subCategories[
          path.subCategoryIndex
        ].questions.push(newQuestion);
      } else {
        newCategories[path.categoryIndex].questions.push(newQuestion);
      }

      return {
        template: {
          ...prev.template,
          categories: newCategories,
        },
      };
    });
  };

  const deleteCategory = (categoryIndex: number) => {
    setQuestionnaire((prev) => ({
      template: {
        ...prev.template,
        categories: prev.template.categories.filter(
          (_, index) => index !== categoryIndex
        ),
      },
    }));
  };

  const deleteSubCategory = (
    categoryIndex: number,
    subCategoryIndex: number
  ) => {
    setQuestionnaire((prev) => {
      const newCategories = [...prev.template.categories];
      newCategories[categoryIndex].subCategories = newCategories[
        categoryIndex
      ].subCategories.filter((_, index) => index !== subCategoryIndex);
      return {
        template: {
          ...prev.template,
          categories: newCategories,
        },
      };
    });
  };

  const deleteTopic = (
    categoryIndex: number,
    subCategoryIndex: number,
    topicIndex: number
  ) => {
    setQuestionnaire((prev) => {
      const newCategories = [...prev.template.categories];
      newCategories[categoryIndex].subCategories[subCategoryIndex].topics =
        newCategories[categoryIndex].subCategories[
          subCategoryIndex
        ].topics.filter((_, index) => index !== topicIndex);
      return {
        template: {
          ...prev.template,
          categories: newCategories,
        },
      };
    });
  };

  const renderQuestion = (
    question: Question,
    questionIndex: number,
    path: any
  ) => {
    const questionId = `question-${path.categoryIndex}-${
      path.subCategoryIndex || "none"
    }-${path.topicIndex || "none"}-${questionIndex}`;
    const isExpanded = expandedItems.has(questionId);
    const isEditing = editingItem === questionId;

    return (
      <div key={questionIndex} className="ml-8">
        <div key={questionIndex} className="ml-8">
          <div className="mb-2 border border-yellow-200 bg-yellow-50 rounded-md">
            <div className="p-3">
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
                  <button
                    onClick={() =>
                      setEditingItem(isEditing ? null : questionId)
                    }
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button>
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {(isExpanded || isEditing) && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      טקסט השאלה
                    </label>
                    <input
                      type="text"
                      value={question.q}
                      onChange={(e) => {
                        // Update question logic here
                      }}
                      className="text-right w-full border rounded px-2 py-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        סוג השאלה
                      </label>
                      <select
                        value={question.qType}
                        onChange={(e) => {
                          // Update question type logic here
                        }}
                        className="w-full border rounded px-2 py-1 text-right"
                      >
                        <option value="text">טקסט</option>
                        <option value="number">מספר</option>
                        <option value="dropdown">רשימה נפתחת</option>
                        <option value="checkbox">תיבות סימון</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`required-${questionId}`}
                        checked={question.required}
                        onChange={(e) => {
                          // Update required flag logic here
                        }}
                      />
                      <label
                        htmlFor={`required-${questionId}`}
                        className="text-sm"
                      >
                        שאלה חובה
                      </label>
                    </div>
                  </div>

                  {(question.qType === "dropdown" ||
                    question.qType === "checkbox") && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        אפשרויות (מופרדות בפסיק)
                      </label>
                      <textarea
                        value={question.choice.join(", ")}
                        onChange={(e) => {
                          // Update choices logic here
                        }}
                        placeholder="אפשרות 1, אפשרות 2, אפשרות 3"
                        className="text-right w-full border rounded px-2 py-1"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTopic = (
    topic: Topic,
    categoryIndex: number,
    subCategoryIndex: number,
    topicIndex: number
  ) => {
    const topicId = `topic-${categoryIndex}-${subCategoryIndex}-${topicIndex}`;
    const isExpanded = expandedItems.has(topicId);

    return (
      <div key={topicIndex} className="mr-4">
        <div className="mb-2 border border-orange-200 bg-orange-50 rounded-md">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => toggleExpanded(topicId)}>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </button>
                <span className="font-medium">{topic.name}</span>
              </div>

              <div className="flex items-center gap-1 relative">
                <button
                  onClick={() =>
                    deleteTopic(categoryIndex, subCategoryIndex, topicIndex)
                  }
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                <button>
                  <Edit className="h-5 w-5" />
                </button>

                <div className="relative group">
                  <button className="peer">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  <div className="hidden group-hover:block absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-md z-10">
                    <button
                      onClick={() =>
                        addQuestion({
                          categoryIndex,
                          subCategoryIndex,
                          topicIndex,
                        })
                      }
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <Plus className="h-5 w-5 ml-2" />
                      הוסף שאלה
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mr-4">
            {topic.questions.map((question, qIndex) =>
              renderQuestion(question, qIndex, {
                categoryIndex,
                subCategoryIndex,
                topicIndex,
              })
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSubCategory = (
    subCategory: SubCategory,
    categoryIndex: number,
    subCategoryIndex: number
  ) => {
    const subCategoryId = `subcategory-${categoryIndex}-${subCategoryIndex}`;
    const isExpanded = expandedItems.has(subCategoryId);

    return (
      <div key={subCategoryIndex} className="mr-4">
        <div className="mb-2 border border-green-200 bg-green-50 rounded-md">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => toggleExpanded(subCategoryId)}>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </button>
                <span className="font-medium">{subCategory.name}</span>
              </div>

              <div className="flex items-center gap-1 relative">
                <button
                  onClick={() =>
                    deleteSubCategory(categoryIndex, subCategoryIndex)
                  }
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                <button>
                  <Edit className="h-5 w-5" />
                </button>

                <div className="relative group">
                  <button className="peer">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  <div className="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-md z-10">
                    <button
                      onClick={() =>
                        addQuestion({ categoryIndex, subCategoryIndex })
                      }
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <Plus className="h-5 w-5 ml-2" />
                      הוסף שאלה
                    </button>

                    <button
                      onClick={() => addTopic(categoryIndex, subCategoryIndex)}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <Plus className="h-5 w-5 ml-2" />
                      הוסף נושא
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div>
            {subCategory.questions.map((question, qIndex) =>
              renderQuestion(question, qIndex, {
                categoryIndex,
                subCategoryIndex,
              })
            )}

            {subCategory.topics.map((topic, topicIndex) =>
              renderTopic(topic, categoryIndex, subCategoryIndex, topicIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCategory = (category: Category, categoryIndex: number) => {
    const categoryId = `category-${categoryIndex}`;
    const isExpanded = expandedItems.has(categoryId);

    return (
      <div key={categoryIndex} className="mb-4">
        <div className="mb-2 border border-blue-200 bg-blue-50 rounded-md">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => toggleExpanded(categoryId)}>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </button>
                <span className="font-medium">{category.name}</span>
              </div>

              <div className="flex items-center gap-1 relative">
                <button onClick={() => deleteCategory(categoryIndex)}>
                  <Trash2 className="h-5 w-5" />
                </button>

                <button>
                  <Edit className="h-5 w-5" />
                </button>

                <div className="relative group">
                  <button className="peer">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  <div className="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-md z-10">
                    <button
                      onClick={() => addQuestion({ categoryIndex })}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <Plus className="h-5 w-5 ml-2" />
                      הוסף שאלה
                    </button>

                    <button
                      onClick={() => addSubCategory(categoryIndex)}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <Plus className="h-5 w-5 ml-2" />
                      הוסף תת-קטגוריה
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div>
            {category.questions.map((question, qIndex) =>
              renderQuestion(question, qIndex, { categoryIndex })
            )}

            {category.subCategories.map((subCategory, subCategoryIndex) =>
              renderSubCategory(subCategory, categoryIndex, subCategoryIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab("responses")}
                  className="rounded-full"
                >
                  תגובות
                </button>
                <button
                  onClick={() => setActiveTab("questions")}
                  className="rounded-full"
                >
                  שאלות
                </button>
                <button
                  onClick={() => setActiveTab("questionnaires")}
                  className="rounded-full"
                >
                  שאלונים
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  placeholder="חיפוש"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-64 text-right"
                />
              </div>
              <button>
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">בונה שאלונים</h1>
          </div>

          <div className="mb-4">
            <input
              placeholder="שם השאלון"
              value={questionnaire.template.name}
              onChange={(e) =>
                setQuestionnaire((prev) => ({
                  template: {
                    ...prev.template,
                    name: e.target.value,
                  },
                }))
              }
              className="text-right text-lg font-medium"
            />
          </div>
        </div>

        {/* Questionnaire Structure */}
        <div className="space-y-4">
          {questionnaire.template.categories.map((category, index) =>
            renderCategory(category, index)
          )}

          <div className="flex justify-center">
            <button
              onClick={addCategory}
              className="rounded-full w-12 h-12 p-0"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="fixed bottom-6 left-6">
          <button
            onClick={() => {
              console.log("Saving questionnaire:", questionnaire);
              alert("השאלון נשמר בהצלחה!");
            }}
          >
            שמור שאלון
          </button>
        </div>
      </div>
    </div>
  );
}
