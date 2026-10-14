// Recharts' default tooltip is a fixed white box, but its label inherits the
// theme text color — in dark mode that was white on white. Every report chart
// spreads these props into <Tooltip> so the box follows the theme.
export const CHART_TOOLTIP_PROPS = {
  contentStyle: {
    backgroundColor: 'var(--popover)',
    borderColor: 'var(--border)',
    borderRadius: 8,
    color: 'var(--popover-foreground)',
  },
  labelStyle: { color: 'var(--popover-foreground)', fontWeight: 600 },
  cursor: { fill: 'var(--muted)', opacity: 0.5 },
};
