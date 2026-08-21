import { useEffect, useState } from 'react';
import { Button, Card, Result, Spin, Typography, Flex } from 'antd';
import { activateUser } from './api/auth.api';

const { Title, Text } = Typography;

interface ActivationRouteProps {
  onProceedToLogin: () => void;
}

export function ActivationRoute({ onProceedToLogin }: ActivationRouteProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No activation token found in the URL. Please check your email link.');
      return;
    }

    activateUser(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Failed to activate account.');
      });
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Card style={{ borderRadius: 16, boxShadow: '0 12px 32px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: 48 }}>
        {status === 'loading' && (
          <Flex vertical align="center" gap={16}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 16 }}>Activating Account...</Title>
            <Text type="secondary">Please wait while we verify your activation link.</Text>
          </Flex>
        )}

        {status === 'success' && (
          <Result
            status="success"
            title="Account Activated Successfully!"
            subTitle={message || "Your E-Com portal account is now active and ready to use."}
            extra={[
              <Button type="primary" size="large" key="login" onClick={onProceedToLogin} style={{ borderRadius: 8, padding: '0 32px' }}>
                Proceed to Login
              </Button>
            ]}
          />
        )}

        {status === 'error' && (
          <Result
            status="error"
            title="Activation Failed"
            subTitle={message}
            extra={[
              <Button type="default" size="large" key="home" onClick={() => window.location.href = '/'} style={{ borderRadius: 8 }}>
                Back to Home
              </Button>
            ]}
          />
        )}
      </Card>
    </div>
  );
}
