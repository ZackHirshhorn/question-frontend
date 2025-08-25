import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuestionnaire } from '../api/questionnaire';
import QuestionnaireView, { type PreviewQuestion } from './QuestionnaireView';

const AnswerFill: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [info, setInfo] = useState<{ name?: string | null; email?: string | null; phone?: string | null } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [template, setTemplate] = useState<
    | {
        name?: string | null;
        categories?: Array<{
          name?: string | null;
          questions?: PreviewQuestion[];
          subCategories?: Array<{
            name?: string | null;
            questions?: PreviewQuestion[];
            topics?: Array<{
              name?: string | null;
              questions?: PreviewQuestion[];
            }>;
          }>;
        }>;
      }
    | null
  >(null);

  // Fetch server-side user info (userName, userEmail, userPhone)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getQuestionnaire(id);
        const q = (res as { data?: any } | undefined)?.data || {};
        const serverName = q.userName ?? null;
        const serverEmail = q.userEmail ?? null;
        const serverPhone = q.userPhone ?? null;
        const tpl = q.template || null;
        if (cancelled) return;
        setInfo({
          name: typeof serverName === 'string' ? serverName.trim() : serverName,
          email: typeof serverEmail === 'string' ? serverEmail.trim() : serverEmail,
          phone: typeof serverPhone === 'string' ? serverPhone.trim() : serverPhone,
        });
        setTemplate(tpl);
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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>דף מענה לשאלון</h2>
      <p>כאן יוצגו השאלות למענה בהמשך.</p>
      {Boolean((info?.name || '').toString().trim() || (info?.email || '').toString().trim() || (info?.phone || '').toString().trim()) && (
        <div style={{ marginTop: 16, padding: '12px 16px', border: '1px solid #EDEDEF', borderRadius: 6, background: '#F6F6F9' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>פרטי משתמש:</div>
          <ul style={{ margin: 0, paddingInlineStart: 18 }}>
            {info.name && String(info.name).trim().length > 0 && <li>שם: {String(info.name).trim()}</li>}
            {info.email && String(info.email).trim().length > 0 && <li>דוא"ל: {String(info.email).trim()}</li>}
            {info.phone && String(info.phone).trim().length > 0 && <li>טלפון: {String(info.phone).trim()}</li>}
          </ul>
        </div>
      )}

      {/* Questionnaire rendering below user info */}
      <div style={{ marginTop: 24, direction: 'rtl' }}>
        {loading ? (
          <div style={{ color: '#666' }}>טוען…</div>
        ) : template && Array.isArray(template.categories) && template.categories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {template.categories.map((cat: any, ci: number) => (
              <div key={`cat-${ci}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cat?.name && (
                  <div style={{ fontWeight: 700, fontSize: 20, textAlign: 'right' }}>{String(cat.name)}</div>
                )}
                <QuestionnaireView questions={(cat?.questions as PreviewQuestion[]) || []} />

                {Array.isArray(cat?.subCategories) && cat.subCategories.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {cat.subCategories.map((sc: any, si: number) => (
                      <div key={`sub-${ci}-${si}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {sc?.name && (
                          <div style={{ fontWeight: 600, fontSize: 18, textAlign: 'right' }}>{String(sc.name)}</div>
                        )}
                        <QuestionnaireView questions={(sc?.questions as PreviewQuestion[]) || []} />

                        {Array.isArray(sc?.topics) && sc.topics.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {sc.topics.map((tp: any, ti: number) => (
                              <div key={`top-${ci}-${si}-${ti}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {tp?.name && (
                                  <div style={{ fontWeight: 500, fontSize: 16, textAlign: 'right' }}>{String(tp.name)}</div>
                                )}
                                <QuestionnaireView questions={(tp?.questions as PreviewQuestion[]) || []} />
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
    </div>
  );
};

export default AnswerFill;
