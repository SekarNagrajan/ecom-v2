import { CloseOutlined } from '@ant-design/icons';
import { Divider, Button } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';

interface SelectedItemsFooterProps {
  selectedOptions: DefaultOptionType[];
  onDeselect: (value: string | number) => void;
  labelKey?: string;
  valueKey?: string;
}

export function SelectedItemsFooter({
  selectedOptions,
  onDeselect,
  labelKey = 'label',
  valueKey = 'value',
}: SelectedItemsFooterProps) {
  if (selectedOptions.length === 0) return null;

  return (
    <div onMouseDown={(e) => e.preventDefault()}>
      <Divider style={{ margin: 0 }}>
        <span className="text-xs text-gray-400 font-normal">Selected</span>
      </Divider>
      <div className="max-h-48 overflow-y-auto py-1">
        {selectedOptions.map((option) => {
          const val = option[valueKey] ?? option.value;
          const label = option[labelKey] ?? option.label;

          return (
            <div
              key={val}
              className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm truncate pr-2 flex-1">
                {label ?? val}
              </span>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined className="text-xs" />}
                className="shrink-0 text-gray-400 hover:text-gray-700 hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeselect(val);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
