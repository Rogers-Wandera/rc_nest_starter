export interface EmailTemplateDefault {
  // Required fields
  title: string;

  data?: Record<string, string | number>;
  additionalHtml?: string;

  // Optional header
  header?: {
    logoUrl?: string;
    logoAltText?: string;
    logoWidth?: number;
  };

  // Optional call to action
  callToAction?: {
    text: string;
    url: string;
    color?: string; // Hex color code
  };

  // Optional featured content section
  features?: {
    title: string;
    desc?: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };

  // Optional footer
  footer?: {
    copyrightText?: string;
    companyAddress?: string;
    links?: Array<{
      text: string;
      url: string;
    }>;
  };

  // Optional styling overrides
  styles?: {
    primaryColor?: string; // Hex color code
    backgroundColor?: string; // Hex color code
    textColor?: string; // Hex color code
    fontFamily?: string;
  };
}

export enum TemplateMap {
  DEFAULT = 'mailer',
}

export enum TemplateType {
  DEFAULT = 'default',
}

export interface DefaultTemplate {
  type: TemplateType.DEFAULT;
  context: EmailTemplateDefault;
}

export type EmailTemplates = DefaultTemplate;
export type PushTemplates = { type: TemplateType; context: {} };
export type NotifyTemplates = EmailTemplates | PushTemplates;
