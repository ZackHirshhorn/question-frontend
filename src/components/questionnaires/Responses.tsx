import React, { useEffect, useMemo, useState } from 'react';
import SearchIcon from '../../assets/icons/SearchIcon';
import GreenCheckIcon from '../../assets/icons/GreenCheckIcon';
import ProgressIcon from '../../assets/icons/ProgressIcon';
import LineSeparatorIcon from '../../assets/icons/LineSeparatorIcon';
import CustomSelect from '../CustomSelect';
import type { CustomSelectOption } from '../CustomSelect';
import './Responses.css';
import Loading from '../Loading';
import { getTemplatesSummary, type TemplateSummary } from '../../api/template';
import DatePicker from '../DatePicker';

interface ResponseSummary {
  id: string;
  name: string;
  totalResponses: number;
  completedResponses: number;
  inProgressResponses: number;
}

interface QuestionnaireMock {
  id: string;
  templateId: string;
  template: {
    name: string | null;
    categories: Array<{
      name: string;
      questions: Array<{
        q: string;
        answer: string;
      }>;
    }>;
  };
  userName: string;
  userEmail: string | null;
  userPhone: string | null;
  isComplete: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

const createMockResponses = (template: { id: string; name: string }): QuestionnaireMock[] => {
  const baseDate = new Date('2024-09-01T08:00:00.000Z');
  return Array.from({ length: 5 }).map((_, index) => {
    const createdAt = new Date(baseDate.getTime() + index * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + 20 * 60 * 1000);
    return {
      id: `${template.id}-mock-${index + 1}`,
      templateId: template.id,
      template: {
        name: template.name,
        categories: [
          {
            name: `קטגוריה ${index + 1}`,
            questions: [
              {
                q: `שאלה ${index + 1}`,
                answer: `תשובה ${index + 1}`,
              },
            ],
          },
        ],
      },
      userName: `נמען ${index + 1}`,
      userEmail: `user${index + 1}@example.com`,
      userPhone: `050-0000${index + 1}0`,
      isComplete: index % 2 === 0,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  });
};

const Responses: React.FC = () => {
  const [responseSummaries, setResponseSummaries] = useState<ResponseSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string } | null>(null);
  const [templateResponses, setTemplateResponses] = useState<QuestionnaireMock[]>([]);
  const [responsesLoading, setResponsesLoading] = useState<boolean>(false);

  const searchWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fill: '#9aa0a6',
    pointerEvents: 'none',
  };

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    paddingRight: '40px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    lineHeight: '100%',
    letterSpacing: '0',
    textAlign: 'right',
    borderRadius: '8px',
    border: '1px solid #E6EAFF',
    backgroundColor: '#F6F6F9',
    boxSizing: 'border-box',
  };

  const filterOptions = useMemo<CustomSelectOption[]>(
    () => [
      {
        value: 'date',
        label: 'תאריך',
      },
    ],
    [],
  );

  const [filterValue, setFilterValue] = useState<string>('date');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getTemplatesSummary();
        if (!isMounted) {
          return;
        }
        const normalized = data.map((summary: TemplateSummary): ResponseSummary => ({
          id: summary.id,
          name: summary.name,
          totalResponses: summary.responses,
          completedResponses: summary.complete,
          inProgressResponses: summary.incomplete,
        }));
        setResponseSummaries(normalized);
      } catch (err) {
        console.error('Failed to fetch templates summary:', err);
        if (isMounted) {
          setError('שגיאה בטעינת סיכום התגובות. נסו שוב מאוחר יותר.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTemplate) {
      return;
    }

    setResponsesLoading(true);
    const mockResponses = createMockResponses(selectedTemplate);
    setTemplateResponses(mockResponses);
    setResponsesLoading(false);
  }, [selectedTemplate]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '24px' }}>{error}</div>;
  }

  return (
    <div>
      <div style={searchWrapperStyle}>
        <SearchIcon style={iconStyle} />
        <input
          type="search"
          placeholder="חיפוש"
          aria-label="חיפוש"
          style={searchInputStyle}
          className="responses-searchInput"
        />
      </div>

      <div className="responses-controlsRow">
        <button
          type="button"
          className="button-primary responses-button responses-button--completed"
        >
          <span>הושלם</span>
          <GreenCheckIcon className="responses-buttonIcon" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="button-secondary responses-button responses-button--progress"
        >
          <span>לא הושלם</span>
          <ProgressIcon className="responses-buttonIcon" aria-hidden="true" />
        </button>
        <CustomSelect
          className="responses-select"
          value={filterValue}
          options={filterOptions}
          onChange={setFilterValue}
          ariaLabel="סינון תגובות"
        />
        <div className="responses-datePanel">
          <span className="responses-dateLabel">לתקופה</span>
          <DatePicker
            value={fromDate}
            onChange={setFromDate}
            ariaLabel="מתאריך"
            buttonAriaLabel="פתח בורר תאריך מתאריך"
          />
          <LineSeparatorIcon className="responses-dateSeparator" aria-hidden="true" />
          <DatePicker
            value={toDate}
            onChange={setToDate}
            ariaLabel="עד תאריך"
            buttonAriaLabel="פתח בורר תאריך עד תאריך"
          />
          <button type="button" className="button-primary responses-dateButton">
            חפש
          </button>
        </div>
      </div>

      {selectedTemplate ? (
        <section className="responses-detail" aria-label={`תגובות עבור ${selectedTemplate.name}`}>
          <div className="responses-detailHeader">
            <button
              type="button"
              className="button-secondary responses-backButton"
              onClick={() => {
                setSelectedTemplate(null);
                setTemplateResponses([]);
              }}
            >
              חזרה לתבניות
            </button>
            <h2 className="responses-detailTitle">תגובות עבור {selectedTemplate.name}</h2>
          </div>
          {responsesLoading ? (
            <Loading />
          ) : templateResponses.length > 0 ? (
            <div className="responses-rawList" dir="ltr">
              {templateResponses.map((response, index) => (
                <React.Fragment key={response.id}>
                  <div className="responses-rawRow">{JSON.stringify(response)}</div>
                  {index < templateResponses.length - 1 && <hr className="responses-divider" />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="responses-emptyState">אין תגובות עבור השאלון הזה.</div>
          )}
        </section>
      ) : (
        <div className="responses-grid">
          {responseSummaries.map((summary) => (
            <article
              key={summary.id}
              className="responses-gridItem"
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedTemplate({ id: summary.id, name: summary.name });
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedTemplate({ id: summary.id, name: summary.name });
                }
              }}
            >
              <h3 className="responses-gridTitle">{summary.name}</h3>
              <span className="responses-gridTotal" aria-label="סהכ תגובות">
                {summary.totalResponses}
              </span>
              <div className="responses-gridFooter" role="group" aria-label="סטטוס תגובות">
                <div className="responses-gridFooterItem">
                  <ProgressIcon className="responses-gridFooterIcon" aria-hidden="true" />
                  <span className="responses-gridFooterValue" aria-label="לא הושלמו">
                    {summary.inProgressResponses}
                  </span>
                  <span className="responses-gridFooterLabel">לא הושלמו</span>
                </div>
                <div className="responses-gridFooterItem">
                  <GreenCheckIcon className="responses-gridFooterIcon" aria-hidden="true" />
                  <span className="responses-gridFooterValue" aria-label="הושלמו">
                    {summary.completedResponses}
                  </span>
                  <span className="responses-gridFooterLabel">הושלמו</span>
                </div>
              </div>
            </article>
          ))}
          {responseSummaries.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', color: '#9aa0a6' }}>
              אין תגובות להצגה.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Responses;
