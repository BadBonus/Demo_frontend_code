import { clearDemoSession } from '../../utils/demoStore';

export default defineEventHandler((event) => {
  clearDemoSession(event);
  return { ok: true };
});
