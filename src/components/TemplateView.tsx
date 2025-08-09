import React, { useEffect, useState } from 'react';
import TopBar from './TopBar';
import { getTemplate } from '../api/template';
import GenericList from './GenericList';
import Loading from './Loading';
import CategoryListItem from './CategoryListItem';

interface Category {
  name: string;
}

interface Template {
  name: string;
  categories: Category[];
}

interface TemplateViewProps {
  templateId: string;
  onBack: () => void;
}

const TemplateView: React.FC<TemplateViewProps> = ({ templateId, onBack }) => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'alphabetical' | 'date'>('alphabetical');

  useEffect(() => {
    const fetchTemplate = async () => {
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
      <TopBar activeTab="questionnaires" onTabChange={() => onBack()} />
      <h2 style={{ textAlign: 'center' }}>{template.name}</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <div style={{ width: '25%' }}>
          <div style={{ cursor: 'pointer', fontWeight: sortBy === 'alphabetical' ? 'bold' : 'normal' }} onClick={() => setSortBy('alphabetical')}>לפי האלפבית</div>
          <hr style={{ margin: '5px 0' }} />
          <div style={{ cursor: 'pointer', fontWeight: sortBy === 'date' ? 'bold' : 'normal' }} onClick={handleDateSortClick}>לפי תאריך</div>
        </div>
      </div>
      <GenericList
        items={sortedCategories}
        keyExtractor={(item) => item.name}
        renderItem={(item) => <CategoryListItem
        content={item.name}
        onClick={() => console.log('Category clicked:', item.name)}
        onEditClick={() => console.log('Edit clicked for', item.name)}
        onDeleteClick={() => console.log('Delete clicked for', item.name)}
        onPlusClick={() => console.log('Plus clicked for', item.name)}
        onSimplePlusClick={() => console.log('Simple Plus clicked for', item.name)}
        onNewClick={() => console.log('New clicked for', item.name)}
      />}
      />
    </div>
  );
};

export default TemplateView;
