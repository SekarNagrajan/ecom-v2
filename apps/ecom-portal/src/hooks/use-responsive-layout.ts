// Modified by Sekar Nagarajan (2026-08-25 15:00)
import { useAntdBreakpoint } from '@solverminds/shared-ui/hooks';

/** Viewport tiers aligned with Ant Design breakpoints + agenct.md. */
export type ViewportTier = 'mobile' | 'tablet' | 'web' | 'monitor';

/**
 * Responsive layout helper for ecom-portal features and shells.
 * - mobile:  < 768px  — drawer nav, stacked headers, full-width columns
 * - tablet:  768–991px — compact header, 2-column grids, scrollable wide content
 * - web:     992–1599px — sidebar rail (80px collapsed), standard layouts
 * - monitor: ≥ 1600px — feature-page-shell max-width 1600px centered
 */
export function useResponsiveLayout() {
  const bp = useAntdBreakpoint();

  const tier: ViewportTier = bp.isMobile
    ? 'mobile'
    : bp.isTablet
      ? 'tablet'
      : bp.isWideDesktop
        ? 'monitor'
        : 'web';

  return {
    ...bp,
    tier,
    isMobileTier: tier === 'mobile',
    isTabletTier: tier === 'tablet',
    isWebTier: tier === 'web',
    isMonitorTier: tier === 'monitor',
    /** Sidebar is overlay drawer on mobile; fixed rail on tablet+. */
    useMobileNav: bp.isMobile,
    /** Hide secondary header controls (tenant switchers, role text). */
    compactHeader: bp.isMobile || bp.isTablet,
    /** Stack module header actions below title. */
    stackModuleHeader: bp.isMobile,
    /** Horizontal scroll for wizard steps / wide tables. */
    scrollWideContent: bp.isMobile || bp.isTablet,
    /** Modal / drawer should use full width on small screens. */
    fullWidthOverlay: bp.isMobile,
    /** Landing / hero panels stack instead of side-by-side. */
    stackHero: bp.isMobile || bp.isTablet,
  };
}
