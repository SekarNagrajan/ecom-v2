// Modified by sekar nagarajan (2026-08-21)
import { createRoute } from '@tanstack/react-router';
import { appRoute } from '../../app/router';
import { UserCreationView } from './components/UserCreationView';

export const userCreationRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'user-creation',
  component: UserCreationView,
});
