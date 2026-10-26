import { publicUser, requireUser } from '../../utils/demoStore';

export default defineEventHandler((event) => publicUser(requireUser(event)));
