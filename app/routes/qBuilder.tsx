import { useState, useEffect } from "react";
import { useExpandedSet } from "containers/QuestionnaireBuilder/hooks/toggleExpanded";
import { buildId } from "containers/QuestionnaireBuilder/utils/build-id";
import { ToggleBox } from "containers/QuestionnaireBuilder/components/toggleBox";
import { Plus, Menu, Search } from "lucide-react";
import type {
  QuestionnaireData,
  Category,
  SubCategory,
  Topic,
  Question,
} from "../../types/questionnaire";
import axios from "axios";

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

  const ActionButton = ({
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
  );

  // Fetch template from API on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/template")
      .then((res) => {
        if (res.data) {
          setQuestionnaire(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch template:", err);
      });
  }, []);

  const createCategory = (index: number): Category => ({
    name: `קטגוריה ${index + 1}`,
    questions: [],
    subCategories: [],
  });

  const createSubCategory = (): SubCategory => ({
    name: "תת-קטגוריה חדשה",
    questions: [],
    topics: [],
  });

  const createTopic = (): Topic => ({
    name: "נושא חדש",
    questions: [],
  });

  const addCategory = () => {
    setQuestionnaire((prev) => {
      const categories = [...prev.template.categories];

      categories.push(createCategory(categories.length));

      return { template: { ...prev.template, categories } };
    });
  };

  const addSubCategory = (categoryIndex: number) => {
    setQuestionnaire((prev) => {
      const categories = [...prev.template.categories];
      const category = { ...categories[categoryIndex] };

      category.subCategories = [...category.subCategories, createSubCategory()];
      categories[categoryIndex] = category;

      return { template: { ...prev.template, categories } };
    });
  };

  const addTopic = (categoryIndex: number, subCategoryIndex: number) => {
    setQuestionnaire((prev) => {
      const categories = [...prev.template.categories];
      const category = { ...categories[categoryIndex] };
      const subCategories = [...category.subCategories];
      const subCategory = { ...subCategories[subCategoryIndex] };

      subCategory.topics = [...subCategory.topics, createTopic()];
      subCategories[subCategoryIndex] = subCategory;
      category.subCategories = subCategories;
      categories[categoryIndex] = category;

      return { template: { ...prev.template, categories } };
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
    setQuestionnaire((prev) => {
      const categories = prev.template.categories.filter(
        (_, i) => i !== categoryIndex
      );

      return { template: { ...prev.template, categories } };
    });
  };

  const deleteSubCategory = (
    categoryIndex: number,
    subCategoryIndex: number
  ) => {
    setQuestionnaire((prev) => {
      const categories = [...prev.template.categories];
      const category = { ...categories[categoryIndex] };

      category.subCategories = category.subCategories.filter(
        (_, i) => i !== subCategoryIndex
      );
      categories[categoryIndex] = category;

      return { template: { ...prev.template, categories } };
    });
  };

  const deleteTopic = (
    categoryIndex: number,
    subCategoryIndex: number,
    topicIndex: number
  ) => {
    setQuestionnaire((prev) => {
      const categories = [...prev.template.categories];
      const category = { ...categories[categoryIndex] };
      const subCategories = [...category.subCategories];
      const subCategory = { ...subCategories[subCategoryIndex] };

      subCategory.topics = subCategory.topics.filter(
        (_, i) => i !== topicIndex
      );
      subCategories[subCategoryIndex] = subCategory;
      category.subCategories = subCategories;
      categories[categoryIndex] = category;

      return { template: { ...prev.template, categories } };
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
        onDelete={() =>
          deleteTopic(categoryIndex, subCategoryIndex, topicIndex)
        }
        onEdit={() => setEditingItem(topicId)}
        moreActions={
          <ActionButton
            onClick={() =>
              addQuestion({ categoryIndex, subCategoryIndex, topicIndex })
            }
            label="הוסף שאלה"
          />
        }
      >
        {topic.questions.map((q, i) =>
          renderQuestion(q, i, { categoryIndex, subCategoryIndex, topicIndex })
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
        onDelete={() => deleteSubCategory(categoryIndex, subCategoryIndex)}
        onEdit={() => setEditingItem(subCategoryId)}
        moreActions={
          <>
            <ActionButton
              onClick={() => addQuestion({ categoryIndex, subCategoryIndex })}
              label="הוסף שאלה"
            />
            <ActionButton
              onClick={() => addTopic(categoryIndex, subCategoryIndex)}
              label="הוסף נושא"
            />
          </>
        }
      >
        {subCategory.questions.map((q, i) =>
          renderQuestion(q, i, { categoryIndex, subCategoryIndex })
        )}
        {subCategory.topics.map((t, i) =>
          renderTopic(t, categoryIndex, subCategoryIndex, i)
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
        onDelete={() => deleteCategory(categoryIndex)}
        onEdit={() => setEditingItem(categoryId)}
        moreActions={
          <>
            <ActionButton
              onClick={() => addQuestion({ categoryIndex })}
              label="הוסף שאלה"
            />
            <ActionButton
              onClick={() => addSubCategory(categoryIndex)}
              label="הוסף תת-קטגוריה"
            />
          </>
        }
      >
        {category.questions.map((q, i) =>
          renderQuestion(q, i, { categoryIndex })
        )}
        {category.subCategories.map((sc, i) =>
          renderSubCategory(sc, categoryIndex, i)
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
            onClick={async () => {
              try {
                await axios.post(
                  "http://localhost:5000/api/template",
                  { template: questionnaire.template } // <-- wrap in { template: ... }
                );
                alert("השאלון נשמר בהצלחה!");
              } catch (err) {
                alert("שגיאה בשמירת השאלון");
                console.error(err);
              }
            }}
          >
            שמור שאלון
          </button>
        </div>
      </div>
    </div>
  );
}
