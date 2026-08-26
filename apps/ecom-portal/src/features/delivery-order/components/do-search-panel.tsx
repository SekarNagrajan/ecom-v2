// Created by Sekar Nagarajan (2026-08-26 14:26)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, FormDatePicker } from "@solverminds/shared-ui";
import { Col, Row } from "antd";
import { DateTime } from "luxon";
import { useForm } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import type { DOSearchValues } from "../types/delivery-order.types";
import { doSearchSchema } from "../types/delivery-order.types";

interface DoSearchPanelProps {
  isSearching: boolean;
  onSearch: (values: DOSearchValues) => void;
}

const defaultValues: DOSearchValues = {
  fromDate: DateTime.now().minus({ days: 60 }).toISODate() ?? "",
  toDate: DateTime.now().toISODate() ?? "",
};

export function DoSearchPanel({ isSearching, onSearch }: DoSearchPanelProps) {
  const { control, handleSubmit } = useForm<DOSearchValues>({
    resolver: zodResolver(doSearchSchema),
    defaultValues,
  });

  return (
    <div className="do-search-panel">
      <div className="do-search-panel__body">
        <form
          onSubmit={handleSubmit(onSearch)}
          autoComplete="off"
          className="do-search-form"
        >
          <Row gutter={[16, 16]} align="bottom">
            <Col {...RESPONSIVE_COL.formThird}>
              <FormDatePicker
                control={control}
                name="fromDate"
                label="From Date"
                required
                size="large"
                valueFormat="calendar-date"
              />
            </Col>
            <Col {...RESPONSIVE_COL.formThird}>
              <FormDatePicker
                control={control}
                name="toDate"
                label="To Date"
                required
                size="large"
                valueFormat="calendar-date"
              />
            </Col>
            <Col {...RESPONSIVE_COL.formThird}>
              <div className="do-search-actions-field">
                <span className="form-field-label do-search-actions-field__spacer">
                  &nbsp;
                </span>
                <div className="do-search-actions">
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
            </Col>
          </Row>
        </form>
      </div>
    </div>
  );
}
