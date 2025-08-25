import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuestionnaire, updateQuestionnaireAnswers } from '../../api/questionnaire';
import QuestionnaireView, { type PreviewQuestion } from '../questionnaires/QuestionnaireView';
import InfoPopup from './InfoPopup';
import '../Button.css';

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

interface QuestionnaireApiResponse {
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  template?: TemplateData | null;
}

type AnswerValue = PreviewQuestion['answer'];

const MULTI_ANSWER_PREFIX = 'MULTI:';

const isMultipleChoice = (qType: PreviewQuestion['qType']): boolean => {
  if (typeof qType !== 'string') return false;
  const normalized = qType.trim().toLowerCase();
  return normalized === 'multiple' || normalized === 'multiple choice';
};

const mapQuestions = (
  questions: TemplateTopic['questions'] | TemplateSubCategory['questions'] | TemplateCategory['questions'],
  mapper: (question: PreviewQuestion) => AnswerValue,
): typeof questions => {
  if (!Array.isArray(questions)) return questions;
  return questions.map((question) => {
    if (!question) return question;
    return { ...question, answer: mapper(question) };
  });
};

const transformTemplateAnswers = (
  template: TemplateData | null,
  transformer: (question: PreviewQuestion) => AnswerValue,
): TemplateData | null => {
  if (!template) return template;
  return {
    ...template,
    categories: Array.isArray(template.categories)
      ? template.categories.map((cat) => {
          if (!cat) return cat;
          return {
            ...cat,
            questions: mapQuestions(cat.questions, transformer),
            subCategories: Array.isArray(cat.subCategories)
              ? cat.subCategories.map((sub) => {
                  if (!sub) return sub;
                  return {
                    ...sub,
                    questions: mapQuestions(sub.questions, transformer),
                    topics: Array.isArray(sub.topics)
                      ? sub.topics.map((topic) => {
                          if (!topic) return topic;
                          return {
                            ...topic,
                            questions: mapQuestions(topic.questions, transformer),
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

const encodeAnswerValue = (question: PreviewQuestion): AnswerValue => {
  if (!isMultipleChoice(question.qType)) return question.answer;
  if (Array.isArray(question.answer)) {
    return `${MULTI_ANSWER_PREFIX}${JSON.stringify(question.answer)}`;
  }
  return question.answer;
};

const decodeAnswerValue = (question: PreviewQuestion): AnswerValue => {
  if (!isMultipleChoice(question.qType)) return question.answer;
  if (Array.isArray(question.answer)) {
    return question.answer.map((item) => String(item));
  }
  if (typeof question.answer !== 'string') return question.answer;
  if (!question.answer.startsWith(MULTI_ANSWER_PREFIX)) return question.answer;
  const payload = question.answer.slice(MULTI_ANSWER_PREFIX.length);
  try {
    const parsed = JSON.parse(payload);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
  } catch {
    // Ignore parse failures; fall through to return raw string
  }
  return question.answer;
};

const encodeTemplateAnswers = (template: TemplateData | null) => transformTemplateAnswers(template, encodeAnswerValue);
const decodeTemplateAnswers = (template: TemplateData | null) => transformTemplateAnswers(template, decodeAnswerValue);

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

const hasAnswer = (answer: AnswerValue): boolean => {
  if (answer === null || answer === undefined) {
    return false;
  }
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }
  if (typeof answer === 'string') {
    return answer.trim().length > 0;
  }
  if (typeof answer === 'number') {
    return !Number.isNaN(answer);
  }
  if (typeof answer === 'boolean') {
    return true;
  }
  if (typeof answer === 'object') {
    return Object.keys(answer).length > 0;
  }
  return false;
};

const safeStringOrNull = (value?: string | null): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const buildInfo = (name: string | null, email: string | null, phone: string | null) => {
  if (!name && !email && !phone) return null;
  return { name, email, phone } as { name?: string | null; email?: string | null; phone?: string | null };
};

const AnswerFill: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [info, setInfo] = useState<{ name?: string | null; email?: string | null; phone?: string | null } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'submitting'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<
    { status: 'success' | 'error'; email: string | null }
  >(
    null,
  );

  // Fetch server-side user info (userName, userEmail, userPhone)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getQuestionnaire(id);
        const q = (res?.data ?? {}) as QuestionnaireApiResponse;
        const serverName = q.userName ?? null;
        const serverEmail = q.userEmail ?? null;
        const serverPhone = q.userPhone ?? null;
        const tpl = q.template || null;
        if (cancelled) return;
        setInfo(
          buildInfo(
            safeStringOrNull(typeof serverName === 'string' ? serverName : null),
            safeStringOrNull(typeof serverEmail === 'string' ? serverEmail : null),
            safeStringOrNull(typeof serverPhone === 'string' ? serverPhone : null),
          ),
        );
        setTemplate(decodeTemplateAnswers(tpl));
      } catch {
        // Ignore fetch errors for this informational panel
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const allQuestions = useMemo(() => collectQuestions(template), [template]);
  const allQuestionsAnswered = useMemo(() => allQuestions.every((q) => hasAnswer(q?.answer)), [allQuestions]);
  const isBusy = savingState !== 'idle';
  const displayName = info?.name?.trim() ?? '';
  const displayEmail = info?.email?.trim() ?? '';
  const displayPhone = info?.phone?.trim() ?? '';
  const canSave = Boolean(template) && Boolean(displayEmail) && !isBusy;

  const updateCategoryAnswer = (categoryIndex: number, questionIndex: number, value: AnswerValue) => {
    setTemplate((prev) => {
      if (!prev?.categories) return prev;
      const categories = prev.categories.map((cat, ci) => {
        if (ci !== categoryIndex || !cat) return cat;
        if (!Array.isArray(cat.questions)) return cat;
        const questions = cat.questions.map((question, qi) =>
          qi === questionIndex && question ? { ...question, answer: value } : question,
        );
        return { ...cat, questions };
      });
      return { ...prev, categories };
    });
  };

  const updateSubCategoryAnswer = (
    categoryIndex: number,
    subCategoryIndex: number,
    questionIndex: number,
    value: AnswerValue,
  ) => {
    setTemplate((prev) => {
      if (!prev?.categories) return prev;
      const categories = prev.categories.map((cat, ci) => {
        if (ci !== categoryIndex || !cat) return cat;
        const subCategories = (cat.subCategories || []).map((sub, si) => {
          if (si !== subCategoryIndex || !sub) return sub;
          if (!Array.isArray(sub.questions)) return sub;
          const questions = sub.questions.map((question, qi) =>
            qi === questionIndex && question ? { ...question, answer: value } : question,
          );
          return { ...sub, questions };
        });
        return { ...cat, subCategories };
      });
      return { ...prev, categories };
    });
  };

  const updateTopicAnswer = (
    categoryIndex: number,
    subCategoryIndex: number,
    topicIndex: number,
    questionIndex: number,
    value: AnswerValue,
  ) => {
    setTemplate((prev) => {
      if (!prev?.categories) return prev;
      const categories = prev.categories.map((cat, ci) => {
        if (ci !== categoryIndex || !cat) return cat;
        const subCategories = (cat.subCategories || []).map((sub, si) => {
          if (si !== subCategoryIndex || !sub) return sub;
          const topics = (sub.topics || []).map((topic, ti) => {
            if (ti !== topicIndex || !topic) return topic;
            if (!Array.isArray(topic.questions)) return topic;
            const questions = topic.questions.map((question, qi) =>
              qi === questionIndex && question ? { ...question, answer: value } : question,
            );
            return { ...topic, questions };
          });
          return { ...sub, topics };
        });
        return { ...cat, subCategories };
      });
      return { ...prev, categories };
    });
  };

  const persistAnswers = async (markComplete: boolean) => {
    if (!id || !template) return;
    setSavingState(markComplete ? 'submitting' : 'saving');
    setStatusMessage(null);
    setErrorMessage(null);
    setSaveFeedback(null);
    try {
      const res = await updateQuestionnaireAnswers(id, {
        ansTemplate: encodeTemplateAnswers(template),
        uName: safeStringOrNull(info?.name ?? null),
        uEmail: safeStringOrNull(info?.email ?? null),
        uPhone: safeStringOrNull(info?.phone ?? null),
        isComplete: markComplete,
      });
      const updated = (res?.data ?? null) as QuestionnaireApiResponse | null;
      if (updated?.template) {
        setTemplate(decodeTemplateAnswers(updated.template));
      }
      if (updated) {
        const nextName = typeof updated.userName === 'string' ? safeStringOrNull(updated.userName) : safeStringOrNull(info?.name ?? null);
        const nextEmail = typeof updated.userEmail === 'string' ? safeStringOrNull(updated.userEmail) : safeStringOrNull(info?.email ?? null);
        const nextPhone = typeof updated.userPhone === 'string' ? safeStringOrNull(updated.userPhone) : safeStringOrNull(info?.phone ?? null);
        setInfo(buildInfo(nextName, nextEmail, nextPhone));
      }
      if (markComplete) {
        setStatusMessage('השאלון נשלח בהצלחה.');
      } else {
        setSaveFeedback({ status: 'success', email: safeStringOrNull(info?.email ?? null) });
      }
    } catch (error) {
      console.error('Failed to persist questionnaire answers', error);
      if (markComplete) {
        setErrorMessage('שליחת השאלון נכשלה. נסו שוב.');
      } else {
        setSaveFeedback({ status: 'error', email: safeStringOrNull(info?.email ?? null) });
      }
    } finally {
      setSavingState('idle');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>דף מענה לשאלון</h2>
      <p>כאן יוצגו השאלות למענה בהמשך.</p>
      {Boolean(displayName || displayEmail || displayPhone) && (
        <div style={{ marginTop: 16, padding: '12px 16px', border: '1px solid #EDEDEF', borderRadius: 6, background: '#F6F6F9' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>פרטי משתמש:</div>
          <ul style={{ margin: 0, paddingInlineStart: 18 }}>
            {displayName && <li>שם: {displayName}</li>}
            {displayEmail && <li>דוא"ל: {displayEmail}</li>}
            {displayPhone && <li>טלפון: {displayPhone}</li>}
          </ul>
        </div>
      )}

      {/* Questionnaire rendering below user info */}
      <div style={{ marginTop: 24, direction: 'rtl' }}>
        {loading ? (
          <div style={{ color: '#666' }}>טוען…</div>
        ) : template && Array.isArray(template.categories) && template.categories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {template.categories.map((cat, ci) => (
              <div key={`cat-${ci}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cat?.name && (
                  <div style={{ fontWeight: 700, fontSize: 20, textAlign: 'right' }}>{String(cat.name)}</div>
                )}
                <QuestionnaireView
                  questions={cat?.questions ?? []}
                  mode="answer"
                  onAnswerChange={(questionIndex, value) => updateCategoryAnswer(ci, questionIndex, value)}
                />

                {Array.isArray(cat?.subCategories) && cat.subCategories.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {cat.subCategories.map((sc, si) => (
                      <div key={`sub-${ci}-${si}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {sc?.name && (
                          <div style={{ fontWeight: 600, fontSize: 18, textAlign: 'right' }}>{String(sc.name)}</div>
                        )}
                        <QuestionnaireView
                          questions={sc?.questions ?? []}
                          mode="answer"
                          onAnswerChange={(questionIndex, value) =>
                            updateSubCategoryAnswer(ci, si, questionIndex, value)
                          }
                        />

                        {Array.isArray(sc?.topics) && sc.topics.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {sc.topics.map((tp, ti) => (
                              <div key={`top-${ci}-${si}-${ti}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {tp?.name && (
                                  <div style={{ fontWeight: 500, fontSize: 16, textAlign: 'right' }}>{String(tp.name)}</div>
                                )}
                                <QuestionnaireView
                                  questions={tp?.questions ?? []}
                                  mode="answer"
                                  onAnswerChange={(questionIndex, value) =>
                                    updateTopicAnswer(ci, si, ti, questionIndex, value)
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#666', marginTop: 12, textAlign: 'center' }}>אין שאלות להצגה</div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
          marginTop: 32,
        }}
      >
        <button
          type="button"
          className="button-secondary"
          onClick={() => persistAnswers(false)}
          disabled={!canSave}
        >
          שמירה
        </button>
        <button
          type="button"
          className="button-primary"
          onClick={() => persistAnswers(true)}
          disabled={isBusy || !template || !allQuestionsAnswered}
        >
          שליחה
        </button>
      </div>
      {(statusMessage || errorMessage) && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          {statusMessage && <div style={{ color: '#2e7d32' }}>{statusMessage}</div>}
          {errorMessage && <div style={{ color: '#b00020' }}>{errorMessage}</div>}
        </div>
      )}
      {saveFeedback && (
        <InfoPopup
          title={saveFeedback.status === 'success' ? 'שמירה הושלמה' : 'שמירת השאלון נכשלה'}
          message={
            saveFeedback.status === 'success' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span>השאלון נשמר בהצלחה.</span>
                <span>
                  שלחנו לינק חזרה לכתובת{' '}
                  <strong>{saveFeedback.email ?? displayEmail}</strong>.
                  {' '}אם המייל לא מגיע בתוך מספר דקות, מומלץ לבדוק גם את תיקיית הספאם.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span>שמירת השאלון נכשלה ולא נשלח לינק.</span>
                <span>
                  אנא ודאו שהכתובת{' '}
                  <strong>{saveFeedback.email ?? (displayEmail || 'שציינתם')}</strong>
                  {' '}תקינה ונסו שוב בעוד מספר רגעים.
                </span>
              </div>
            )
          }
          onClose={() => setSaveFeedback(null)}
          acknowledgeLabel="סגור"
        />
      )}
    </div>
  );
};

export default AnswerFill;
