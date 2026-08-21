// Modified by Antigravity (2026-08-21)
import { createRoute } from '@tanstack/react-router';
import { VendorApprovalsView } from './components/VendorApprovalsView';
import { appRoute } from '../../app/router';

export const vendorApprovalsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'vendor-approvals',
  component: VendorApprovalsView,
});
