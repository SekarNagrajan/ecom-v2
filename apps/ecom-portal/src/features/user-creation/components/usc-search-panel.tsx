// Modified by Sekar Nagarajan (2026-08-26 15:13)
import { Input } from "antd";

import { AppIcon, Icons } from "../../../components/icons";

interface UscSearchPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export function UscSearchPanel({ value, onChange }: UscSearchPanelProps) {
  return (
    <div className="usc-search-panel">
      <div className="usc-search-panel__body">
        <span className="form-field-label">Search</span>
        <Input
          size="large"
          allowClear
          prefix={<AppIcon icon={Icons.search} size={16} />}
          placeholder="Search by login name, name, or email..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
