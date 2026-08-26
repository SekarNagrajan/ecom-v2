// Modified by Sekar Nagarajan (2026-08-25 19:25)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Badge, Card, Space, Typography } from "antd";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../constants/module-titles";
import { ContractSurchargeModal } from "./components/ContractSurchargeModal";
import { RateCardList } from "./components/RateCardList";
import { RateDataView } from "./components/RateDataView";
import { RateSearchFilter } from "./components/RateSearchFilter";
import { RatesModuleStyles } from "./components/rates-module-styles";
import { useRatesController } from "./hooks/useRatesController";

const { Text } = Typography;

export function RatesRoute() {
  const toast = useToast();
  const {
    viewMode,
    setViewMode,
    searchMode,
    setSearchMode,
    cardRates,
    isLoading,
    handleSearch,
    handleBookNow,
    handleViewSurcharges,
    handleShareRate,
    selectedContract,
    isSurchargeModalOpen,
    handleCloseSurchargeModal,
  } = useRatesController();

  return (
    <FeaturePageShell>
      <RatesModuleStyles />
      <Card className="feature-page-card" bordered={false}>
        <ModuleScreenHeader
          icon={Icons.dollarSign}
          title={MODULE_TITLES.rates}
          subtitle="Search published line tariffs, view itemized surcharge breakdowns, manage Service Contracts, and request spot rate quotes."
          extra={
            <Space align="center" size={12} wrap className="custom-scroll">
              <AppButton
                icon={
                  <AppIcon icon={Icons.download} size={16} tone="download" />
                }
                onClick={() =>
                  toast.success("Exporting rate search results to Excel...")
                }
              >
                Export Excel
              </AppButton>
              <AppButton
                icon={<AppIcon icon={Icons.mail} size={16} tone="navigate" />}
                onClick={() =>
                  toast.info("Opening freight rate quote email share dialog...")
                }
              >
                Share via Mail
              </AppButton>
            </Space>
          }
        />

        <RateSearchFilter onSearch={handleSearch} isLoading={isLoading} />

        <div className="rates-results-toolbar feature-toolbar">
          <Space align="center" size={10} wrap>
            <AppIcon icon={Icons.dollarSign} size={18} />
            <Text strong className="rates-results-toolbar__title">
              Published Freight Rates & Contracts
            </Text>
            <Badge count={cardRates.length} />
          </Space>

          {/* <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as "CARD" | "DATAVIEW")}
            options={[
              {
                label: "Card List",
                value: "CARD",
                icon: <AppIcon icon={Icons.layoutGrid} size={16} />,
              },
              {
                label: "Data Grid",
                value: "DATAVIEW",
                icon: <AppIcon icon={Icons.list} size={16} />,
              },
            ]}
          /> */}
        </div>

        {viewMode === "CARD" ? (
          <RateCardList
            rates={cardRates}
            isLoading={isLoading}
            onBookNow={handleBookNow}
            onViewSurcharges={handleViewSurcharges}
            onShareRate={handleShareRate}
          />
        ) : (
          <div className="responsive-table-wrap custom-scroll">
            <RateDataView
              activeMode={searchMode}
              onModeChange={setSearchMode}
            />
          </div>
        )}

        <ContractSurchargeModal
          contract={selectedContract}
          open={isSurchargeModalOpen}
          onClose={handleCloseSurchargeModal}
        />
      </Card>
    </FeaturePageShell>
  );
}
