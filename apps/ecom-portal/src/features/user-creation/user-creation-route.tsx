// Modified by Antigravity (2026-08-21)
import { createRoute } from '@tanstack/react-router';
import { UserCreationView } from './components/UserCreationView';
import { appRoute } from '../../app/router';

export const userCreationRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'user-creation',
  component: UserCreationView,
});
