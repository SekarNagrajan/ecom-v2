import { Flex, Typography } from 'antd';
import type { TimezoneSelectOption } from '../utils/timezone-options';

const { Text } = Typography;

export function renderTimezoneSelectOption(option: { data: TimezoneSelectOption }) {
  const { label, selectedLabel } = option.data;
  return (
    <Flex align="center" justify="space-between">
      <Text>{selectedLabel}</Text>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
    </Flex>
  );
}
