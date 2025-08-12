import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTemplate, updateTemplate } from '../api/template';
import Loading from './Loading';
import CreateSubCategoryPopup from './CreateSubCategoryPopup';
import CreateCategoryPopup from './CreateCategoryPopup';
import CreateTopicPopup from './CreateTopicPopup';
import RenameCategoryPopup from './RenameCategoryPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import TemplateHeader from './TemplateHeader';
import CategoryTree from './CategoryTree';
import type { UICategory, UISubCategory, UITemplate, UITopic } from '../types/template';
import { genUiId, withIds, toServerShape } from '../utils/templateTransforms';

type SubCategory = UISubCategory;
type Category = UICategory;
type Topic = UITopic;
type Template = UITemplate;

interface TemplateViewProps {
  onBack: () => void;
}

const TemplateView: React.FC<TemplateViewProps> = ({ onBack }) => {
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubCategoryPopupOpen, setSubCategoryPopupOpen] = useState(false);
  const [isCategoryPopupOpen, setCategoryPopupOpen] = useState(false);
  const [isRenamePopupOpen, setRenamePopupOpen] = useState(false);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [isTopicPopupOpen, setTopicPopupOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [deletePopupMessage, setDeletePopupMessage] = useState<string>('');

  // Transforms moved to utils/templateTransforms.ts

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;
      try {
        const response = await getTemplate(templateId);
        setTemplate(withIds(response.data));
      } catch (err) {
        setError('Failed to fetch template details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleNewSubCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSubCategoryPopupOpen(true);
  };

  const handleNewTopicClick = (subCategoryName: string, category: Category) => {
    const found = category.subCategories.find(sc => sc.name === subCategoryName) || null;
    setSelectedSubCategory(found);
    setSelectedCategory(category);
    setTopicPopupOpen(true);
  };

  const handleRenameClick = (category: Category) => {
    setSelectedCategory(category);
    setRenamePopupOpen(true);
  };

  const handleRenameSubCategoryClick = (subCategoryName: string, category: Category) => {
    const found = category.subCategories.find(sc => sc.name === subCategoryName) || null;
    setSelectedSubCategory(found);
    setSelectedCategory(category);
    setRenamePopupOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    // If this category is currently expanded, collapse it when initiating delete.
    if (expandedCategory === category.id) {
      setExpandedCategory(null);
    }
    setSelectedCategory(category);
    setDeletePopupMessage('למחוק את הקטגוריה?');
    setDeletePopupOpen(true);
  };

  const handleDeleteSubCategoryClick = (subCategory: SubCategory, category: Category) => {
    setSelectedSubCategory(subCategory);
    setSelectedCategory(category);
    setDeletePopupMessage('למחוק את תת-הקטגוריה?');
    setDeletePopupOpen(true);
  };

  const handleRenameTopicClick = (topicName: string, category: Category, subCategoryName: string) => {
    const subCat = category.subCategories.find(sc => sc.name === subCategoryName) || null;
    const topic = subCat?.topics?.find(t => t.name === topicName) || null;
    setSelectedCategory(category);
    setSelectedSubCategory(subCat);
    setSelectedTopic(topic);
    setRenamePopupOpen(true);
  };

  const handleDeleteTopicClick = (topicName: string, category: Category, subCategoryName: string) => {
    const subCat = category.subCategories.find(sc => sc.name === subCategoryName) || null;
    const topic = subCat?.topics?.find(t => t.name === topicName) || null;
    setSelectedCategory(category);
    setSelectedSubCategory(subCat);
    setSelectedTopic(topic);
    setDeletePopupMessage('למחוק את הנושא?');
    setDeletePopupOpen(true);
  };

  const handleClosePopups = () => {
    setSubCategoryPopupOpen(false);
    setCategoryPopupOpen(false);
    setRenamePopupOpen(false);
    setDeletePopupOpen(false);
    setTopicPopupOpen(false);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedTopic(null);
  };

  const handleCreateSubCategories = async (names: string[]) => {
    if (!template || !selectedCategory || !templateId) return;

    const newSubCategories: SubCategory[] = names.map(name => ({
      id: genUiId(),
      name,
      questions: [],
      topics: [],
    }));

    const updatedCategories = template.categories.map(cat => {
      if (cat.name === selectedCategory.name) {
        return {
          ...cat,
          subCategories: [...(cat.subCategories || []), ...newSubCategories],
        };
      }
      return cat;
    });

    const updatedTemplate = { ...template, categories: updatedCategories };

    try {
      await updateTemplate(templateId, toServerShape(updatedTemplate));
      setTemplate(updatedTemplate);
      handleClosePopups();
    } catch (err) {
      setError('Failed to update template.');
      console.error(err);
    }
  };

  const handleCreateTopics = async (names: string[]) => {
    if (!template || !selectedCategory || !selectedSubCategory || !templateId) return;

    const newTopics = names.map(name => ({
      id: genUiId(),
      name,
      questions: [],
    }));

    const updatedCategories = template.categories.map(cat => {
      if (cat.name === selectedCategory.name) {
        const updatedSubCategories = (cat.subCategories || []).map(subCat => {
          if (subCat.name === selectedSubCategory.name) {
            return {
              ...subCat,
              topics: [...(subCat.topics || []), ...newTopics],
            };
          }
          return subCat;
        });
        return { ...cat, subCategories: updatedSubCategories };
      }
      return cat;
    });

    const updatedTemplate = { ...template, categories: updatedCategories };

    try {
      await updateTemplate(templateId, toServerShape(updatedTemplate));
      setTemplate(updatedTemplate);
      handleClosePopups();
    } catch (err) {
      setError('Failed to update template.');
      console.error(err);
    }
  };

  const handleCreateCategory = async (names: string[]) => {
    if (!template || !templateId) return;

    const existingCategoryNames = new Set(template.categories.map(c => c.name));
    const newNames = names.filter(name => !existingCategoryNames.has(name));

    if (newNames.length === 0) {
      handleClosePopups();
      return;
    }

    const newCategories: Category[] = newNames.map(name => ({
      id: genUiId(),
      name,
      subCategories: [],
      questions: [],
    }));

    const updatedTemplate = {
      ...template,
      categories: [...template.categories, ...newCategories],
    };

    try {
      await updateTemplate(templateId, toServerShape(updatedTemplate));
      setTemplate(updatedTemplate);
      handleClosePopups();
    } catch (err) {
      setError('Failed to update template.');
      console.error(err);
    }
  };

  const handleRenameCategory = async (newName: string) => {
    if (!template || !selectedCategory || !templateId) return;

    const updatedCategories = template.categories.map(cat => {
      if (cat.name === selectedCategory.name) {
        return { ...cat, name: newName };
      }
      return cat;
    });

    const updatedTemplate = { ...template, categories: updatedCategories };

    try {
      await updateTemplate(templateId, updatedTemplate);
      setTemplate(updatedTemplate);
    } catch (err) {
      setError('Failed to update template.');
      console.error(err);
    }
  };

  const handleRenameSubCategory = async (newName: string) => {
    if (!template || !selectedCategory || !selectedSubCategory || !templateId) return;

    const updatedCategories = template.categories.map(cat => {
      if (cat.name === selectedCategory.name) {
        const updatedSubCategories = cat.subCategories.map(subCat => {
          if (subCat.name === selectedSubCategory.name) {
            return { ...subCat, name: newName };
          }
          return subCat;
        });
        return { ...cat, subCategories: updatedSubCategories };
      }
      return cat;
    });

    const updatedTemplate = { ...template, categories: updatedCategories };

    try {
      await updateTemplate(templateId, toServerShape(updatedTemplate));
      setTemplate(updatedTemplate);
    } catch (err) {
      setError('Failed to update template.');
      console.error(err);
    }
  };

  const handleSaveRename = async (newName: string) => {
    if (selectedTopic && selectedSubCategory && selectedCategory && template && templateId) {
      // Rename a topic within a subcategory
      const updatedCategories = template.categories.map(cat => {
        if (cat.name === selectedCategory.name) {
          const updatedSubCategories = cat.subCategories.map(subCat => {
            if (subCat.name === selectedSubCategory.name) {
              const updatedTopics = (subCat.topics || []).map(topic =>
                topic.name === selectedTopic.name ? { ...topic, name: newName } : topic
              );
              return { ...subCat, topics: updatedTopics };
            }
            return subCat;
          });
          return { ...cat, subCategories: updatedSubCategories };
        }
        return cat;
      });
      const updatedTemplate = { ...template, categories: updatedCategories };
      try {
        await updateTemplate(templateId, toServerShape(updatedTemplate));
        setTemplate(updatedTemplate);
      } catch (err) {
        setError('Failed to update template.');
        console.error(err);
      }
    } else if (selectedSubCategory) {
      await handleRenameSubCategory(newName);
    } else if (selectedCategory) {
      await handleRenameCategory(newName);
    }
    handleClosePopups();
  };

  const handleConfirmDelete = async () => {
    if (!template || !templateId) return;

    let updatedCategories;

    if (selectedTopic && selectedSubCategory && selectedCategory) {
      // Delete topic
      updatedCategories = template.categories.map(cat => {
        if (cat.name === selectedCategory.name) {
          return {
            ...cat,
            subCategories: cat.subCategories.map(subCat => {
              if (subCat.name === selectedSubCategory.name) {
                return {
                  ...subCat,
                  topics: (subCat.topics || []).filter(t => t.name !== selectedTopic.name),
                };
              }
              return subCat;
            }),
          };
        }
        return cat;
      });
    } else if (selectedSubCategory && selectedCategory) {
      // Delete subcategory
      updatedCategories = template.categories.map(cat => {
        if (cat.name === selectedCategory.name) {
          return {
            ...cat,
            subCategories: cat.subCategories.filter(
              subCat => subCat.name !== selectedSubCategory.name
            ),
          };
        }
        return cat;
      });
    } else if (selectedCategory) {
      // Delete category
      updatedCategories = template.categories.filter(
        cat => cat.name !== selectedCategory.name
      );
    } else {
      return;
    }

    const updatedTemplate = { ...template, categories: updatedCategories };

    try {
      await updateTemplate(templateId, toServerShape(updatedTemplate));
      setTemplate(updatedTemplate);
      handleClosePopups();
    } catch (err) {
      setError('Failed to update template.');
      console.error(err);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!template) {
    return <div>Template not found.</div>;
  }

  const sortedCategories = [...template.categories];

  return (
    <div>
      <TemplateHeader name={template.name} onNewCategory={() => setCategoryPopupOpen(true)} />
      <CategoryTree
        categories={sortedCategories}
        expandedCategoryId={expandedCategory}
        onToggleCategory={handleCategoryClick}
        onCategoryRenameClick={handleRenameClick}
        onCategoryDeleteClick={handleDeleteClick}
        onNewSubCategoryClick={handleNewSubCategoryClick}
        onSubCategoryRenameClick={handleRenameSubCategoryClick}
        onSubCategoryDeleteClick={handleDeleteSubCategoryClick}
        onNewTopicClick={handleNewTopicClick}
        onTopicRenameClick={handleRenameTopicClick}
        onTopicDeleteClick={handleDeleteTopicClick}
        onTopicPlusQuestionClick={(...args) => console.log('Add question to topic', ...args)}
      />
      {isSubCategoryPopupOpen && selectedCategory && (
        <CreateSubCategoryPopup
          categoryName={selectedCategory.name}
          onClose={handleClosePopups}
          onCreate={handleCreateSubCategories}
          existingSubCategoryNames={(selectedCategory.subCategories || []).map(sc => sc.name)}
        />
      )}
      {isCategoryPopupOpen && (
        <CreateCategoryPopup
          onClose={handleClosePopups}
          onCreate={handleCreateCategory}
          existingCategoryNames={template.categories.map(c => c.name)}
        />
      )}
      {isRenamePopupOpen && selectedCategory && (
        <RenameCategoryPopup
          currentName={selectedTopic ? selectedTopic.name : (selectedSubCategory ? selectedSubCategory.name : selectedCategory.name)}
          onClose={handleClosePopups}
          onSave={handleSaveRename}
          title={selectedTopic ? 'שינוי שם נושא' : (selectedSubCategory ? 'שינוי שם תת-קטגוריה' : 'שינוי שם קטגוריה')}
          existingNames={selectedTopic
            ? (selectedSubCategory?.topics || []).map((t: any) => t.name)
            : (selectedSubCategory
                ? (selectedCategory?.subCategories || []).map(sc => sc.name)
                : template.categories.map(c => c.name)
              )
          }
        />
      )}
      {isTopicPopupOpen && selectedSubCategory && (
        <CreateTopicPopup
          subCategoryName={selectedSubCategory.name}
          onClose={handleClosePopups}
          onCreate={handleCreateTopics}
          existingTopicNames={(selectedSubCategory.topics || []).map(t => t.name)}
        />
      )}
      {isDeletePopupOpen && (
        <ConfirmDeletePopup
          message={deletePopupMessage}
          onClose={handleClosePopups}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default TemplateView;
