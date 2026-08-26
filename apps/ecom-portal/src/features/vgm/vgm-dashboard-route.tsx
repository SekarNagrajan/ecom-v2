// Modified by Sekar Nagarajan (2026-08-26 12:53)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Alert, Card, Empty } from "antd";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../constants/module-titles";
import {
  useVgmSearchQuery,
  type VgmSearchParams,
} from "./api/vgm.queries";
import { VgmDeclarationForm } from "./components/vgm-declaration-form";
import { VgmLoadingCenter } from "./components/vgm-loading-center";
import { VgmModuleStyles } from "./components/vgm-module-styles";
import { VgmSearchPanel } from "./components/vgm-search-panel";
import type { VgmSearchValues } from "./types/vgm.types";
import { vgmSearchSchema } from "./types/vgm.types";
import { extractVgmErrorMessage } from "./utils/vgm.utils";

export function VgmDashboardRoute() {
  const [activeReference, setActiveReference] =
    useState<VgmSearchParams>(null);

  const searchForm = useForm<VgmSearchValues>({
    resolver: zodResolver(vgmSearchSchema),
    defaultValues: { submissionBy: "bookno", referenceNo: "" },
  });

  const {
    data: declaration,
    isLoading: isSearching,
    isFetching,
    isError,
    error,
  } = useVgmSearchQuery(activeReference);

  const handleSearch = (values: VgmSearchValues) => {
    setActiveReference({
      type: values.submissionBy,
      referenceNo: values.referenceNo.trim(),
    });
  };

  const handleReset = () => {
    setActiveReference(null);
    searchForm.reset({ submissionBy: "bookno", referenceNo: "" });
  };

  const showLoading =
    Boolean(activeReference) && (isSearching || isFetching) && !declaration;
  const showIdle = !activeReference && !showLoading;
  const showError = Boolean(activeReference) && isError && !showLoading;
  const showForm = Boolean(declaration) && !showLoading && !showError;

  return (
    <FeaturePageShell>
      <VgmModuleStyles />
      <Card className="feature-page-card vgm-page-card" bordered={false}>
        <div className="vgm-page-header">
          <ModuleScreenHeader
            icon={Icons.shieldCheck}
            title={MODULE_TITLES.vgm}
            subtitle="Search by booking or B/L number, review the voyage route, and submit verified gross mass for each container."
            marginBottom={0}
          />
        </div>

        <VgmSearchPanel
          form={searchForm}
          isSearching={isSearching || isFetching}
          onSearch={handleSearch}
        />

        {showLoading ? <VgmLoadingCenter fill /> : null}

        {showIdle ? (
          <div className="vgm-idle">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Search a booking or B/L reference to load VGM declaration details."
            />
          </div>
        ) : null}

        {showError ? (
          <div className="vgm-idle">
            <Alert
              type="error"
              showIcon
              message="Search failed"
              description={extractVgmErrorMessage(
                error,
                "Invalid Booking or BL Number.",
              )}
              action={
                <AppButton size="small" onClick={handleReset}>
                  Clear
                </AppButton>
              }
            />
          </div>
        ) : null}

        {showForm && declaration && activeReference ? (
          <VgmDeclarationForm
            key={`${activeReference.type}:${activeReference.referenceNo}`}
            data={declaration}
            referenceType={activeReference.type}
            referenceNo={activeReference.referenceNo}
            onCancel={handleReset}
            onSubmitted={handleReset}
          />
        ) : null}
      </Card>
    </FeaturePageShell>
  );
}
