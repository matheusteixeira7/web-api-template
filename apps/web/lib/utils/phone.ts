/**
 * Remove all non-digit characters from phone number
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Format phone number to Brazilian format: (11) 99999-9999
 */
export function formatPhone(phone: string): string {
  const digits = cleanPhone(phone)

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return phone
}

/**
 * Generate WhatsApp link from phone number
 * Format: https://wa.me/5511999999999
 */
export function getWhatsAppLink(phone: string): string {
  const digits = cleanPhone(phone)

  // Add country code if not present
  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`

  return `https://wa.me/${fullNumber}`
}
