import { Flex, Spin } from 'antd';

export function ChartLoadingState() {
  return (
    <Flex
      align="center"
      justify="center"
      style={{ width: '100%', height: '100%', minHeight: 160 }}
    >
      <Spin />
    </Flex>
  );
}
