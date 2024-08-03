import { EmailTemplates } from '../enums/enums';

export type mailer2Content = {
  template: EmailTemplates.MAILER_2;
  context: {
    title: string;
    url?: string;
    cta: boolean;
    body: string;
    btntext?: string;
    company?: string;
  };
};

export type verifyContent = {
  template: EmailTemplates.VERIFY_EMAIL;
  context: {
    recipientName: string;
    serverData: string;
    body: string;
    moredata?: string[];
    senderName?: string;
  };
};
export type EmailContent = verifyContent | mailer2Content;
