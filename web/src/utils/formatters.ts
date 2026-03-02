export const formatWhatsAppNumber = (value: string) => {
    if (!value) return '';

    // Remove all non-numeric characters except +
    let numbers = value.replace(/(?!^\+)[^\d]/g, '');

    // If it doesn't start with +, let's format as a standard BR mobile: (DD) 9XXXX-XXXX
    if (!numbers.startsWith('+')) {
        numbers = numbers.replace(/\D/g, '');
        if (numbers.length > 11) {
            numbers = numbers.slice(0, 11);
        }
        if (numbers.length > 2) {
            numbers = numbers.replace(/^(\d{2})(\d)/g, '($1) $2');
        }
        if (numbers.length > 9) {
            numbers = numbers.replace(/(\d)(\d{4})$/, '$1-$2');
        }
        return numbers;
    }

    // If it starts with +55 (Brazil), format it with (DD) 9XXXX-XXXX
    if (numbers.startsWith('+55')) {
        let brPart = numbers.slice(3).replace(/\D/g, '');
        if (brPart.length > 11) {
            brPart = brPart.slice(0, 11);
        }
        if (brPart.length > 2) {
            brPart = brPart.replace(/^(\d{2})(\d)/g, '($1) $2');
        }
        if (brPart.length > 9) {
            brPart = brPart.replace(/(\d)(\d{4})$/, '$1-$2');
        }
        return `+55 ${brPart}`;
    }

    return numbers;
};
