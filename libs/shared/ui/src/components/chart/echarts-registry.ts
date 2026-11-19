// Modified by Sekar Nagarajan (2026-11-13 02:40)
import {
  BarChart,
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  TreemapChart,
} from 'echarts/charts';
import {
  AriaComponent,
  DatasetComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent,
  VisualMapComponent,
} from 'echarts/components';
// `use` is ECharts' module-registration entry point. We alias it so the
// React hooks ESLint rule doesn't mistake `use(...)` for the React `use()`
// hook (which is forbidden outside components/hooks).
import { use as registerModules } from 'echarts/core';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

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
    GaugeChart,
    ScatterChart,
    HeatmapChart,
    SankeyChart,
    RadarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DatasetComponent,
    TransformComponent,
    TitleComponent,
    DataZoomInsideComponent,
    DataZoomSliderComponent,
    GraphicComponent,
    MarkLineComponent,
    MarkPointComponent,
    VisualMapComponent,
    ToolboxComponent,
    AriaComponent,
    // Both renderers so `renderer="svg"` (crisp donuts, print) works as the prop promises.
    CanvasRenderer,
    SVGRenderer,
  ]);

  registered = true;
}
