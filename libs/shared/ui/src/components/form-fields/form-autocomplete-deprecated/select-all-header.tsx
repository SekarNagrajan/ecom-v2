import { Checkbox, Divider } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

interface SelectAllHeaderProps {
  checked: boolean;
  indeterminate?: boolean;
  onSelectAll: (e: CheckboxChangeEvent) => void;
  isSearching?: boolean;
  resultCount?: number;
}

export function SelectAllHeader({
  checked,
  indeterminate = false,
  onSelectAll,
  isSearching = false,
  resultCount = 0,
}: SelectAllHeaderProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Prevent the row click from propagating
    e.preventDefault();
    e.stopPropagation();

    // Simulate checkbox change by creating a synthetic event
    const syntheticEvent = {
      target: {
        checked: !checked,
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      stopPropagation: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      preventDefault: () => {},
    } as CheckboxChangeEvent;

    onSelectAll(syntheticEvent);
  };

  const labelText = isSearching
    ? checked
      ? `Deselect All Results${resultCount > 0 ? ` (${resultCount})` : ''}`
      : `Select All Results${resultCount > 0 ? ` (${resultCount})` : ''}`
    : 'Clear All';

  return (
    <>
      <div
        className="px-2 py-2 cursor-pointer hover:bg-gray-50"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={handleClick}
      >
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onChange={(e) => {
            e.stopPropagation();
            onSelectAll(e);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="w-full pointer-events-none"
        >
          {labelText}
        </Checkbox>
      </div>
      <Divider style={{ margin: 0 }} />
    </>
  );
}
