import { EditOutlined } from '@ant-design/icons';
import { Flex, theme, Typography } from 'antd';
import { type ComponentType, type ReactNode, useState } from 'react';
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from 'react-hook-form';

const { Text } = Typography;

export interface EditableFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  componentProps?: Record<string, unknown>;
  renderDisplay?: (value: unknown) => ReactNode;
  emptyText?: string;
}

export function EditableField<T extends FieldValues>({
  name,
  control,
  label,
  component: Component,
  componentProps = {},
  renderDisplay,
  emptyText = 'Click to edit',
}: EditableFieldProps<T>) {
  const { token } = theme.useToken();
  const [isEditing, setIsEditing] = useState(false);
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const handleBlur = () => {
    setIsEditing(false);
    onBlur();
  };

  const displayValue = renderDisplay ? renderDisplay(value) : value;
  const showPlaceholder = value === null || value === undefined || value === '';

  if (isEditing) {
    return (
      <Flex vertical gap={token.marginXXS}>
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {label}
        </Text>
        <Component
          {...componentProps}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          ref={ref}
          autoFocus
          status={error ? 'error' : undefined}
        />
        {error && <Text type="danger">{error.message}</Text>}
      </Flex>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        cursor: 'pointer',
        padding: `${token.paddingXXS}px ${token.paddingXS}px`,
        marginLeft: -token.paddingXS,
        borderRadius: token.borderRadiusSM,
        transition: 'background-color 0.2s',
      }}
      className="editable-field-display"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = token.colorBgTextHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Flex vertical gap={token.marginXXS}>
        <Flex justify="space-between" align="center">
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {label}
          </Text>
          <EditOutlined
            style={{
              fontSize: 12,
              color: token.colorTextTertiary,
              opacity: 0.5,
            }}
          />
        </Flex>
        <div style={{ minHeight: 22 }}>
          {showPlaceholder ? (
            <Text
              type="secondary"
              style={{ fontStyle: 'italic', opacity: 0.7 }}
            >
              {emptyText}
            </Text>
          ) : (
            <Text>{displayValue}</Text>
          )}
        </div>
      </Flex>
    </div>
  );
}
