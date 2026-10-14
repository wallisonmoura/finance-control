import { CHART_TOOLTIP_PROPS } from '@/modules/reports/presentation/ui/utils/chart-tooltip-style';

describe('CHART_TOOLTIP_PROPS', () => {
  it('should follow the theme instead of the library white box', () => {
    // Recharts paints a fixed white box while the label inherits the theme
    // text color: in dark mode the label turned white on white.
    expect(CHART_TOOLTIP_PROPS.contentStyle).toMatchObject({
      backgroundColor: 'var(--popover)',
      borderColor: 'var(--border)',
      color: 'var(--popover-foreground)',
    });
    expect(CHART_TOOLTIP_PROPS.labelStyle).toMatchObject({ color: 'var(--popover-foreground)' });
    expect(CHART_TOOLTIP_PROPS.cursor).toMatchObject({ fill: 'var(--muted)' });
  });
});
