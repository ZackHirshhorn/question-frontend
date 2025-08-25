import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import SearchIcon from '../../assets/icons/SearchIcon';
import GreenCheckIcon from '../../assets/icons/GreenCheckIcon';
import ProgressIcon from '../../assets/icons/ProgressIcon';
import LineSeparatorIcon from '../../assets/icons/LineSeparatorIcon';
import CustomSelect from '../CustomSelect';
import type { CustomSelectOption } from '../CustomSelect';
import './Responses.css';
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

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const BASE_RESPONSES_DATE = new Date('2024-09-01T08:00:00.000Z');

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
                  const responseTitle = '<שם התגובה>';
                  const respondentName = response.userName || '—';
                  const schoolName = response.schoolName || '<שם בית הספר>';
                  const dateValue = formatResponseDate(response.updatedAt ?? response.createdAt);

                  return (
                    <div className="responses-rawRow" key={response.id}>
                      <span
                        className={
                          responseTitle.startsWith('<')
                            ? 'responses-rawCell responses-rawCell--title responses-rawCell--placeholder'
                            : 'responses-rawCell responses-rawCell--title'
                        }
                      >
                        {responseTitle}
                      </span>
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
                          schoolName.startsWith('<')
                            ? 'responses-rawCell responses-rawCell--placeholder'
                            : 'responses-rawCell'
                        }
                        aria-label="שם מוסד"
                      >
                        {schoolName}
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
          {visibleSummaries.length === 0 && (
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
