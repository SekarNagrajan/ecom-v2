// Created by Sekar Nagarajan (2026-08-26 14:57)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, FormDatePicker } from "@solverminds/shared-ui";
import { Typography } from "antd";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { CroSearchValues } from "../types/cro.types";
import { createCroSearchSchema } from "../types/cro.types";

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
  const { t } = useTranslation("container-release-order");
  const schema = useMemo(() => createCroSearchSchema(t), [t]);
  const { control, handleSubmit } = useForm<CroSearchValues>({
    // preprocess widens input type; assert for RHF
    resolver: zodResolver(schema) as Resolver<CroSearchValues>,
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
              <CroFieldLabel>{t("search.fromDate")}</CroFieldLabel>
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
              <CroFieldLabel>{t("search.toDate")}</CroFieldLabel>
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
                {t("search.show")}
              </AppButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
