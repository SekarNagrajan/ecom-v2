// Created by Sekar Nagarajan (2026-08-26 12:48)
import { AppButton, FormInput, FormSelect } from "@solverminds/shared-ui";
import { Col, Row } from "antd";
import type { UseFormReturn } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import type { VgmSearchValues } from "../types/vgm.types";
import { vgmReqLabel } from "../utils/vgm-form-labels";

interface VgmSearchPanelProps {
  form: UseFormReturn<VgmSearchValues>;
  isSearching: boolean;
  onSearch: (values: VgmSearchValues) => void;
}

export function VgmSearchPanel({
  form,
  isSearching,
  onSearch,
}: VgmSearchPanelProps) {
  return (
    <div className="vgm-search-panel">
      <div className="vgm-search-panel__body">
        <form
          onSubmit={form.handleSubmit(onSearch)}
          autoComplete="off"
          className="vgm-search-form"
        >
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} md={8} lg={7}>
              <FormSelect
                control={form.control}
                name="submissionBy"
                label={vgmReqLabel("Submission By")}
                size="large"
                options={[
                  { label: "Booking No.", value: "bookno" },
                  { label: "B/L No.", value: "blno" },
                ]}
              />
            </Col>
            <Col xs={24} md={10} lg={11}>
              <FormInput
                control={form.control}
                name="referenceNo"
                label={vgmReqLabel("Reference Number")}
                placeholder="e.g. BKG-123456"
                size="large"
              />
            </Col>
            <Col xs={24} md={6} lg={6}>
              <div className="vgm-search-actions-field">
                <span className="form-field-label vgm-search-actions-label">
                  &nbsp;
                </span>
                <div className="vgm-search-actions">
                  <AppButton
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<AppIcon icon={Icons.search} size={16} />}
                    loading={isSearching}
                  >
                    Search
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
