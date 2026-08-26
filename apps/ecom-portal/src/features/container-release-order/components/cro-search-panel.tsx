// Created by Sekar Nagarajan (2026-08-26 14:57)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, FormDatePicker } from "@solverminds/shared-ui";
import { Typography } from "antd";
import { DateTime } from "luxon";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import type { CroSearchValues } from "../types/cro.types";
import { croSearchSchema } from "../types/cro.types";

const { Text } = Typography;

interface CroSearchPanelProps {
  isSearching: boolean;
  onSearch: (values: CroSearchValues) => void;
}

const defaultValues: CroSearchValues = {
  fromDate: DateTime.now().minus({ days: 60 }).toISODate() ?? "",
  toDate: DateTime.now().toISODate() ?? "",
};

function CroFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="form-field-label">
      {children} <Text type="danger">*</Text>
    </span>
  );
}

export function CroSearchPanel({ isSearching, onSearch }: CroSearchPanelProps) {
  const { control, handleSubmit } = useForm<CroSearchValues>({
    // preprocess widens input type; assert for RHF
    resolver: zodResolver(croSearchSchema) as Resolver<CroSearchValues>,
    defaultValues,
    mode: "onSubmit",
  });

  return (
    <div className="cro-search-panel">
      <div className="cro-search-panel__body">
        <form
          onSubmit={handleSubmit(onSearch)}
          autoComplete="off"
          className="cro-search-form"
        >
          <div className="cro-search-form-row">
            <div className="cro-search-field">
              <CroFieldLabel>From Date</CroFieldLabel>
              <div className="cro-search-field__control">
                <FormDatePicker
                  control={control}
                  name="fromDate"
                  size="large"
                  valueFormat="calendar-date"
                  formItemProps={{
                    className: "cro-search-form-item",
                    colon: false,
                    layout: "vertical",
                  }}
                />
              </div>
            </div>

            <div className="cro-search-field">
              <CroFieldLabel>To Date</CroFieldLabel>
              <div className="cro-search-field__control">
                <FormDatePicker
                  control={control}
                  name="toDate"
                  size="large"
                  valueFormat="calendar-date"
                  formItemProps={{
                    className: "cro-search-form-item",
                    colon: false,
                    layout: "vertical",
                  }}
                />
              </div>
            </div>

            <div className="cro-search-actions">
              <span className="form-field-label cro-search-actions__spacer">
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
