/**
 * Formatea un valor numérico a moneda con soporte para múltiples divisas.
 * @param amount El valor a formatear.
 * @param currency El código de la moneda (default: 'COP').
 * @returns El string formateado.
 */
export function formatCurrency(amount: number, currency: string = 'COP'): string {
  const locales: Record<string, string> = {
    'COP': 'es-CO',
    'USD': 'en-US',
    'EUR': 'de-DE'
  };

  return new Intl.NumberFormat(locales[currency] || 'es-CO', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
}
