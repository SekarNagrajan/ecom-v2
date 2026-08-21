import { Checkbox, Divider, Button, theme } from 'antd';

interface SelectAllHeaderProps {
  checked: boolean;
  indeterminate?: boolean;
  onToggle: (checked: boolean) => void;
  label: string;
}

export function SelectAllHeader({
  checked,
  indeterminate = false,
  onToggle,
  label,
}: SelectAllHeaderProps) {
  const { token } = theme.useToken();

  return (
    <>
      <Button
        type="text"
        block
        style={{
          padding: `${token.paddingXS}px ${token.paddingSM}px`,
          height: 'auto',
          borderRadius: 0,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          border: 'none',
        }}
        // Prevent the search input from losing focus when clicking the header
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onToggle(!checked)}
      >
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          // Pointer events none ensures the button handles the click for the whole row
          style={{ pointerEvents: 'none' }}
        >
          <span style={{ color: token.colorText, fontSize: token.fontSize }}>
            {label}
          </span>
        </Checkbox>
      </Button>
      <Divider style={{ margin: 0 }} />
    </>
  );
}
