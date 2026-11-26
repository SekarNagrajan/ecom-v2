// Modified by Sekar Nagarajan (2026-11-12 12:40)
import { Spin } from "antd";

/**
 * Spinner-only loading state for Control Panel sections (agenct.md rule 20): centred, no tip
 * text, announced via role="status". Headers stay mounted around it.
 */
export function AdminLoadingCenter() {
  return (
    <div className="admin-loading-center" role="status" aria-label="Loading">
      <Spin size="medium" />
    </div>
  );
}
