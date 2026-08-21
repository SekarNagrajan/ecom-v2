// Modified by Sekar Nagarajan (2026-08-21 15:35) - Modern Appearance UI Redesign
import {
  CheckOutlined,
  BlockOutlined,
  ColumnWidthOutlined,
  ExpandOutlined,
} from '@ant-design/icons';
import { AppButton, AppSelect } from '@solverminds/shared-ui';
import { Alert, Card, Col, Flex, Row, Space, Typography, theme } from 'antd';

import { FormSection } from '../../../components/form-section/form-section';
import {
  COLOR_OPTIONS,
  DENSITY_LEVEL_OPTIONS,
  FONT_FAMILY_OPTIONS,
} from '../constants';
import { type useThemePreferencesController } from '../hooks/use-theme-preferences-controller';

const { Text } = Typography;

function PreferenceField({
  label,
  children,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const { token } = theme.useToken();

  return (
    <Flex vertical gap={token.marginXS} style={{ minWidth: 0 }}>
      <Text strong style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        {label}
      </Text>
      {children}
    </Flex>
  );
}

export function ThemePreferencesPanel({
  controller,
}: {
  controller: ReturnType<typeof useThemePreferencesController>;
}) {
  const { token } = theme.useToken();
  const { currentConfig, saveError } = controller;

  if (!currentConfig) {
    return null;
  }

  return (
    <Flex vertical gap={token.marginSM}>
      {saveError ? (
        <Alert
          type="error"
          showIcon
          title="Changes not saved"
          description={
            <Space wrap size={token.marginSM}>
              <Text>{saveError}</Text>
              <AppButton
                size="small"
                onClick={() => void controller.flushPendingChanges()}
              >
                Retry
              </AppButton>
              <AppButton
                size="small"
                onClick={controller.discardChanges}
                type="default"
              >
                Revert
              </AppButton>
            </Space>
          }
        />
      ) : null}

      <FormSection title="Appearance">
        <Row gutter={[token.marginLG, token.marginMD]}>
          {/* Density Picker */}
          <Col xs={24}>
            <PreferenceField label="Density">
              <Row gutter={[token.marginXS, token.marginXS]}>
                {DENSITY_LEVEL_OPTIONS.map((option) => {
                  const isSelected = currentConfig.density === option.value;
                  const labelDisplay = option.label === 'Normal' ? 'Standard' : option.label;
                  const IconComp =
                    option.value === 'compact'
                      ? BlockOutlined
                      : option.value === 'comfortable'
                      ? ExpandOutlined
                      : ColumnWidthOutlined;

                  return (
                    <Col xs={8} key={option.value}>
                      <Card
                        hoverable
                        size="small"
                        onClick={() =>
                          controller.updatePreference(
                            'density',
                            option.value as typeof currentConfig.density
                          )
                        }
                        style={{
                          textAlign: 'center',
                          cursor: 'pointer',
                          borderColor: isSelected ? token.colorPrimary : token.colorBorderSecondary,
                          backgroundColor: isSelected ? `${token.colorPrimary}0a` : token.colorBgContainer,
                          boxShadow: isSelected ? `0 0 0 1px ${token.colorPrimary}` : 'none',
                          transition: 'all 0.2s ease',
                          padding: `${token.paddingXS}px 0`,
                        }}
                        bodyStyle={{ padding: `${token.paddingXS}px` }}
                      >
                        <Flex vertical align="center" gap={token.marginXXS}>
                          <IconComp
                            style={{
                              fontSize: 18,
                              color: isSelected ? token.colorPrimary : token.colorTextSecondary,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: token.fontSizeSM,
                              fontWeight: isSelected ? 600 : 400,
                              color: isSelected ? token.colorPrimary : token.colorText,
                            }}
                          >
                            {labelDisplay}
                          </Text>
                        </Flex>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </PreferenceField>
          </Col>

          {/* Font Selector */}
          <Col xs={24} md={12}>
            <PreferenceField label="Font Family">
              <AppSelect
                options={FONT_FAMILY_OPTIONS.map((opt) => ({
                  ...opt,
                  label: <span style={{ fontFamily: opt.value }}>{opt.label}</span>,
                }))}
                value={currentConfig.fontFamily}
                onChange={(value) =>
                  controller.updatePreference(
                    'fontFamily',
                    value as typeof currentConfig.fontFamily
                  )
                }
              />
            </PreferenceField>
          </Col>

          {/* Primary Color Swatches */}
          <Col xs={24} md={12}>
            <PreferenceField label="Primary Color">
              <Flex gap={token.marginXS} wrap="wrap" align="center" style={{ paddingTop: token.marginXXS }}>
                {COLOR_OPTIONS.map((option) => {
                  const isSelected = currentConfig.primaryColor === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-label={option.label}
                      title={option.label}
                      onClick={() =>
                        controller.updatePreference(
                          'primaryColor',
                          option.value
                        )
                      }
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: isSelected
                          ? `2px solid ${token.colorTextHeading}`
                          : `2px solid transparent`,
                        backgroundColor: option.value,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#ffffff',
                        boxShadow: isSelected
                          ? `0 0 0 2px ${option.value}40, inset 0 0 0 1.5px #ffffff`
                          : '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {isSelected ? <CheckOutlined style={{ fontSize: 13, fontWeight: 'bold' }} /> : null}
                    </button>
                  );
                })}
              </Flex>
            </PreferenceField>
          </Col>
        </Row>
      </FormSection>
    </Flex>
  );
}
