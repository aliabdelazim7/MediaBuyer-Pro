export const APP_CONFIG = {
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@mediabuyer.pro',
    password: process.env.ADMIN_PASSWORD || 'Admin@2026',
  },
  meta: {
    accessToken: process.env.META_ACCESS_TOKEN || 'EAAdnglLCaJkBSUJ9GWvklCWcjKnWndyvZBb4ZC4Kkb7MChUMp0pGaXIn9sunuWUp268Jce6aBIXNNQOHxf9z4tGNUKlZCAU1535naZAF4Iq8Ox7ZBkAybsWaNZAqL0TSTXlyLPQZC8iPxInrcfDZCruP7J6wfA03ys5ZCcrqZAHnXfAin4fu2QvTWc2ZAJfgysOsuvumZAmALZAiGLjJrKXazeyZBEcbkxqTcdo7nlmtrZBQC7UkIaLyg1mdJpY5lXrzXmxalaGypiVoeIVY2oB9BnYrBHt06TceTrZAiddp1QZDZD',
    verifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || 'crm_secret_verify_token_2026',
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  }
};
