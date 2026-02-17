/**
 * Backend validation for company IDs, mirroring frontend/lib/validators.ts
 * This provides DOUBLE VERIFICATION (front + back) for document numbers.
 */

export function validateCompanyID(id: string, countryCode: string): boolean {
    const cleanId = id.replace(/[^\d\w]/g, '');

    switch (countryCode) {
        case 'BR':
            return validateCNPJ(cleanId);
        case 'US':
            return /^\d{9}$/.test(cleanId);
        case 'CA':
            return /^\d{9}$/.test(cleanId);
        case 'GB':
            return /^[A-Z0-9]{8}$/i.test(cleanId);
        case 'FR':
            return /^\d{14}$/.test(cleanId);
        case 'DE':
            return /^\d{10,13}$/.test(cleanId);
        case 'IT':
            return /^\d{11}$/.test(cleanId);
        case 'ES':
            return /^[A-Z0-9]{9}$/i.test(cleanId);
        case 'PT':
            return /^\d{9}$/.test(cleanId);
        case 'MX':
            return /^[A-Z0-9]{12,13}$/i.test(cleanId);
        case 'AR':
            return /^\d{11}$/.test(cleanId);
        case 'CO':
            return /^\d{9,10}$/.test(cleanId);
        case 'CL':
            return /^\d{8,9}$/.test(cleanId);
        case 'PE':
            return /^\d{11}$/.test(cleanId);
        case 'UY':
            return /^\d{12}$/.test(cleanId);
        case 'CN':
            return /^[A-Z0-9]{18}$/i.test(cleanId);
        case 'JP':
            return /^\d{13}$/.test(cleanId);
        case 'IN':
            return /^[A-Z0-9]{15}$/i.test(cleanId);
        case 'AU':
            return /^\d{11}$/.test(cleanId);
        case 'ZA':
            return /^\d{10}$/.test(cleanId);
        case 'NG':
            return /^\d{8,12}$/.test(cleanId);
        case 'RU':
            return /^\d{10}$|^\d{12}$/.test(cleanId);
        case 'KR':
            return /^\d{10}$/.test(cleanId);
        case 'TR':
            return /^\d{10}$/.test(cleanId);
        case 'SA':
            return /^\d{10}$/.test(cleanId);
        case 'AE':
            return /^\d{15}$/.test(cleanId);
        case 'CH':
            return /^\d{9}$/.test(cleanId.replace('CHE', ''));
        case 'SE':
            return /^\d{10}$/.test(cleanId);
        case 'NL':
            return /^\d{8}$/.test(cleanId);
        case 'BE':
            return /^\d{10}$/.test(cleanId);
        default:
            return cleanId.length >= 5;
    }
}

function validateCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14) return false;

    // Eliminate known invalid CNPJs
    if (/^(\d)\1+$/.test(cnpj)) return false;

    // Validate check digits
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != parseInt(digitos.charAt(1))) return false;

    return true;
}
