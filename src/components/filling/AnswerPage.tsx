import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StartDecisionPopup from './StartDecisionPopup';
import NoEmailWarningPopup from './NoEmailWarningPopup';
import { useSelector } from 'react-redux';
import { createQuestionnaire, updateQuestionnaireAnswers, updateQuestionnaireAnswersAuth } from '../../api/questionnaire';
import '../Button.css';
import TextInput from '../TextInput';
import AnimatedErrorMessage from '../AnimatedErrorMessage';
import type { RootState } from '../../store';
import { sendQuestionnaireCreatedEmail } from '../../services/emailNotifications';

const extractTemplateName = (template: unknown): string => {
  if (template && typeof template === 'object' && 'name' in template) {
    const name = (template as { name?: unknown }).name;
    if (typeof name === 'string' && name.trim()) {
      return name;
    }
  }
  return 'תבנית ללא שם';
};

const AnswerPage: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const START_INFO_KEY = templateId ? `start_info:${templateId}` : 'start_info';
  const [creating, setCreating] = useState(false);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [showPopup, setShowPopup] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showNoEmailWarning, setShowNoEmailWarning] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<{ name?: string; email?: string; phone?: string } | null>(null);

  const createAndRedirect = async (payload: { name?: string; email?: string; phone?: string }) => {
    if (!templateId) return;
    setCreating(true);
    setShowPopup(false);
    setShowEmailForm(false);
    setCreationError(null);
    try {
      const res = await createQuestionnaire({ templateId });
      const qid: string | undefined = (res?.data && (res.data._id || res.data.id)) as string | undefined;
      const createdTemplate = (res?.data && (res.data.template as unknown)) || undefined;
      if (qid) {
        // Always persist/link user info right after creation
        if (isAuthenticated) {
          try {
            await updateQuestionnaireAnswersAuth(qid, {
              // Preserve the freshly created template to satisfy schema
              ansTemplate: createdTemplate,
              uPhone: payload.phone || null,
            });
          } catch (err) {
            console.error('Auth update failed after creation', err);
            setCreationError('קישור השאלון לחשבון נכשל. נא לנסות שוב.');
            setCreating(false);
            return; // Stop flow if linking failed for authenticated user
          }
        } else {
          try {
            await updateQuestionnaireAnswers(qid, {
              uName: payload.name || null,
              uEmail: payload.email || null,
              uPhone: payload.phone || null,
              // Preserve the freshly created template to satisfy schema
              ansTemplate: createdTemplate as unknown,
            });
          } catch (err) {
            // Non-fatal for initial info capture
            console.error('Guest update failed after creation', err);
          }
        }
        // Clear only the previous-page draft key; do not persist questionnaire info
        try {
          window.localStorage.removeItem(START_INFO_KEY);
        } catch {
          // Ignore storage errors; proceed to redirect
        }
        const emailToNotify = (payload.email || (isAuthenticated ? user?.email : undefined))?.trim();
        if (emailToNotify) {
          const questionnaireUrl = `${window.location.origin}/answer/${qid}`;
          const templateName = extractTemplateName(createdTemplate);
          const respondentName = (payload.name || (isAuthenticated ? user?.name : undefined))?.trim();
          await sendQuestionnaireCreatedEmail({
            toEmail: emailToNotify,
            questionnaireUrl,
            templateName,
            respondentName,
          });
        }
        // Redirect to the answer route
        window.location.replace(`/answer/${qid}`);
      }
    } catch (e: unknown) {
      console.error('Failed to prepare questionnaire', e);
      const err = e as { response?: { data?: { message?: unknown } } | undefined; message?: string };
      const rawMsg = err.response?.data?.message ?? err.response?.data ?? err.message ?? '';
      const msg = String(rawMsg);
      setCreationError(msg || 'אירעה שגיאה בהכנת השאלון. נסו שוב.');
      setCreating(false);
    }
  };

  useEffect(() => {
    // Show the decision popup only for unauthenticated users.
    setShowPopup(!isAuthenticated);
    // For authenticated users, show the form immediately (phone only).
    setShowEmailForm(isAuthenticated);
  }, [isAuthenticated]);

  // Hydrate form from localStorage when user sees the form
  useEffect(() => {
    if (!showEmailForm) return;
    try {
      const raw = window.localStorage.getItem(START_INFO_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { name?: string; email?: string; phone?: string };
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
      }
    } catch {
      // Ignore malformed or missing draft
    }
  }, [showEmailForm, START_INFO_KEY]);

  // Persist draft info while typing
  useEffect(() => {
    if (!showEmailForm) return;
    try {
      window.localStorage.setItem(START_INFO_KEY, JSON.stringify({ name, email, phone }));
    } catch {
      // Ignore storage failures during draft typing
    }
  }, [name, email, phone, showEmailForm, START_INFO_KEY]);

  return (
    <>
      {showPopup && (
        <StartDecisionPopup
          templateId={templateId}
          onLogin={() => {
            const target = `/start/${templateId ?? ''}`;
            navigate(`/login?redirect=${encodeURIComponent(target)}`);
          }}
          onContinueWithoutLogin={() => {
            setShowPopup(false);
            setShowEmailForm(true);
          }}
        />
      )}
      {showEmailForm && (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8, textAlign: 'right' }}>פרטים</h2>
          <p style={{ marginTop: 0, marginBottom: 16, color: '#555', textAlign: 'right' }}>
            {isAuthenticated
              ? 'ניתן להזין מספר טלפון לצורך יצירת קשר.'
              : 'ניתן להזין שם, כתובת דוא"ל וטלפון להמשך.'}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const n = name.trim();
              const em = email.trim();
              const ph = phone.trim();
              let hasError = false;

              // Optional name: only validate if provided (guests only)
              setNameError('');

              // Optional email: validate format when provided
              if (!isAuthenticated && em) {
                const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
                if (!emailValid) {
                  setEmailError('יש להזין כתובת דוא"ל תקינה.');
                  hasError = true;
                } else {
                  setEmailError('');
                }
              } else {
                // No email provided – trigger warning popup after basic checks
                setEmailError('');
              }

              // Optional phone: validate digits length when provided
              if (ph) {
                const phoneValid = /^\d{9,10}$/.test(ph);
                if (!phoneValid) {
                  setPhoneError('מספר טלפון חייב להכיל 9–10 ספרות.');
                  hasError = true;
                } else {
                  setPhoneError('');
                }
              } else {
                setPhoneError('');
              }

              if (hasError) return;

              if (!isAuthenticated && !em) {
                // Show warning that without email, resume later isn’t possible
                setShowNoEmailWarning(true);
                setLastPayload({ name: n || undefined, phone: ph || undefined });
                return;
              }

              // Proceed to create questionnaire and redirect
              const payload = { name: n || undefined, email: em || undefined, phone: ph || undefined };
              setLastPayload(payload);
              createAndRedirect(payload);
            }}
          >
            {!isAuthenticated && (
              <>
                <div className="form-group">
                  <label htmlFor="guest-name" className="popup-label">שם (לא חובה)</label>
                  <TextInput
                    id="guest-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError('');
                    }}
                    placeholder="ישראל ישראלי"
                  />
                  <AnimatedErrorMessage message={nameError} />
                </div>
                <div className="form-group">
                  <label htmlFor="guest-email" className="popup-label">דוא"ל (לא חובה)</label>
                  <TextInput
                    id="guest-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    placeholder="example@domain.com"
                  />
                  <AnimatedErrorMessage message={emailError} />
                </div>
              </>
            )}
            <div className="form-group">
              <label htmlFor="guest-phone" className="popup-label">טלפון (לא חובה)</label>
              <TextInput
                id="guest-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  // Keep only digits
                  const next = e.target.value.replace(/\D/g, '');
                  setPhone(next);
                  setPhoneError('');
                }}
                placeholder="0501234567"
              />
              <AnimatedErrorMessage message={phoneError} />
            </div>
            <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="button-primary">המשך</button>
            </div>
          </form>
        </div>
      )}

      {showNoEmailWarning && (
        <NoEmailWarningPopup
          onCancel={() => setShowNoEmailWarning(false)}
          onContinue={() => {
            setShowNoEmailWarning(false);
            const payload = { name: name.trim() || undefined, phone: phone.trim() || undefined };
            setLastPayload(payload);
            createAndRedirect(payload);
          }}
        />
      )}

      {creating && (
        <div style={{ textAlign: 'center', fontSize: '24px', padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 50 50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="20" stroke="#333" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="31.415, 31.415">
                <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite" />
              </circle>
            </svg>
            <span>שאלון בהכנה...</span>
          </span>
        </div>
      )}
      {!creating && creationError && (
        <div style={{ maxWidth: 560, margin: '20px auto', border: '1px solid #B00020', borderRadius: 6, padding: '12px 16px', color: '#B00020' }}>
          <div style={{ marginBottom: 8 }}>{creationError}</div>
          <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="button-primary" onClick={() => lastPayload && createAndRedirect(lastPayload)}>
              נסו שוב
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AnswerPage;
