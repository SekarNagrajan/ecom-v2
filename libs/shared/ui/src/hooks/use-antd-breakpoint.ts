import { Grid } from 'antd';

const { useBreakpoint } = Grid;

export const useAntdBreakpoint = () => {
  const screen = useBreakpoint();
  const ready = Object.keys(screen).length > 0;

  return {
    screen,
    ready,
    isExtraSmall: ready ? !screen.sm : false,
    isMobile: ready ? !screen.md : false,
    isTablet: ready ? screen.md && !screen.lg : false,
    isLaptop: ready ? screen.lg && !screen.xl : false,
    isDesktop: ready ? screen.lg : false,
    isWideDesktop: ready ? screen.xxl : false,
  };
};
