/**
 * TemplateView displays a single template and allows managing its
 * categories, subcategories, and topics. It also integrates a popup
 * to select a question collection when the user clicks the
 * "הוספת שאלה" icon at any level.
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTemplate, updateTemplate } from '../../api/template';
import Loading from '../Loading';
import CreateNamesPopup from './CreateNamesPopup';
import RenamePopup from '../RenamePopup';
import UndoBanner from './UndoBanner';
import ConfirmDeletePopup from '../ConfirmDeletePopup';
import TemplateHeader from './TemplateHeader';
import SelectQuestionsColPopup from './SelectQuestionsColPopup';
import CategoryTree from './CategoryTree';
import type { UICategory, UISubCategory, UITemplate, UITopic } from '../../types/template';
import { genUiId, withIds } from '../../utils/templateTransforms';
import { useUndoableDelete } from '../../hooks/useUndoableDelete';

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
  const [savingPopup, setSavingPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubCategoryPopupOpen, setSubCategoryPopupOpen] = useState(false);
  const [isCategoryPopupOpen, setCategoryPopupOpen] = useState(false);
  const [isRenamePopupOpen, setRenamePopupOpen] = useState(false);
  const [isTopicPopupOpen, setTopicPopupOpen] = useState(false);
  /** Controls visibility of the question-collection selection popup */
  const [isSelectColOpen, setSelectColOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  /**
   * The context for where the user is adding a question from.
   * It determines the popup title and will be used to apply the selection
   * to the appropriate part of the template.
   */
  const [selectContext, setSelectContext] = useState<
    | { level: 'category'; category: Category }
    | { level: 'subCategory'; category: Category; subCategoryName: string }
    | { level: 'topic'; category: Category; subCategoryName: string; topicName: string }
    | null
  >(null);

  /**
   * Apply a list of question IDs to the selected context within the template.
   * Current UX requirement: a single question collection per unit, so we
   * replace any existing IDs with the provided list (typically one item).
   */
  const applyQuestionsToContext = (base: Template, ctx: NonNullable<typeof selectContext>, ids: string[]): Template => {
    const toIdArray = (source: string[]) => Array.from(new Set(source.filter((id) => typeof id === 'string' && id.length > 0)));
    const replacement = toIdArray(ids);

    if (ctx.level === 'category') {
      const updatedCategories = base.categories.map((cat) =>
        cat.name === ctx.category.name ? { ...cat, questions: replacement } : cat,
      );
      return { ...base, categories: updatedCategories };
    }
    if (ctx.level === 'subCategory') {
      const updatedCategories = base.categories.map((cat) => {
        if (cat.name !== ctx.category.name) return cat;
        const updatedSub = (cat.subCategories || []).map((sc) =>
          sc.name === ctx.subCategoryName ? { ...sc, questions: replacement } : sc,
        );
        return { ...cat, subCategories: updatedSub };
      });
      return { ...base, categories: updatedCategories };
    }
    // topic level
    const updatedCategories = base.categories.map((cat) => {
      if (cat.name !== ctx.category.name) return cat;
      const updatedSub = (cat.subCategories || []).map((sc) => {
        if (sc.name !== ctx.subCategoryName) return sc;
        const updatedTopics = (sc.topics || []).map((tp) =>
          tp.name === ctx.topicName ? { ...tp, questions: replacement } : tp,
        );
        return { ...sc, topics: updatedTopics };
      });
      return { ...cat, subCategories: updatedSub };
    });
    return { ...base, categories: updatedCategories };
  };
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { pending, trigger, undo } = useUndoableDelete<Template>();
  const [confirmDelete, setConfirmDelete] = useState<{ perform: () => void; message: string } | null>(null);

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

  // Reference onBack to satisfy lint while keeping current UX intact
  useEffect(() => {
    // no-op; dependency ensures onBack is considered used
  }, [onBack]);

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
    setConfirmDelete({
      message: `למחוק '${category.name}'?`,
      perform: () => {
        if (!template || !templateId) return;
        if (expandedCategory === category.id) {
          setExpandedCategory(null);
        }
        const snapshot = template;
        const updatedCategories = template.categories.filter((cat) => cat.name !== category.name);
        const updatedTemplate = { ...template, categories: updatedCategories };
        trigger({
          label: `נמחק: '${category.name}'`,
          snapshot,
          applyOptimistic: () => setTemplate(updatedTemplate),
          commit: async () => {
            await updateTemplate(templateId, updatedTemplate);
          },
          restore: (snap) => setTemplate(snap),
        });
      },
    });
  };

  const handleDeleteSubCategoryClick = (subCategory: SubCategory, category: Category) => {
    setConfirmDelete({
      message: `למחוק '${subCategory.name}'?`,
      perform: () => {
        if (!template || !templateId) return;
        const snapshot = template;
        const updatedCategories = template.categories.map((cat) => {
          if (cat.name === category.name) {
            return {
              ...cat,
              subCategories: (cat.subCategories || []).filter((sc) => sc.name !== subCategory.name),
            };
          }
          return cat;
        });
        const updatedTemplate = { ...template, categories: updatedCategories };
        trigger({
          label: `נמחק: '${subCategory.name}'`,
          snapshot,
          applyOptimistic: () => setTemplate(updatedTemplate),
          commit: async () => {
            await updateTemplate(templateId, updatedTemplate);
          },
          restore: (snap) => setTemplate(snap),
        });
      },
    });
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
    setConfirmDelete({
      message: `למחוק '${topicName}'?`,
      perform: () => {
        if (!template || !templateId) return;
        const snapshot = template;
        const updatedCategories = template.categories.map((cat) => {
          if (cat.name === category.name) {
            return {
              ...cat,
              subCategories: (cat.subCategories || []).map((sc) => {
                if (sc.name === subCategoryName) {
                  return { ...sc, topics: (sc.topics || []).filter((t) => t.name !== topicName) };
                }
                return sc;
              }),
            };
          }
          return cat;
        });
        const updatedTemplate = { ...template, categories: updatedCategories };
        trigger({
          label: `נמחק: '${topicName}'`,
          snapshot,
          applyOptimistic: () => setTemplate(updatedTemplate),
          commit: async () => {
            await updateTemplate(templateId, updatedTemplate);
          },
          restore: (snap) => setTemplate(snap),
        });
      },
    });
  };

  /** Close all modals/popups and clear selection context */
  const handleClosePopups = () => {
    setSubCategoryPopupOpen(false);
    setCategoryPopupOpen(false);
    setRenamePopupOpen(false);
    setTopicPopupOpen(false);
    setSelectColOpen(false);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedTopic(null);
    setSelectContext(null);
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
      setSavingPopup(true);
      await updateTemplate(templateId, updatedTemplate);
      setTemplate(updatedTemplate);
      handleClosePopups();
    } catch (err) {
      setError('Failed to update template.');
      console.error(err);
    } finally {
      setSavingPopup(false);
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
      setSavingPopup(true);
      await updateTemplate(templateId, updatedTemplate);
      setTemplate(updatedTemplate);
      handleClosePopups();
    } catch (err) {
      setError('Failed to update template.');
      console.error(err);
    } finally {
      setSavingPopup(false);
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
      setSavingPopup(true);
      await updateTemplate(templateId, updatedTemplate);
      setTemplate(updatedTemplate);
      handleClosePopups();
    } catch (err) {
      setError('Failed to update template.');
      console.error(err);
    } finally {
      setSavingPopup(false);
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
      await updateTemplate(templateId, updatedTemplate);
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
        setSavingPopup(true);
        await updateTemplate(templateId, updatedTemplate);
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
    setSavingPopup(false);
  };

  // confirm delete flow replaced by optimistic delete with undo

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
      <div style={{ position: 'relative', paddingTop: pending ? '52px' : 0 }}>
        {pending && <UndoBanner label={pending.label} onUndo={undo} />}
        {/** no-op placeholder removed: selection is derived inline when rendering popup */}
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
        // When clicking "הוספת שאלה" at topic level, open the selection popup
        onTopicPlusQuestionClick={(topicName, category, subCategoryName) => {
          setSelectContext({ level: 'topic', topicName, category, subCategoryName });
          setSelectColOpen(true);
        }}
        // Category-level "הוספת שאלה"
        onCategoryPlusQuestionClick={(category) => {
          setSelectContext({ level: 'category', category });
          setSelectColOpen(true);
        }}
        // Subcategory-level "הוספת שאלה"
        onSubCategoryPlusQuestionClick={(subCategoryName, category) => {
          setSelectContext({ level: 'subCategory', subCategoryName, category });
          setSelectColOpen(true);
        }}
        />
      </div>
      {isSubCategoryPopupOpen && selectedCategory && (
        <CreateNamesPopup
          title={`הוספת תת קטגוריה חדשה עבור ${selectedCategory.name}`}
          fieldLabel="שם תת הקטגוריה"
          addButtonText="הוסף עוד"
          primaryButtonText="שמור"
          savingText="שומר…"
          duplicateErrorText="תת-קטגוריה עם שם זה כבר קיימת."
          existingNames={(selectedCategory.subCategories || []).map(sc => sc.name)}
          onClose={handleClosePopups}
          onCreate={handleCreateSubCategories}
          saving={savingPopup}
        />
      )}
      {isCategoryPopupOpen && (
        <CreateNamesPopup
          title="יצירת קטגוריה חדשה"
          fieldLabel="שמות הקטגוריות"
          addButtonText="הוסף קטגוריה נוספת"
          primaryButtonText="יצירה"
          duplicateErrorText="קטגוריה עם שם זה כבר קיימת."
          existingNames={template.categories.map(c => c.name)}
          onClose={handleClosePopups}
          onCreate={handleCreateCategory}
          saving={savingPopup}
        />
      )}
      {isRenamePopupOpen && selectedCategory && (
        <RenamePopup
          currentName={selectedTopic ? selectedTopic.name : (selectedSubCategory ? selectedSubCategory.name : selectedCategory.name)}
          onClose={handleClosePopups}
          onSave={handleSaveRename}
          title={selectedTopic ? 'שינוי שם נושא' : (selectedSubCategory ? 'שינוי שם תת-קטגוריה' : 'שינוי שם קטגוריה')}
          existingNames={selectedTopic
            ? (selectedSubCategory?.topics || []).map((t: { name: string }) => t.name)
            : (selectedSubCategory
                ? (selectedCategory?.subCategories || []).map(sc => sc.name)
                : template.categories.map(c => c.name)
              )
          }
          saving={savingPopup}
        />
      )}
      {isTopicPopupOpen && selectedSubCategory && (
        <CreateNamesPopup
          title={`הוספת נושא חדש עבור ${selectedSubCategory.name}`}
          fieldLabel="שם הנושא"
          addButtonText="הוסף עוד"
          primaryButtonText="שמור"
          savingText="שומר…"
          duplicateErrorText="נושא עם שם זה כבר קיים."
          existingNames={(selectedSubCategory.topics || []).map(t => t.name)}
          onClose={handleClosePopups}
          onCreate={handleCreateTopics}
          saving={savingPopup}
        />
      )}
      {isSelectColOpen && (
        <SelectQuestionsColPopup
          title={
            selectContext?.level === 'category'
              ? `בחירת אסופת שאלות לקטגוריה '${selectContext?.category.name}'`
              : selectContext?.level === 'subCategory'
              ? `בחירת אסופת שאלות לתת-קטגוריה '${selectContext?.subCategoryName}'`
              : selectContext?.level === 'topic'
              ? `בחירת אסופת שאלות לנושא '${selectContext?.topicName}'`
              : 'בחירת אסופת שאלות'
          }
          onClose={() => setSelectColOpen(false)}
          initialSelectedId={(() => {
            if (!template || !selectContext) return undefined;
            const ensureStringIds = (list?: unknown[]) => {
              if (!Array.isArray(list)) return [] as string[];
              return list.filter((id): id is string => typeof id === 'string' && id.length > 0);
            };

            const findCategory = (name: string) =>
              template.categories.find((c) => c.name === name);

            const lastId = (ids: string[]) => (ids.length > 0 ? ids[ids.length - 1] : undefined);

            if (selectContext.level === 'category') {
              const cat = findCategory(selectContext.category.name);
              return lastId(ensureStringIds(cat?.questions));
            }

            if (selectContext.level === 'subCategory') {
              const cat = findCategory(selectContext.category.name);
              const sub = cat?.subCategories?.find((sc) => sc.name === selectContext.subCategoryName);
              return lastId(ensureStringIds(sub?.questions));
            }

            const cat = findCategory(selectContext.category.name);
            const sub = cat?.subCategories?.find((sc) => sc.name === selectContext.subCategoryName);
            const topic = sub?.topics?.find((tp) => tp.name === selectContext.topicName);
            return lastId(ensureStringIds(topic?.questions));
          })()}
          onSelect={(collection) => {
            if (!template || !templateId || !selectContext) return;
            setSavingPopup(true);
            const collectionId = collection._id;
            if (!collectionId) {
              setError('אסופת השאלות שנבחרה אינה תקינה');
              setSavingPopup(false);
              setSelectContext(null);
              return;
            }

            const updated = applyQuestionsToContext(template, selectContext, [collectionId]);
            updateTemplate(templateId, updated)
              .then(() => {
                setTemplate(updated);
              })
              .catch((e) => {
                console.error('Failed to add collection questions', e);
                setError('שגיאה בהוספת שאלות מהאסופה');
              })
              .finally(() => {
                setSavingPopup(false);
                setSelectColOpen(false);
                setSelectContext(null);
              });
          }}
        />
      )}
      {confirmDelete && (
        <ConfirmDeletePopup
          message={confirmDelete.message}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => { confirmDelete.perform(); setConfirmDelete(null); }}
        />
      )}
    </div>
  );
};

export default TemplateView;
