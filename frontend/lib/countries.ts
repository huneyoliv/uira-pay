export interface CountryData {
    code: string;
    name: string;
    flag: string;
    currency: string;
    docLabel: string;
    docPlaceholder: string;
    maxLength: number;
    companyDocLabel: string;
    lang: 'PT' | 'EN' | 'ES' | 'FR';
    mask?: string; // Pattern: 9 for digit, A for letter, * for wild, others are literals
}

export const countries: CountryData[] = [
    { code: 'BR', name: 'Brasil', flag: '🇧🇷', currency: 'BRL', docLabel: 'CNPJ', docPlaceholder: '00.000.000/0000-00', maxLength: 18, companyDocLabel: 'Contrato Social / Requerimento de Empresário', lang: 'PT', mask: '99.999.999/9999-99' },
    { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', docLabel: 'EIN', docPlaceholder: '12-3456789', maxLength: 10, companyDocLabel: 'Articles of Incorporation / Organization', lang: 'EN', mask: '99-9999999' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', docLabel: 'BN', docPlaceholder: '123456789', maxLength: 9, companyDocLabel: 'Certificate of Incorporation', lang: 'EN', mask: '999999999' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', docLabel: 'CRN', docPlaceholder: '12345678', maxLength: 8, companyDocLabel: 'Certificate of Incorporation', lang: 'EN', mask: '**999999' }, // Variable format, often 2 chars + 6 digits or 8 digits
    { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', docLabel: 'SIRET', docPlaceholder: '123 456 789 00012', maxLength: 17, companyDocLabel: 'Kbis Extract (Extrait Kbis)', lang: 'FR', mask: '999 999 999 99999' }, // 14 digits + 3 spaces = 17 chars
    { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', docLabel: 'Steuernummer', docPlaceholder: '12/345/67890', maxLength: 13, companyDocLabel: 'Handelsregisterauszug', lang: 'EN', mask: '99/999/99999' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR', docLabel: 'P.IVA', docPlaceholder: '12345678901', maxLength: 11, companyDocLabel: 'Visura Camerale', lang: 'EN' },
    { code: 'ES', name: 'España', flag: '🇪🇸', currency: 'EUR', docLabel: 'NIF', docPlaceholder: 'A12345678', maxLength: 9, companyDocLabel: 'Escritura de Constitución', lang: 'ES', mask: 'X9999999X' }, // Letter + 7 digits + Letter/Digit
    { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', docLabel: 'NIF', docPlaceholder: '123456789', maxLength: 9, companyDocLabel: 'Certidão Permanente', lang: 'PT' },
    { code: 'MX', name: 'México', flag: '🇲🇽', currency: 'MXN', docLabel: 'RFC', docPlaceholder: 'ABC123456XYZ', maxLength: 13, companyDocLabel: 'Acta Constitutiva', lang: 'ES' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS', docLabel: 'CUIT', docPlaceholder: '20-12345678-9', maxLength: 13, companyDocLabel: 'Estatuto Social', lang: 'ES', mask: '99-99999999-9' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'COP', docLabel: 'NIT', docPlaceholder: '123.456.789-0', maxLength: 15, companyDocLabel: 'Certificado de Existencia y Representación Legal', lang: 'ES', mask: '999.999.999-9' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'CLP', docLabel: 'RUT', docPlaceholder: '12.345.678-9', maxLength: 12, companyDocLabel: 'Escritura Pública de Constitución', lang: 'ES', mask: '99.999.999-K' }, // Logic handles length
    { code: 'PE', name: 'Perú', flag: '🇵🇪', currency: 'PEN', docLabel: 'RUC', docPlaceholder: '10123456789', maxLength: 11, companyDocLabel: 'Partida Registral', lang: 'ES' },
    { code: 'UY', name: 'Uruguay', flag: '🇺🇾', currency: 'UYU', docLabel: 'RUT', docPlaceholder: '123456789012', maxLength: 12, companyDocLabel: 'Estatutos', lang: 'ES' },
    { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY', docLabel: 'USCC', docPlaceholder: '91110000123456789X', maxLength: 18, companyDocLabel: 'Business License', lang: 'EN' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', docLabel: 'CN', docPlaceholder: '1234567890123', maxLength: 13, companyDocLabel: 'Teikan (Articles of Incorporation)', lang: 'EN' },
    { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', docLabel: 'GSTIN', docPlaceholder: '22AAAAA0000A1Z5', maxLength: 15, companyDocLabel: 'Certificate of Incorporation', lang: 'EN' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', docLabel: 'ABN', docPlaceholder: '12 345 678 901', maxLength: 14, companyDocLabel: 'Certificate of Registration', lang: 'EN', mask: '99 999 999 999' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', docLabel: 'Tax ID', docPlaceholder: 'Reference Number', maxLength: 10, companyDocLabel: 'CIPC Registration Certificate (CoR 14.3)', lang: 'EN' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', docLabel: 'TIN', docPlaceholder: '12345678-0001', maxLength: 13, companyDocLabel: 'Certificate of Incorporation (CAC)', lang: 'EN', mask: '99999999-9999' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺', currency: 'RUB', docLabel: 'INN', docPlaceholder: '1234567890', maxLength: 12, companyDocLabel: 'Certificate of State Registration', lang: 'EN' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW', docLabel: 'BRN', docPlaceholder: '123-45-67890', maxLength: 12, companyDocLabel: 'Business Registration Certificate', lang: 'EN', mask: '999-99-99999' },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷', currency: 'TRY', docLabel: 'VKN', docPlaceholder: '1234567890', maxLength: 10, companyDocLabel: 'Trade Registry Gazette', lang: 'EN' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', docLabel: 'CR', docPlaceholder: '1010123456', maxLength: 10, companyDocLabel: 'Commercial Registration (CR)', lang: 'EN' },
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', docLabel: 'TRN', docPlaceholder: '100123456789003', maxLength: 15, companyDocLabel: 'Trade License', lang: 'EN' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', docLabel: 'UID', docPlaceholder: 'CHE-123.456.789', maxLength: 15, companyDocLabel: 'Commercial Register Extract', lang: 'FR', mask: 'CHE-999.999.999' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', docLabel: 'Org.nr', docPlaceholder: '123456-7890', maxLength: 11, companyDocLabel: 'Registration Certificate (Registreringsbevis)', lang: 'EN', mask: '999999-9999' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', docLabel: 'KVK', docPlaceholder: '12345678', maxLength: 8, companyDocLabel: 'KVK Extract', lang: 'EN' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪', currency: 'EUR', docLabel: 'BCE', docPlaceholder: '0123.456.789', maxLength: 12, companyDocLabel: 'Deed of Incorporation', lang: 'FR', mask: '0999.999.999' },
    // Add generic fallback for others if needed, or rely on "Other" logic
];

export const getCountryData = (code: string): CountryData => {
    return countries.find(c => c.code === code) || {
        code: 'OT',
        name: 'Other',
        flag: '🌍',
        currency: 'USD',
        docLabel: 'Tax ID',
        docPlaceholder: 'Registration Number',
        maxLength: 20,
        companyDocLabel: 'Registration Document',
        lang: 'EN'
    };
};
