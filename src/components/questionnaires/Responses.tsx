import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import SearchIcon from '../../assets/icons/SearchIcon';
import GreenCheckIcon from '../../assets/icons/GreenCheckIcon';
import ProgressIcon from '../../assets/icons/ProgressIcon';
import LineSeparatorIcon from '../../assets/icons/LineSeparatorIcon';
import CustomSelect from '../CustomSelect';
import type { CustomSelectOption } from '../CustomSelect';
import QuestionnaireView, { type PreviewQuestion, type QuestionAnswer } from './QuestionnaireView';
import './Responses.css';
import '../CreateTemplate.css';
import Loading from '../Loading';
import {
  getSingleTemplateSummary,
  getTemplatesSummary,
  type QuestionnaireResponse,
  type TemplateSummary,
} from '../../api/template';
import DatePicker from '../DatePicker';

interface ResponseSummary {
  id: string;
  name: string;
  totalResponses: number;
  completedResponses: number;
  inProgressResponses: number;
  firstResponseAt: string | null;
  lastResponseAt: string | null;
}

interface TemplateTopic {
  name?: string | null;
  questions?: PreviewQuestion[];
}

interface TemplateSubCategory {
  name?: string | null;
  questions?: PreviewQuestion[];
  topics?: TemplateTopic[];
}

interface TemplateCategory {
  name?: string | null;
  questions?: PreviewQuestion[];
  subCategories?: TemplateSubCategory[];
}

interface TemplateData {
  name?: string | null;
  categories?: TemplateCategory[];
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const BASE_RESPONSES_DATE = new Date('2024-09-01T08:00:00.000Z');
const MULTI_ANSWER_PREFIX = 'MULTI:';

const getMockDateRange = (dayOffset: number) => {
  const start = new Date(BASE_RESPONSES_DATE.getTime() + dayOffset * DAY_IN_MS);
  const end = new Date(start.getTime() + 4 * DAY_IN_MS + 20 * 60 * 1000);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

const Responses: React.FC = () => {
  const [responseSummaries, setResponseSummaries] = useState<ResponseSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string } | null>(null);
  const [templateResponses, setTemplateResponses] = useState<QuestionnaireResponse[]>([]);
  const [responsesLoading, setResponsesLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [responsesError, setResponsesError] = useState<string | null>(null);
  const [activeResponse, setActiveResponse] = useState<QuestionnaireResponse | null>(null);

  const formatResponseDate = (value?: string | null) => {
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
  const [appliedDateRange, setAppliedDateRange] = useState<{ start: string; end: string } | null>(null);
  const [dateFilterError, setDateFilterError] = useState<string | null>(null);

  const selectedCounts = useMemo(() => {
    let completed = 0;
    let inProgress = 0;

    templateResponses.forEach((response) => {
      if (response.isComplete) {
        completed += 1;
      } else {
        inProgress += 1;
      }
    });

    return {
      total: templateResponses.length,
      completed,
      inProgress,
    };
  }, [templateResponses]);

  const filteredResponses = useMemo(() => {
    let responses = templateResponses;

    if (statusFilter === 'completed') {
      responses = responses.filter((response) => response.isComplete);
    } else if (statusFilter === 'incomplete') {
      responses = responses.filter((response) => !response.isComplete);
    }

    if (appliedDateRange) {
      const startDate = new Date(appliedDateRange.start);
      const endDate = new Date(appliedDateRange.end);
      if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
        const startTime = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          0,
          0,
          0,
          0,
        ).getTime();
        const endTime = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
          23,
          59,
          59,
          999,
        ).getTime();
        responses = responses.filter((response) => {
          const rawDate = response.updatedAt ?? response.createdAt;
          if (!rawDate) {
            return false;
          }
          const normalized = new Date(rawDate);
          if (Number.isNaN(normalized.getTime())) {
            return false;
          }
          const time = normalized.getTime();
          return time >= startTime && time <= endTime;
        });
      }
    }

    return responses;
  }, [appliedDateRange, statusFilter, templateResponses]);

  const handleDateSearch = () => {
    if (!fromDate && !toDate) {
      setAppliedDateRange(null);
      setDateFilterError(null);
      return;
    }
    if (!fromDate || !toDate) {
      setDateFilterError('יש לבחור שני תאריכים');
      return;
    }
    const firstDate = new Date(fromDate);
    const secondDate = new Date(toDate);
    if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) {
      setDateFilterError('יש לבחור שני תאריכים');
      return;
    }
    if (firstDate <= secondDate) {
      setAppliedDateRange({ start: fromDate, end: toDate });
    } else {
      setAppliedDateRange({ start: toDate, end: fromDate });
    }
    setDateFilterError(null);
  };

  const visibleSummaries = useMemo(() => {
    if (!appliedDateRange) {
      return responseSummaries;
    }
    const startDate = new Date(appliedDateRange.start);
    const endDate = new Date(appliedDateRange.end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return responseSummaries;
    }
    const startTime = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      0,
      0,
      0,
      0,
    ).getTime();
    const endTime = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      23,
      59,
      59,
      999,
    ).getTime();
    return responseSummaries.filter((summary) => {
      if (!summary.firstResponseAt || !summary.lastResponseAt) {
        return false;
      }
      const summaryStart = new Date(summary.firstResponseAt).getTime();
      const summaryEnd = new Date(summary.lastResponseAt).getTime();
      if (Number.isNaN(summaryStart) || Number.isNaN(summaryEnd)) {
        return false;
      }
      return summaryEnd >= startTime && summaryStart <= endTime;
    });
  }, [appliedDateRange, responseSummaries]);

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
        const normalized = data.map((summary: TemplateSummary, index): ResponseSummary => {
          const dayOffset = index * 3;
          const dateRange = summary.responses > 0 ? getMockDateRange(dayOffset) : null;
          return {
            id: summary.id,
            name: summary.name,
            totalResponses: summary.responses,
            completedResponses: summary.complete,
            inProgressResponses: summary.incomplete,
            firstResponseAt: dateRange?.start ?? null,
            lastResponseAt: dateRange?.end ?? null,
          };
        });
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

    let isMounted = true;

    const fetchTemplateResponses = async () => {
      setResponsesLoading(true);
      setResponsesError(null);
      try {
        const { data } = await getSingleTemplateSummary(selectedTemplate.id);
        if (!isMounted) {
          return;
        }
        setTemplateResponses(data.responses ?? []);
        setStatusFilter('all');
        setFromDate('');
        setToDate('');
        setAppliedDateRange(null);
        setDateFilterError(null);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || 'שגיאה בטעינת התגובות. נסו שוב מאוחר יותר.'
          : 'שגיאה בטעינת התגובות. נסו שוב מאוחר יותר.';
        setResponsesError(message);
        setTemplateResponses([]);
      } finally {
        if (isMounted) {
          setResponsesLoading(false);
        }
      }
    };

    fetchTemplateResponses();

    return () => {
      isMounted = false;
    };
  }, [selectedTemplate]);

  const decodeAnswerValue = (question: PreviewQuestion): QuestionAnswer => {
    if (typeof question?.qType !== 'string') {
      return question.answer;
    }
    const normalized = question.qType.trim().toLowerCase();
    const isMultiple = normalized === 'multiple' || normalized === 'multiple choice';
    if (!isMultiple) {
      return question.answer;
    }
    if (Array.isArray(question.answer)) {
      return question.answer.map((value) => String(value));
    }
    if (typeof question.answer !== 'string') {
      return question.answer;
    }
    if (!question.answer.startsWith(MULTI_ANSWER_PREFIX)) {
      return question.answer;
    }
    const payload = question.answer.slice(MULTI_ANSWER_PREFIX.length);
    try {
      const parsed = JSON.parse(payload);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item));
      }
    } catch {
      // Ignore parse failures and fall through
    }
    return question.answer;
  };

  const mapQuestions = (
    questions: TemplateTopic['questions'] | TemplateSubCategory['questions'] | TemplateCategory['questions'],
  ) => {
    if (!Array.isArray(questions)) return questions;
    return questions.map((question) => {
      if (!question) return question;
      return { ...question, answer: decodeAnswerValue(question) };
    });
  };

  const decodeTemplateAnswers = (template: TemplateData | null | undefined): TemplateData | null => {
    if (!template) return null;
    return {
      ...template,
      categories: Array.isArray(template.categories)
        ? template.categories.map((cat) => {
            if (!cat) return cat;
            return {
              ...cat,
              questions: mapQuestions(cat.questions),
              subCategories: Array.isArray(cat.subCategories)
                ? cat.subCategories.map((sub) => {
                    if (!sub) return sub;
                    return {
                      ...sub,
                      questions: mapQuestions(sub.questions),
                      topics: Array.isArray(sub.topics)
                        ? sub.topics.map((topic) => {
                            if (!topic) return topic;
                            return {
                              ...topic,
                              questions: mapQuestions(topic.questions),
                            };
                          })
                        : sub.topics,
                    };
                  })
                : cat.subCategories,
            };
          })
        : template.categories,
    };
  };

  const collectQuestions = (tpl: TemplateData | null): PreviewQuestion[] => {
    if (!tpl?.categories) return [];
    const acc: PreviewQuestion[] = [];
    tpl.categories.forEach((cat) => {
      if (!cat) return;
      if (Array.isArray(cat.questions)) {
        cat.questions.forEach((question) => {
          if (question) acc.push(question);
        });
      }
      (cat.subCategories || []).forEach((sub) => {
        if (!sub) return;
        if (Array.isArray(sub.questions)) {
          sub.questions.forEach((question) => {
            if (question) acc.push(question);
          });
        }
        (sub.topics || []).forEach((topic) => {
          if (!topic) return;
          if (Array.isArray(topic.questions)) {
            topic.questions.forEach((question) => {
              if (question) acc.push(question);
            });
          }
        });
      });
    });
    return acc;
  };

  const activeTemplate = useMemo(
    () => decodeTemplateAnswers((activeResponse?.template as TemplateData | null) ?? null),
    [activeResponse],
  );
  const activeQuestions = useMemo(() => collectQuestions(activeTemplate), [activeTemplate]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '24px' }}>{error}</div>;
  }

  return (
    <div>
      {selectedTemplate ? (
        <div className="responses-selectedHeader">
          <h2 className="responses-selectedTitle">{selectedTemplate.name}</h2>
          <div className="responses-selectedStats" role="group" aria-label="סטטוס תגובות">
            <span className="responses-selectedStat responses-selectedStat--total">
              תגובות <strong>{selectedCounts.total}</strong>
            </span>
            <span className="responses-selectedStat">
              <strong>{selectedCounts.completed}</strong> הושלמו
            </span>
            <span className="responses-selectedStat">
              <strong>{selectedCounts.inProgress}</strong> לא הושלמו
            </span>
          </div>
        </div>
      ) : (
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
      )}

      <div className="responses-controlsRow">
        <button
          type="button"
          className={`button-primary responses-button responses-button--completed${
            statusFilter === 'completed' ? ' responses-button--active' : ''
          }`}
          aria-pressed={statusFilter === 'completed'}
          onClick={() => {
            setStatusFilter((current) => (current === 'completed' ? 'all' : 'completed'));
          }}
        >
          <span>הושלם</span>
          <GreenCheckIcon className="responses-buttonIcon" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`button-secondary responses-button responses-button--progress${
            statusFilter === 'incomplete' ? ' responses-button--active' : ''
          }`}
          aria-pressed={statusFilter === 'incomplete'}
          onClick={() => {
            setStatusFilter((current) => (current === 'incomplete' ? 'all' : 'incomplete'));
          }}
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
          <button type="button" className="button-primary responses-dateButton" onClick={handleDateSearch}>
            חפש
          </button>
        </div>
      </div>
      {dateFilterError && (
        <div className="responses-dateError" role="alert">
          {dateFilterError}
        </div>
      )}

      {selectedTemplate ? (
        <section className="responses-detail" aria-label={`תגובות עבור ${selectedTemplate.name}`}>
          {responsesLoading ? (
            <Loading />
          ) : responsesError ? (
            <div className="responses-emptyState" role="alert">
              {responsesError}
            </div>
          ) : templateResponses.length > 0 ? (
            filteredResponses.length > 0 ? (
              <div className="responses-rawList" dir="rtl">
                {filteredResponses.map((response, index) => {
                  const statusText = response.isComplete ? 'הושלם' : 'בתהליך';
                  const respondentName = response.userName || '—';
                  const dateValue = formatResponseDate(response.updatedAt ?? response.createdAt);

                  return (
                    <div
                      className="responses-rawRow"
                      role="button"
                      tabIndex={0}
                      aria-label={`הצג תשובות עבור ${respondentName === '—' ? 'תגובה' : respondentName}`}
                      key={response.id}
                      onClick={() => {
                        setActiveResponse(response);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setActiveResponse(response);
                        }
                      }}
                    >
                      <span
                        className="responses-rawCell responses-rawCell--status"
                        aria-label={`סטטוס תגובה ${index + 1}: ${statusText}`}
                      >
                        {response.isComplete ? (
                          <GreenCheckIcon className="responses-rawStatusIcon" aria-hidden="true" />
                        ) : (
                          <ProgressIcon className="responses-rawStatusIcon" aria-hidden="true" />
                        )}
                      </span>
                      <span
                        className={
                          respondentName === '—'
                            ? 'responses-rawCell responses-rawCell--placeholder'
                            : 'responses-rawCell'
                        }
                        aria-label="שם המשיב"
                      >
                        {respondentName}
                      </span>
                      <span
                        className={
                          dateValue === '—'
                            ? 'responses-rawCell responses-rawCell--date responses-rawCell--placeholder'
                            : 'responses-rawCell responses-rawCell--date'
                        }
                        aria-label="תאריך עדכון"
                      >
                        {dateValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="responses-emptyState">אין תגובות התואמות למסננים שנבחרו.</div>
            )
          ) : (
            <div className="responses-emptyState">אין תגובות עבור השאלון הזה.</div>
          )}
        </section>
      ) : (
        <div className="responses-grid">
          {visibleSummaries.map((summary) => (
            <article
              key={summary.id}
              className="responses-gridItem"
              role="button"
              tabIndex={0}
              onClick={() => {
                setActiveResponse(null);
                setSelectedTemplate({ id: summary.id, name: summary.name });
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveResponse(null);
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
          {visibleSummaries.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', color: '#9aa0a6' }}>
              אין תגובות להצגה.
            </div>
          )}
        </div>
      )}
      {activeResponse && (
        <div
          className="responses-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="תשובות לשאלון"
          onClick={() => {
            setActiveResponse(null);
          }}
        >
          <div
            className="popup-content popup-content--square responses-popup"
            role="document"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="popup-close-button"
              aria-label="סגור תצוגת תשובות"
              onClick={() => setActiveResponse(null)}
            >
              ×
            </button>
            <header className="responses-popupHeader">
              <div className="responses-popupTitleGroup">
                <p className="responses-popupLabel">תבנית</p>
                <h2 className="responses-popupTitle">
                  {selectedTemplate?.name || activeResponse.template?.name || 'שאלון'}
                </h2>
              </div>
              <div className="responses-popupMeta">
                <span className="responses-popupLabel">משיב</span>
                <span className="responses-popupValue">
                  {activeResponse.userName || activeResponse.userEmail || '—'}
                </span>
              </div>
              <div className="responses-popupMeta">
                <span className="responses-popupLabel">סטטוס</span>
                <span className={`responses-popupChip${activeResponse.isComplete ? ' is-complete' : ''}`}>
                  {activeResponse.isComplete ? 'הושלם' : 'בתהליך'}
                </span>
              </div>
            </header>
            <div className="responses-popupBody" dir="rtl">
              <QuestionnaireView questions={activeQuestions} mode="read" />
            </div>
            <div className="responses-popupActions">
              <button type="button" className="button-secondary" onClick={() => setActiveResponse(null)}>
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Responses;
