import {
  BarChart,
  FunnelChart,
  LineChart,
  PieChart,
  TreemapChart,
} from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent,
} from 'echarts/components';
// `use` is ECharts' module-registration entry point. We alias it so the
// React hooks ESLint rule doesn't mistake `use(...)` for the React `use()`
// hook (which is forbidden outside components/hooks).
import { use as registerModules } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

let registered = false;

/**
 * Register only the ECharts modules used across the app. Called lazily by
 * `AppChart` on first mount; safe to call multiple times.
 *
 * To add a new chart type or component, register it here AND extend the
 * `ECOption` union in `chart-types.ts` so consumers get the matching types.
 */
export function registerEChartsModules(): void {
  if (registered) return;

  registerModules([
    BarChart,
    LineChart,
    PieChart,
    FunnelChart,
    TreemapChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DatasetComponent,
    TransformComponent,
    TitleComponent,
    CanvasRenderer,
  ]);

  registered = true;
}
