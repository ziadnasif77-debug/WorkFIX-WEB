export const CONFIG = {
  DEFAULT_COMMISSION_RATE: 0.12,
  MAX_QUOTES_PER_ORDER: 8,
  QUOTE_EXPIRY_HOURS: 24,
  PAGE_SIZE: 20,
  DISPATCH_CAP: 20,
  BAYESIAN_C: 10,
  BAYESIAN_M: 4.0,
  MIN_PAYOUT: 10,
  SUPPORTED_COUNTRIES: {
    SA: { currency: 'SAR', vat: 0.15, iban_len: 24, name_en: 'Saudi Arabia', name_ar: 'السعودية', name_no: 'Saudi-Arabia', name_sv: 'Saudiarabien' },
    AE: { currency: 'AED', vat: 0.05, iban_len: 23, name_en: 'UAE', name_ar: 'الإمارات', name_no: 'UAE', name_sv: 'UAE' },
    KW: { currency: 'KWD', vat: 0, iban_len: 30, name_en: 'Kuwait', name_ar: 'الكويت', name_no: 'Kuwait', name_sv: 'Kuwait' },
    QA: { currency: 'QAR', vat: 0, iban_len: 29, name_en: 'Qatar', name_ar: 'قطر', name_no: 'Qatar', name_sv: 'Qatar' },
    BH: { currency: 'BHD', vat: 0, iban_len: 22, name_en: 'Bahrain', name_ar: 'البحرين', name_no: 'Bahrain', name_sv: 'Bahrain' },
    OM: { currency: 'OMR', vat: 0, iban_len: 23, name_en: 'Oman', name_ar: 'عُمان', name_no: 'Oman', name_sv: 'Oman' },
    EG: { currency: 'EGP', vat: 0.14, iban_len: 29, name_en: 'Egypt', name_ar: 'مصر', name_no: 'Egypt', name_sv: 'Egypten' },
    NO: { currency: 'NOK', vat: 0.25, iban_len: 15, name_en: 'Norway', name_ar: 'النرويج', name_no: 'Norge', name_sv: 'Norge' },
    SE: { currency: 'SEK', vat: 0.25, iban_len: 22, name_en: 'Sweden', name_ar: 'السويد', name_no: 'Sverige', name_sv: 'Sverige' }
  } as Record<string, { currency: string; vat: number; iban_len: number; name_en: string; name_ar: string; name_no: string; name_sv: string }>,
  SUBSCRIPTION_PLANS: {
    pro_monthly: { tier: 'pro', period: 'monthly', price: 49 },
    pro_yearly: { tier: 'pro', period: 'yearly', price: 490 },
    business_monthly: { tier: 'business', period: 'monthly', price: 149 },
    business_yearly: { tier: 'business', period: 'yearly', price: 1490 }
  } as Record<string, { tier: string; period: string; price: number }>,
  BOOST_PLANS: {
    7: { price: 19 },
    14: { price: 35 },
    30: { price: 69 }
  } as Record<number, { price: number }>
}

export const ICON_MAP: Record<string, string> = {
  '🔧': 'wrench', '⚡': 'zap', '🎨': 'paintbrush', '🧹': 'sparkles',
  '❄️': 'snowflake', '🪚': 'hammer', '📦': 'truck', '🌱': 'leaf',
  '🔌': 'plug', '🏠': 'home'
}

export function catIconMap(emoji: string): string {
  return ICON_MAP[emoji] || 'wrench'
}
