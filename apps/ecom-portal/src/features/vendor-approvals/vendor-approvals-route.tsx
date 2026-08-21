// Modified by sekar nagarajan (2026-08-21)
import { createRoute } from '@tanstack/react-router';
import { appRoute } from '../../app/router';
import { VendorApprovalsView } from './components/VendorApprovalsView';

export const vendorApprovalsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'vendor-approvals',
  component: VendorApprovalsView,
});
