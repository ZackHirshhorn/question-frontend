import React, { useEffect, useState } from 'react';
import { deleteTemplate, getTemplate, getUserTemplates, updateTemplate } from '../../api/template';
import type { UITemplate } from '../../types/template';
import CreateTemplate from './CreateTemplatePopup';
import GenericList from './GenericList';
import '../CreateTemplate.css';
import Loading from '../Loading';
import TemplateListItem from './TemplateListItem';
import { useSorter } from './Sorter';
import UndoBanner from './UndoBanner';
import ConfirmDeletePopup from '../ConfirmDeletePopup';
import { useUndoableDelete } from '../../hooks/useUndoableDelete';
import RenamePopup from '../RenamePopup';
import LinkPopup from './LinkPopup';

interface Template {
  id: string;
  name: string;
}

interface TemplatesProps {
  onTemplateClick: (templateId: string) => void;
}

import '../Button.css';
import PlusWhiteIcon from '../../assets/icons/PlusWhiteIcon';

const Templates: React.FC<TemplatesProps> = ({ onTemplateClick }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const { pending, trigger, undo } = useUndoableDelete<Template[]>();
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await getUserTemplates();
      setTemplates(response.data.templates);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to fetch templates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = (templateId: string) => {
    const templateToDelete = templates.find((t) => t.id === templateId);
    if (!templateToDelete) return;
    const snapshot = templates;
    const updated = templates.filter((t) => t.id !== templateId);
    trigger({
      label: `נמחק: '${templateToDelete.name}'`,
      snapshot,
      applyOptimistic: () => setTemplates(updated),
      commit: async () => {
        try {
          await deleteTemplate(templateId);
        } catch (err) {
          console.error('Failed to delete template:', err);
          setError('Failed to delete template. Please try again later.');
          throw err;
        }
      },
      restore: (snap) => setTemplates(snap),
    });
  };

  const handleAddNew = () => {
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
  };

  const handleTemplateCreated = () => {
    // After creating a questionnaire, we might want to switch to the responses tab
    // or show a success message. For now, we just close the popup.
    setPopupOpen(false);
    fetchTemplates();
  };

  const handleRename = async (newName: string) => {
    if (!renameTarget) return;
    const { id } = renameTarget;
    try {
      setIsRenaming(true);
      const start = Date.now();
      // Fetch full template to satisfy server contract (needs categories array)
      const res = await getTemplate(id);
      const serverTemplate = (res?.data?.template || res?.data) as unknown as UITemplate; // support either shape
      const payload = { ...serverTemplate, name: newName };
      await updateTemplate(id, payload);
      // Ensure spinner is visible for a minimum duration to signal persistence
      const MIN_SPINNER_MS = 600;
      const elapsed = Date.now() - start;
      if (elapsed < MIN_SPINNER_MS) {
        await new Promise((r) => setTimeout(r, MIN_SPINNER_MS - elapsed));
      }
      setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, name: newName } : t)));
      setRenameTarget(null);
      await fetchTemplates();
    } catch (e) {
      console.error('Failed to rename template:', e);
      setError('Failed to rename template. Please try again later.');
    } finally {
      setIsRenaming(false);
    }
  };

  const { sortedItems, Controls } = useSorter(
    templates,
    {
      'לפי האלפבית': (a, b) => a.name.localeCompare(b.name),
      'לפי תאריך': () => 0,
    },
    'לפי האלפבית',
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  const buildAnswerLink = (id: string): string => {
    const base = window.location.origin.replace(/\/$/, '');
    return `${base}/start/${id}`;
  };

  // Per flow: build link locally using the template id; no server call here.

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button
          className="button-primary"
          onClick={handleAddNew}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '4px',
            border: '1px solid #0957D0',
            fontSize: '16px',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '100%',
              letterSpacing: '0',
              textAlign: 'right',
            }}
          >
            שאלון חדש
          </span>
          <PlusWhiteIcon />
        </button>
        <Controls />
      </div>
      <div style={{ position: 'relative', paddingTop: pending ? '52px' : 0 }}>
        {pending && (
          <UndoBanner label={pending.label} onUndo={undo} />
        )}
        <GenericList
          items={sortedItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => (
            <TemplateListItem
              content={item.name}
              onClick={() => onTemplateClick(item.id)}
              onDeleteClick={() => setConfirmDelete({ id: item.id, name: item.name })}
              onRenameClick={() => setRenameTarget({ id: item.id, name: item.name })}
              onLinkClick={() => setLinkUrl(buildAnswerLink(item.id))}
            />
          )}
        />
      </div>
      {confirmDelete && (
        <ConfirmDeletePopup
          message={`למחוק '${confirmDelete.name}'?`}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => {
            handleDelete(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
      {renameTarget && (
        <RenamePopup
          currentName={renameTarget.name}
          onClose={() => setRenameTarget(null)}
          onSave={handleRename}
          title="שינוי שם שאלון"
          saving={isRenaming}
          existingNames={templates
            .map((t) => t.name)
            .filter((n) => n && n.trim() !== renameTarget.name.trim())}
        />
      )}
      {isPopupOpen && (
        <CreateTemplate
          onClose={handleClosePopup}
          onTemplateCreated={handleTemplateCreated}
          existingTemplateNames={templates.map(t => t.name)}
        />
      )}
      {linkUrl && (
        <LinkPopup url={linkUrl} onClose={() => setLinkUrl(null)} />
      )}
    </>
  );
};

export default Templates;
