// Recharts' default tooltip is a fixed white box, its label inherits the theme
// text color (white on white in dark mode) and each value line takes the
// series color, or black (#000) when bars are colored one by one. Every report
// chart spreads these props into <Tooltip> so all of it follows the theme;
// the colored bar beside the value still carries the series identity.
export const CHART_TOOLTIP_PROPS = {
  contentStyle: {
    backgroundColor: 'var(--popover)',
    borderColor: 'var(--border)',
    borderRadius: 8,
    color: 'var(--popover-foreground)',
  },
  labelStyle: { color: 'var(--popover-foreground)', fontWeight: 600 },
  itemStyle: { color: 'var(--popover-foreground)' },
  cursor: { fill: 'var(--muted)', opacity: 0.5 },
};
