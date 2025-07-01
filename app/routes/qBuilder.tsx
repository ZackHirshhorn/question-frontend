import { useState } from "react";
import { useExpandedSet } from "containers/QuestionnaireBuilder/hooks/toggleExpanded";
import { buildId } from "containers/QuestionnaireBuilder/utils/build-id";
import { ToggleBox } from "containers/QuestionnaireBuilder/components/toggleBox";
import {
  Plus,
  Menu,
  Search,
} from "lucide-react";
import type {
  QuestionnaireData,
  Category,
  SubCategory,
  Topic,
  Question,
} from "../../types/questionnaire";

export default function QBuilder() {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    template: {
      name: "",
      categories: [],
    },
  });

  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("questionnaires");
  const { expandedItems, toggleExpanded, isExpanded } = useExpandedSet();

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
      const newSubCategories = [
        ...newCategories[categoryIndex].subCategories,
        newSubCategory,
      ];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        subCategories: newSubCategories,
      };
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
      const newSubCategories = [...newCategories[categoryIndex].subCategories];
      const newTopics = [
        ...newSubCategories[subCategoryIndex].topics,
        newTopic,
      ];
      newSubCategories[subCategoryIndex] = {
        ...newSubCategories[subCategoryIndex],
        topics: newTopics,
      };
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        subCategories: newSubCategories,
      };
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
        const topics = [
          ...newCategories[path.categoryIndex].subCategories[
            path.subCategoryIndex
          ].topics,
        ];
        const topic = {
          ...topics[path.topicIndex],
          questions: [...topics[path.topicIndex].questions, newQuestion],
        };
        topics[path.topicIndex] = topic;
        const subCategories = [
          ...newCategories[path.categoryIndex].subCategories,
        ];
        subCategories[path.subCategoryIndex] = {
          ...subCategories[path.subCategoryIndex],
          topics,
        };
        newCategories[path.categoryIndex] = {
          ...newCategories[path.categoryIndex],
          subCategories,
        };
      } else if (path.subCategoryIndex !== undefined) {
        const subCategories = [
          ...newCategories[path.categoryIndex].subCategories,
        ];
        const subCategory = {
          ...subCategories[path.subCategoryIndex],
          questions: [
            ...subCategories[path.subCategoryIndex].questions,
            newQuestion,
          ],
        };
        subCategories[path.subCategoryIndex] = subCategory;
        newCategories[path.categoryIndex] = {
          ...newCategories[path.categoryIndex],
          subCategories,
        };
      } else {
        const questions = [
          ...newCategories[path.categoryIndex].questions,
          newQuestion,
        ];
        newCategories[path.categoryIndex] = {
          ...newCategories[path.categoryIndex],
          questions,
        };
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
    path: {
      categoryIndex: number;
      subCategoryIndex?: number;
      topicIndex?: number;
    }
  ) => {
    const questionId = buildId(
      "question",
      [path.categoryIndex, path.subCategoryIndex, path.topicIndex],
      questionIndex
    );
    const expanded = isExpanded(questionId);
    const isEditing = editingItem === questionId;

    return (
      <ToggleBox
        id={questionId}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
        title={question.q}
        className=""
        onDelete={() => {
          /* implement delete question */
        }}
        onEdit={() => setEditingItem(isEditing ? null : questionId)}
        moreActions={<>{/* your action buttons if any */}</>}
      >
        {(expanded || isEditing) && <div>{/* Question editing UI here */}</div>}
      </ToggleBox>
    );
  };

  const renderTopic = (
    topic: Topic,
    categoryIndex: number,
    subCategoryIndex: number,
    topicIndex: number
  ) => {
    const topicId = buildId(
      "topic",
      [categoryIndex, subCategoryIndex],
      topicIndex
    );
    const expanded = isExpanded(topicId);

    return (
      <ToggleBox
        id={topicId}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
        title={topic.name}
        className=""
        onDelete={() =>
          deleteTopic(categoryIndex, subCategoryIndex, topicIndex)
        }
        onEdit={() => setEditingItem(topicId)}
        moreActions={
          <button
            onClick={() =>
              addQuestion({ categoryIndex, subCategoryIndex, topicIndex })
            }
            className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
          >
            <Plus className="h-5 w-5 ml-2" />
            הוסף שאלה
          </button>
        }
      >
        {topic.questions.map((question, questionIndex) =>
          renderQuestion(question, questionIndex, {
            categoryIndex,
            subCategoryIndex,
            topicIndex,
          })
        )}
      </ToggleBox>
    );
  };

  const renderSubCategory = (
    subCategory: SubCategory,
    categoryIndex: number,
    subCategoryIndex: number
  ) => {
    const subCategoryId = buildId(
      "subcategory",
      [categoryIndex],
      subCategoryIndex
    );
    const expanded = isExpanded(subCategoryId);

    return (
      <ToggleBox
        id={subCategoryId}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
        title={subCategory.name}
        className=""
        onDelete={() => deleteSubCategory(categoryIndex, subCategoryIndex)}
        onEdit={() => setEditingItem(subCategoryId)}
        moreActions={
          <>
            <button
              onClick={() => addQuestion({ categoryIndex, subCategoryIndex })}
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-200"
            >
              <Plus className="h-5 w-5 ml-2" />
              הוסף שאלה
            </button>
            <button
              onClick={() => addTopic(categoryIndex, subCategoryIndex)}
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-200"
            >
              <Plus className="h-5 w-5 ml-2" />
              הוסף נושא
            </button>
          </>
        }
      >
        {subCategory.questions.map((question, qIndex) =>
          renderQuestion(question, qIndex, { categoryIndex, subCategoryIndex })
        )}
        {subCategory.topics.map((topic, topicIndex) =>
          renderTopic(topic, categoryIndex, subCategoryIndex, topicIndex)
        )}
      </ToggleBox>
    );
  };

  const renderCategory = (category: Category, categoryIndex: number) => {
    const categoryId = buildId("category", [], categoryIndex);
    const expanded = isExpanded(categoryId);

    return (
      <ToggleBox
        id={categoryId}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
        title={category.name}
        className=""
        onDelete={() => deleteCategory(categoryIndex)}
        onEdit={() => setEditingItem(categoryId)}
        moreActions={
          <>
            <button
              onClick={() => addQuestion({ categoryIndex })}
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-200"
            >
              <Plus className="h-5 w-5 ml-2" />
              הוסף שאלה
            </button>
            <button
              onClick={() => addSubCategory(categoryIndex)}
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-200"
            >
              <Plus className="h-5 w-5 ml-2" />
              הוסף תת-קטגוריה
            </button>
          </>
        }
      >
        {category.questions.map((question, qIndex) =>
          renderQuestion(question, qIndex, { categoryIndex })
        )}
        {category.subCategories.map((subCategory, subCategoryIndex) =>
          renderSubCategory(subCategory, categoryIndex, subCategoryIndex)
        )}
      </ToggleBox>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black" dir="rtl">
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
            <h1 className="text-2xl font-bold">בניית שאלון</h1>
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
        <div className="fixed bottom-6 left-6 border px-8 py-3 rounded-md hover:bg-black hover:text-white transition-all">
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