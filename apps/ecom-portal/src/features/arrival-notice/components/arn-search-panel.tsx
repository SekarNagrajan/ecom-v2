// Modified by Sekar Nagarajan (2026-09-29 12:35)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, FormDatePicker } from "@solverminds/shared-ui";
import { Typography } from "antd";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { ArnSearchValues } from "../types/arrival-notice.types";
import { createArnSearchSchema } from "../types/arrival-notice.types";

const { Text } = Typography;

interface ArnSearchPanelProps {
  isSearching: boolean;
  onSearch: (values: ArnSearchValues) => void;
}

const defaultValues: ArnSearchValues = {
  fromDate: DateTime.now().minus({ days: 60 }).toISODate() ?? "",
  toDate: DateTime.now().toISODate() ?? "",
};

function ArnFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="form-field-label">
      {children} <Text type="danger">*</Text>
    </span>
  );
}

export function ArnSearchPanel({ isSearching, onSearch }: ArnSearchPanelProps) {
  const { t } = useTranslation("arrival-notice");
  const schema = useMemo(() => createArnSearchSchema(t), [t]);
  const { control, handleSubmit } = useForm<ArnSearchValues>({
    // preprocess widens input type; assert for RHF
    resolver: zodResolver(schema) as Resolver<ArnSearchValues>,
    defaultValues,
    mode: "onSubmit",
  });

  return (
    <div className="arn-search-panel">
      <div className="arn-search-panel__body">
        <form
          onSubmit={handleSubmit(onSearch)}
          autoComplete="off"
          className="arn-search-form"
        >
          <div className="arn-search-form-row">
            <div className="arn-search-field">
              <ArnFieldLabel>{t("search.fromDate")}</ArnFieldLabel>
              <div className="arn-search-field__control">
                <FormDatePicker
                  control={control}
                  name="fromDate"
                  size="large"
                  valueFormat="calendar-date"
                  formItemProps={{
                    className: "arn-search-form-item",
                    colon: false,
                    layout: "vertical",
                  }}
                />
              </div>
            </div>

            <div className="arn-search-field">
              <ArnFieldLabel>{t("search.toDate")}</ArnFieldLabel>
              <div className="arn-search-field__control">
                <FormDatePicker
                  control={control}
                  name="toDate"
                  size="large"
                  valueFormat="calendar-date"
                  formItemProps={{
                    className: "arn-search-form-item",
                    colon: false,
                    layout: "vertical",
                  }}
                />
              </div>
            </div>

            <div className="arn-search-actions">
              <span className="form-field-label arn-search-actions__spacer">
                &nbsp;
              </span>
              <AppButton
                type="primary"
                htmlType="submit"
                size="large"
                icon={<AppIcon icon={Icons.search} size={16} />}
                loading={isSearching}
              >
                {t("search.show")}
              </AppButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
