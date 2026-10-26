export const AUTH_COOKIE_TOKEN_NAME = 'refresh_token';
export const TOKEN_LIFE = 7 * 24 * 60 * 60 * 1000;

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 дней
};
