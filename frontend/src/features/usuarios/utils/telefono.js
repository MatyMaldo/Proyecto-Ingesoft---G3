/** Devuelve solo los 9 dígitos nacionales de un teléfono peruano (acepta el prefijo 51 o +51). */
export function separarTelefono(telefono) {
    const valor = String(telefono ?? '').trim();
    const digitos = valor.replace(/\D/g, '');
    const nacional = digitos.length === 11 && digitos.startsWith('51') ? digitos.slice(2) : digitos;
    return nacional.slice(0, 9);
}

/** Teléfono en formato `+51XXXXXXXXX`, o cadena vacía si no hay dígitos. */
export function telefonoPeru(telefono) {
    const digitos = separarTelefono(telefono);
    return digitos ? `+51${digitos}` : '';
}
