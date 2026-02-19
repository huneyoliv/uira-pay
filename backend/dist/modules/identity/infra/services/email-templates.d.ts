interface EmailTemplate {
    subject: string;
    html: string;
}
type TemplateType = 'verification' | 'passwordReset' | 'securityCode' | 'twoFAEnabled' | 'twoFADisabled' | 'passwordChanged' | 'emailChanged' | 'emailChangedOld';
export declare function getEmailTemplate(type: TemplateType, code: string, language?: string, extra?: any): EmailTemplate;
export {};
