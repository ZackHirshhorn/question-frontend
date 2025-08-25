import emailjs from '@emailjs/browser';

export interface QuestionnaireEmailParams {
  toEmail: string;
  questionnaireUrl: string;
  templateName: string;
  respondentName?: string;
}

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_QUESTIONNAIRE_TEMPLATE_ID;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const missingConfig = !serviceId || !templateId || !publicKey;

export const isEmailConfigured = () => !missingConfig;

export async function sendQuestionnaireCreatedEmail(params: QuestionnaireEmailParams) {
  if (missingConfig) {
    if (import.meta.env.DEV) {
      console.warn('EmailJS configuration missing: questionnaire email will be skipped');
    }
    return;
  }

  const { toEmail, questionnaireUrl, templateName, respondentName } = params;
  const resolvedName = respondentName && respondentName.trim() ? respondentName.trim() : 'אורח ללא שם';
  const messageVariables: Record<string, string> = {
    to_email: toEmail,
    questionnaire_url: questionnaireUrl,
    template_name: templateName.trim() || 'תבנית ללא שם',
    respondent_name: resolvedName,
  };

  try {
    await emailjs.send(serviceId, templateId, messageVariables, {
      publicKey,
    });
  } catch (error) {
    console.error('Failed to send questionnaire email via EmailJS', error);
  }
}
