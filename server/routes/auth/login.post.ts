import { createError, readBody } from 'h3';
import { findUserByEmail, issueSession } from '../../utils/demoStore';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event);
  const email = body?.email?.trim() ?? '';
  const password = body?.password ?? '';

  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { statusCode: 401, message: 'Неверный email или пароль' },
    });
  }

  return issueSession(event, user);
});
