// Modified by Sekar Nagarajan (2026-09-11 17:28)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Space, Spin, Typography } from "antd";

import { AppIcon, Icons } from "../../components/icons";
import { NavRatesIcon } from "../../components/icons/nav-svg-icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../constants/module-titles";
import { ContractSurchargeModal } from "./components/ContractSurchargeModal";
import { QuoteRequestDrawer } from "./components/QuoteRequestDrawer";
import { RateCardList } from "./components/RateCardList";
import { RateDataView } from "./components/RateDataView";
import { RateSearchFilter } from "./components/RateSearchFilter";
import { RatesModuleStyles } from "./components/rates-module-styles";
import { ShareRateMailDrawer } from "./components/ShareRateMailDrawer";
import { useRatesController } from "./hooks/useRatesController";

const { Text } = Typography;

export function RatesRoute() {
  const toast = useToast();
  const {
    viewMode,
    setViewMode,
    searchMode,
    setSearchMode,
    resultsTitle,
    cardRates,
    hasSearched,
    isLoading,
    handleSearch,
    handleReset,
    handleSearchModeChange,
    handleBookNow,
    handleViewSurcharges,
    handleShareRate,
    handleShareResultsViaMail,
    handleRequestQuote,
    selectedContract,
    isSurchargeModalOpen,
    handleCloseSurchargeModal,
    isQuoteDrawerOpen,
    quoteDefaults,
    handleCloseQuoteDrawer,
    isShareMailOpen,
    shareMailRates,
    handleCloseShareMail,
  } = useRatesController();

  return (
    <FeaturePageShell>
      <RatesModuleStyles />
      <Card className="feature-page-card" bordered={false}>
        <ModuleScreenHeader
          icon={NavRatesIcon}
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
                onClick={handleShareResultsViaMail}
              >
                Share via Mail
              </AppButton>
            </Space>
          }
        />

        <RateSearchFilter
          onSearch={handleSearch}
          onReset={handleReset}
          onSearchModeChange={handleSearchModeChange}
          isLoading={isLoading}
          onRequestQuote={handleRequestQuote}
        />

        <div className="rates-results-bar">
          <Space align="center" size={10} wrap>
            <AppIcon icon={Icons.dollarSign} size={18} />
            <Text className="rates-results-bar__title">{resultsTitle}</Text>
            <span className="rates-results-bar__count">
              {hasSearched ? cardRates.length : 0}
            </span>
            {isLoading ? <Spin size="small" /> : null}
          </Space>
        </div>

        {viewMode === "CARD" ? (
          <RateCardList
            rates={cardRates}
            isLoading={isLoading}
            hasSearched={hasSearched}
            searchMode={searchMode}
            onBookNow={handleBookNow}
            onViewSurcharges={handleViewSurcharges}
            onShareRate={handleShareRate}
            onRequestQuote={handleRequestQuote}
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

        <QuoteRequestDrawer
          open={isQuoteDrawerOpen}
          onClose={handleCloseQuoteDrawer}
          initialValues={quoteDefaults}
        />

        <ShareRateMailDrawer
          open={isShareMailOpen}
          onClose={handleCloseShareMail}
          rates={shareMailRates}
        />
      </Card>
    </FeaturePageShell>
  );
}
