// Modified by Sekar Nagarajan (2026-08-21 14:58)
import { Layout, theme } from 'antd';
import { useState } from 'react';
import { AuthenticatedSidebar } from './AuthenticatedSidebar';
import { AuthenticatedLayoutHeader } from './AuthenticatedLayoutHeader';
import { AppFooter } from './AppFooter';

import { Outlet, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@solverminds/auth';

const { Content } = Layout;

export function AuthenticatedLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const onLogout = () => {
    useAuthStore.getState().logout();
    navigate({ to: '/' });
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #bfbfbf; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
      <AuthenticatedSidebar 
        collapsed={collapsed} 
        onCollapse={setCollapsed} 
      />
      <Layout style={{ marginLeft: 80, transition: 'all 0.25s cubic-bezier(0.2, 0, 0, 1)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <AuthenticatedLayoutHeader 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          onLogout={onLogout} 
        />
        <Content 
          style={{ 
            flex: 1, 
            minHeight: 0,
            overflow: 'hidden',
            background: token.colorBgLayout, 
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <main
              className="custom-scroll"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
                minHeight: 0,
                padding: token.paddingMD,
              }}
            >
              <div
                style={{
                  minHeight: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Outlet />
              </div>
            </main>
          </div>
        </Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
}

