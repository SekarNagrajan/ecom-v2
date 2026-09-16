// Modified by Sekar Nagarajan (2026-09-15 15:30)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Space, Spin, Typography } from "antd";

import { AppIcon, Icons } from "../../components/icons";
import { NavRatesIcon } from "../../components/icons/nav-svg-icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleCardViewPanel } from "../../components/shared/module-card-view-panel";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { ModuleViewModeTabs } from "../../components/shared/module-view-mode-tabs";
import { MODULE_TITLES } from "../../constants/module-titles";
import { ContractSurchargeModal } from "./components/ContractSurchargeModal";
import { QuoteRequestDrawer } from "./components/QuoteRequestDrawer";
import { RateCardList } from "./components/RateCardList";
import { RateList } from "./components/RateList";
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
          recordCount={hasSearched ? cardRates.length : undefined}
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
                disabled={!hasSearched || cardRates.length === 0}
              >
                Export Excel
              </AppButton>
              <AppButton
                icon={<AppIcon icon={Icons.mail} size={16} tone="navigate" />}
                onClick={handleShareResultsViaMail}
                disabled={!hasSearched || cardRates.length === 0}
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
            {isLoading ? (
              <span
                className="module-loading-center"
                role="status"
                aria-label="Loading"
              >
                <Spin size="small" />
              </span>
            ) : null}
          </Space>
          <ModuleViewModeTabs value={viewMode} onChange={setViewMode} />
        </div>

        {isLoading ? (
          <div
            className="rates-empty module-loading-center"
            role="status"
            aria-label="Loading"
          >
            <Spin size="medium" />
          </div>
        ) : viewMode === "list" ? (
          <RateList
            rates={hasSearched ? cardRates : []}
            isLoading={false}
            hasSearched={hasSearched}
            onBookNow={handleBookNow}
            onViewSurcharges={handleViewSurcharges}
            onShareRate={handleShareRate}
          />
        ) : (
          <ModuleCardViewPanel active className="rates-card-view-panel">
            <RateCardList
              rates={cardRates}
              isLoading={false}
              hasSearched={hasSearched}
              searchMode={searchMode}
              onBookNow={handleBookNow}
              onViewSurcharges={handleViewSurcharges}
              onShareRate={handleShareRate}
              onRequestQuote={handleRequestQuote}
            />
          </ModuleCardViewPanel>
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
