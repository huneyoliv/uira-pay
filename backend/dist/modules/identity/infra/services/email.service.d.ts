export declare class EmailService {
    private readonly logger;
    private resend;
    constructor();
    private getSenderEmail;
    sendVerificationEmail(to: string, code: string, language?: string): Promise<void>;
    sendPasswordResetEmail(to: string, code: string, language?: string): Promise<void>;
    sendSecurityCodeEmail(to: string, code: string, language?: string): Promise<void>;
    sendSecurityNotification(to: string, type: 'twoFAEnabled' | 'twoFADisabled' | 'passwordChanged' | 'emailChanged' | 'emailChangedOld', language?: string, extra?: any): Promise<void>;
    private sendEmail;
}
