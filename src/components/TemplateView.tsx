import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTemplate, updateTemplate } from '../api/template';
import GenericList from './GenericList';
import Loading from './Loading';
import CategoryListItem from './CategoryListItem';
import CreateSubCategoryPopup from './CreateSubCategoryPopup';
import CreateCategoryPopup from './CreateCategoryPopup';
import RenameCategoryPopup from './RenameCategoryPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import SubCategoryList from './SubCategoryList';

interface SubCategory {
  name: string;
  questions: any[];
  topics: any[];
}

interface Category {
  name: string;
  subCategories: SubCategory[];
  questions: any[];
}

interface Template {
  name: string;
  categories: Category[];
}

interface TemplateViewProps {
  onBack: () => void;
}

const TemplateView: React.FC<TemplateViewProps> = ({ onBack }) => {
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'alphabetical' | 'date'>('alphabetical');
  const [isSubCategoryPopupOpen, setSubCategoryPopupOpen] = useState(false);
  const [isCategoryPopupOpen, setCategoryPopupOpen] = useState(false);
  const [isRenamePopupOpen, setRenamePopupOpen] = useState(false);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;
      try {
        const response = await getTemplate(templateId);
        setTemplate(response.data);
      } catch (err) {
        setError('Failed to fetch template details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const handleCategoryClick = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const handleNewSubCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSubCategoryPopupOpen(true);
  };

  const handleRenameClick = (category: Category) => {
    setSelectedCategory(category);
    setRenamePopupOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setDeletePopupOpen(true);
  };

  const handleClosePopups = () => {
    setSubCategoryPopupOpen(false);
    setCategoryPopupOpen(false);
    setRenamePopupOpen(false);
    setDeletePopupOpen(false);
    setSelectedCategory(null);
  };

  const handleCreateSubCategories = async (names: string[]) => {
    if (!template || !selectedCategory || !templateId) return;

    const newSubCategories: SubCategory[] = names.map(name => ({
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
      await updateTemplate(templateId, updatedTemplate);
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
      name,
      subCategories: [],
      questions: [],
    }));

    const updatedTemplate = {
      ...template,
      categories: [...template.categories, ...newCategories],
    };

    try {
      await updateTemplate(templateId, updatedTemplate);
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
      handleClosePopups();
    } catch (err) {
      setError('Failed to update template.');
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!template || !selectedCategory || !templateId) return;

    const updatedCategories = template.categories.filter(
      cat => cat.name !== selectedCategory.name
    );

    const updatedTemplate = { ...template, categories: updatedCategories };

    try {
      await updateTemplate(templateId, updatedTemplate);
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

  const sortedCategories = [...template.categories].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const handleDateSortClick = () => {
    alert('Date sorting is not yet implemented.');
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>{template.name}</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="button-primary" onClick={() => setCategoryPopupOpen(true)}>
          + קטגוריה חדשה
        </button>
        <div style={{ width: '25%' }}>
          <div style={{ cursor: 'pointer', fontWeight: sortBy === 'alphabetical' ? 'bold' : 'normal' }} onClick={() => setSortBy('alphabetical')}>לפי האלפבית</div>
          <hr style={{ margin: '5px 0' }} />
          <div style={{ cursor: 'pointer', fontWeight: sortBy === 'date' ? 'bold' : 'normal' }} onClick={handleDateSortClick}>לפי תאריך</div>
        </div>
      </div>
      <GenericList
        items={sortedCategories}
        keyExtractor={(item) => item.name}
        renderItem={(item) => (
          <div>
            <CategoryListItem
              content={item.name}
              isExpanded={expandedCategory === item.name}
              onClick={() => handleCategoryClick(item.name)}
              onRenameClick={() => handleRenameClick(item)}
              onDeleteClick={() => handleDeleteClick(item)}
              onPlusQuestionClick={() => console.log('Plus Question clicked for', item.name)}
              onNewClick={() => handleNewSubCategoryClick(item)}
            />
            {expandedCategory === item.name && (
              <SubCategoryList
                subCategories={item.subCategories}
                onRenameClick={(subCategoryName) => console.log('Rename clicked for subcategory:', subCategoryName)}
                onDeleteClick={(subCategoryName) => console.log('Delete clicked for subcategory:', subCategoryName)}
                onPlusQuestionClick={(subCategoryName) => console.log('Plus Question clicked for subcategory:', subCategoryName)}
                onNewClick={(subCategoryName) => console.log('New clicked for subcategory:', subCategoryName)}
              />
            )}
          </div>
        )}
      />
      {isSubCategoryPopupOpen && selectedCategory && (
        <CreateSubCategoryPopup
          categoryName={selectedCategory.name}
          onClose={handleClosePopups}
          onCreate={handleCreateSubCategories}
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
          currentName={selectedCategory.name}
          onClose={handleClosePopups}
          onSave={handleRenameCategory}
        />
      )}
      {isDeletePopupOpen && (
        <ConfirmDeletePopup
          message="למחוק את הקטגוריה?"
          onClose={handleClosePopups}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default TemplateView;