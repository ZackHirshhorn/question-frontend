import { afterEach, describe, expect, it, vi } from 'vitest';

const sendMock = vi.fn();

vi.mock('@emailjs/browser', () => ({
  default: {
    send: sendMock,
  },
}));

const loadModule = async () => import('./emailNotifications');

afterEach(() => {
  vi.unstubAllEnvs();
  sendMock.mockReset();
  vi.restoreAllMocks();
});

describe('emailNotifications service', () => {
  it('detects missing configuration and skips sending in development', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', '');
    vi.stubEnv('VITE_EMAILJS_QUESTIONNAIRE_TEMPLATE_ID', '');
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', '');
    vi.stubEnv('DEV', 'true');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { isEmailConfigured, sendQuestionnaireCreatedEmail } = await loadModule();

    expect(isEmailConfigured()).toBe(false);

    await sendQuestionnaireCreatedEmail({
      toEmail: 'user@example.com',
      questionnaireUrl: 'https://example.com/questionnaire',
      templateName: 'Template',
    });

    expect(sendMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      'EmailJS configuration missing: questionnaire email will be skipped',
    );
  });

  it('sends questionnaire email with normalized values when configured', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'service-123');
    vi.stubEnv('VITE_EMAILJS_QUESTIONNAIRE_TEMPLATE_ID', 'template-456');
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'public-789');
    vi.stubEnv('DEV', '');

    sendMock.mockResolvedValue(undefined);

    const { isEmailConfigured, sendQuestionnaireCreatedEmail } = await loadModule();

    expect(isEmailConfigured()).toBe(true);

    await sendQuestionnaireCreatedEmail({
      toEmail: 'guest@example.com',
      questionnaireUrl: 'https://example.com/path',
      templateName: '   ',
      respondentName: '  ',
    });

    expect(sendMock).toHaveBeenCalledWith(
      'service-123',
      'template-456',
      {
        to_email: 'guest@example.com',
        questionnaire_url: 'https://example.com/path',
        template_name: 'תבנית ללא שם',
        respondent_name: 'אורח ללא שם',
      },
      { publicKey: 'public-789' },
    );
  });

  it('logs an error when EmailJS fails to send', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'service');
    vi.stubEnv('VITE_EMAILJS_QUESTIONNAIRE_TEMPLATE_ID', 'template');
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'public');

    const error = new Error('network down');
    sendMock.mockRejectedValue(error);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { sendQuestionnaireCreatedEmail } = await loadModule();

    await expect(
      sendQuestionnaireCreatedEmail({
        toEmail: 'owner@example.com',
        questionnaireUrl: 'https://example.com/one',
        templateName: 'Survey',
        respondentName: 'Dana',
      }),
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to send questionnaire email via EmailJS',
      error,
    );
  });
});
