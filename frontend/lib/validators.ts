export const validateCompanyID = (id: string, countryCode: string): boolean => {
    const cleanId = id.replace(/[^\d\w]/g, ''); // Remove special chars

    switch (countryCode) {
        case 'BR': // CNPJ
            return validateCNPJ(cleanId);
        case 'US': // EIN: 9 digits
            return /^\d{9}$/.test(cleanId);
        case 'CA': // BN: 9 digits
            return /^\d{9}$/.test(cleanId);
        case 'GB': // CRN: 8 alphanumeric
            return /^[A-Z0-9]{8}$/.test(cleanId);
        case 'FR': // SIRET: 14 digits
            return /^\d{14}$/.test(cleanId);
        case 'DE': // Steuernummer: 10-13 digits
            return /^\d{10,13}$/.test(cleanId);
        case 'IT': // P.IVA: 11 digits
            return /^\d{11}$/.test(cleanId);
        case 'ES': // NIF: 9 alphanumeric
            return /^[A-Z0-9]{9}$/.test(cleanId);
        case 'PT': // NIF: 9 digits
            return /^\d{9}$/.test(cleanId);
        case 'MX': // RFC: 12-13 chars
            return /^[A-Z0-9]{12,13}$/.test(cleanId);
        case 'AR': // CUIT: 11 digits (20-12345678-9) pattern
            return /^\d{11}$/.test(cleanId);
        case 'CO': // NIT: 9-10 digits usually
            return /^\d{9,10}$/.test(cleanId);
        case 'CL': // RUT: 8-9 digits
            return /^\d{8,9}$/.test(cleanId);
        case 'PE': // RUC: 11 digits
            return /^\d{11}$/.test(cleanId);
        case 'UY': // RUT: 12 digits
            return /^\d{12}$/.test(cleanId);
        case 'CN': // USCC: 18 alphanumeric
            return /^[A-Z0-9]{18}$/.test(cleanId);
        case 'JP': // CN: 13 digits
            return /^\d{13}$/.test(cleanId);
        case 'IN': // GSTIN: 15 alphanumeric
            return /^[A-Z0-9]{15}$/.test(cleanId);
        case 'AU': // ABN: 11 digits
            return /^\d{11}$/.test(cleanId);
        case 'ZA': // Tax ID: 10 digits
            return /^\d{10}$/.test(cleanId);
        case 'NG': // TIN: 8-12 digits
            return /^\d{8,12}$/.test(cleanId);
        case 'RU': // INN: 10 or 12 digits
            return /^\d{10}$|^\d{12}$/.test(cleanId);
        case 'KR': // BRN: 10 digits
            return /^\d{10}$/.test(cleanId);
        case 'TR': // VKN: 10 digits
            return /^\d{10}$/.test(cleanId);
        case 'SA': // CR: 10 digits
            return /^\d{10}$/.test(cleanId);
        case 'AE': // TRN: 15 digits
            return /^\d{15}$/.test(cleanId);
        case 'CH': // UID: 9 digits after prefix
            return /^\d{9}$/.test(cleanId.replace('CHE', ''));
        case 'SE': // Org.nr: 10 digits
            return /^\d{10}$/.test(cleanId);
        case 'NL': // KVK: 8 digits
            return /^\d{8}$/.test(cleanId);
        case 'BE': // BCE: 10 digits
            return /^\d{10}$/.test(cleanId);
        default:
            // Generic check for others
            return cleanId.length >= 5;
    }
};

const validateCNPJ = (cnpj: string): boolean => {
    if (cnpj.length !== 14) return false;

    // Eliminate known invalid CNPJs
    if (/^(\d)\1+$/.test(cnpj)) return false;

    // Valida DVs
    let tamanho = cnpj.length - 2
    let numeros = cnpj.substring(0, tamanho)
    let digitos = cnpj.substring(tamanho)
    let soma = 0
    let pos = tamanho - 7

    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--
        if (pos < 2) pos = 9
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11
    if (resultado != parseInt(digitos.charAt(0))) return false

    tamanho = tamanho + 1
    numeros = cnpj.substring(0, tamanho)
    soma = 0
    pos = tamanho - 7

    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--
        if (pos < 2) pos = 9
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11
    if (resultado != parseInt(digitos.charAt(1))) return false

    return true;
}

export const formatCompanyID = (value: string, mask?: string): string => {
    if (!mask) return value;

    const cleanValue = value.replace(/[^\w]/g, ''); // Remove non-alphanumeric
    let formatted = '';
    let valIndex = 0;

    for (let i = 0; i < mask.length && valIndex < cleanValue.length; i++) {
        const maskChar = mask[i];
        const valChar = cleanValue[valIndex];

        if (maskChar === '9') {
            if (/\d/.test(valChar)) {
                formatted += valChar;
                valIndex++;
            } else {
                // If expecting digit but got something else, usually stop or skip
                // For simplicity, we can assume cleanest input, but here we just stop
                break;
            }
        } else if (maskChar === 'X') { // Alphanumeric
            formatted += valChar;
            valIndex++;
        } else if (maskChar === '*') { // Wildcard/Any
            formatted += valChar;
            valIndex++;
        } else {
            // Literal usually (-, ., /, space)
            // If the user typed the literal, we can consume it from input (optional UX),
            // OR we just append the literal and don't consume input yet
            formatted += maskChar;
            // If the user actually typed the literal char next, skip it in input to avoid duplication
            if (valChar === maskChar) {
                valIndex++;
            }
        }
    }

    return formatted;
};
