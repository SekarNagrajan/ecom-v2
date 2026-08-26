// Modified by Sekar Nagarajan (2026-08-25 15:00)
import { Layout, Typography } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

export function AppFooter() {
  return (
    <Footer className="app-footer">
      <div className="app-footer__inner">
        <Text className="app-footer__text">Version 1.0.0</Text>
        <Text className="app-footer__text">
          Copyright &copy; {new Date().getFullYear()} All rights reserved. Solverminds
          Solutions &amp; Technologies Pvt.Ltd
        </Text>
      </div>
    </Footer>
  );
}
