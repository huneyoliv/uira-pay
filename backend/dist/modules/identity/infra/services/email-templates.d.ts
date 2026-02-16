interface EmailTemplate {
    subject: string;
    html: string;
}
export declare function getEmailTemplate(type: 'verification' | 'passwordReset', code: string, language?: string): EmailTemplate;
export {};
