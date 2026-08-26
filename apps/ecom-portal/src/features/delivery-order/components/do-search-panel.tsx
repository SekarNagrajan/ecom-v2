// Modified by Sekar Nagarajan (2026-08-26 14:42)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, FormDatePicker } from "@solverminds/shared-ui";
import { Typography } from "antd";
import { DateTime } from "luxon";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import type { DOSearchValues } from "../types/delivery-order.types";
import { doSearchSchema } from "../types/delivery-order.types";

const { Text } = Typography;

interface DoSearchPanelProps {
  isSearching: boolean;
  onSearch: (values: DOSearchValues) => void;
}

const defaultValues: DOSearchValues = {
  fromDate: DateTime.now().minus({ days: 60 }).toISODate() ?? "",
  toDate: DateTime.now().toISODate() ?? "",
};

function DoFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="form-field-label">
      {children} <Text type="danger">*</Text>
    </span>
  );
}

export function DoSearchPanel({ isSearching, onSearch }: DoSearchPanelProps) {
  const { control, handleSubmit } = useForm<DOSearchValues>({
    // preprocess widens input type; assert for RHF
    resolver: zodResolver(doSearchSchema) as Resolver<DOSearchValues>,
    defaultValues,
    mode: "onSubmit",
  });

  return (
    <div className="do-search-panel">
      <div className="do-search-panel__body">
        <form
          onSubmit={handleSubmit(onSearch)}
          autoComplete="off"
          className="do-search-form"
        >
          <div className="do-search-form-row">
            <div className="do-search-field">
              <DoFieldLabel>From Date</DoFieldLabel>
              <div className="do-search-field__control">
                <FormDatePicker
                  control={control}
                  name="fromDate"
                  size="large"
                  valueFormat="calendar-date"
                  formItemProps={{
                    className: "do-search-form-item",
                    colon: false,
                    layout: "vertical",
                  }}
                />
              </div>
            </div>

            <div className="do-search-field">
              <DoFieldLabel>To Date</DoFieldLabel>
              <div className="do-search-field__control">
                <FormDatePicker
                  control={control}
                  name="toDate"
                  size="large"
                  valueFormat="calendar-date"
                  formItemProps={{
                    className: "do-search-form-item",
                    colon: false,
                    layout: "vertical",
                  }}
                />
              </div>
            </div>

            <div className="do-search-actions">
              <span className="form-field-label do-search-actions__spacer">
                &nbsp;
              </span>
              <AppButton
                type="primary"
                htmlType="submit"
                size="large"
                icon={<AppIcon icon={Icons.search} size={16} />}
                loading={isSearching}
              >
                Show
              </AppButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
