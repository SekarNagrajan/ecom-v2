// Created by Sekar Nagarajan (2026-11-13 02:40)
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppKpiTile } from './app-kpi-tile';

const meta: Meta<typeof AppKpiTile> = {
  title: 'Chart/AppKpiTile',
  component: AppKpiTile,
  args: {
    label: 'Volume this month',
    value: '1,284',
    unit: 'TEU',
    delta: { value: 12.4, label: 'vs last month' },
    sparkline: [320, 410, 380, 460, 520, 495, 610, 640],
    tone: 'primary',
  },
};
export default meta;
type Story = StoryObj<typeof AppKpiTile>;

export const Default: Story = {};
export const Clickable: Story = { args: { onClick: () => {}, selected: true } };
export const CostDown: Story = {
  args: {
    label: 'Outstanding balance',
    value: '48,920',
    unit: 'USD',
    tone: 'warning',
    delta: { value: -8.1, label: 'vs last month', positiveIsGood: false },
  },
};
export const NoSparkline: Story = { args: { sparkline: undefined, caption: 'Updated 5 min ago' } };
export const Loading: Story = { args: { loading: true } };
