import { createError, readBody } from 'h3';
import { createUser, issueSession } from '../../utils/demoStore';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    nickname?: string;
  }>(event);

  const email = body?.email?.trim() ?? '';
  const password = body?.password ?? '';
  const confirmPassword = body?.confirmPassword ?? '';
  const nickname = body?.nickname?.trim() ?? '';

  if (!email || !password || !nickname) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { statusCode: 400, message: 'Заполните все поля' },
    });
  }

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { statusCode: 400, message: 'Пароли не совпадают' },
    });
  }

  const user = createUser({ email, password, nickname });
  return issueSession(event, user);
});
