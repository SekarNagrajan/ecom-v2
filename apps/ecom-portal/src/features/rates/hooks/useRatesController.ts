// Modified by Sekar Nagarajan (2026-08-28 15:07)
// Controller hook for Rates — mode-aware cards + surcharge rollup (JSP parity)

import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  useContractsQuery,
  useQuotesQuery,
  useSurchargesQuery,
  useTariffsQuery,
} from "../api/rates.queries";
import type { CombinedRateItem } from "../components/RateCardList";
import type {
  RateSearchMode,
  RateSearchParams,
} from "../components/RateSearchFilter";
import type { ContractDTO, CreateQuoteInput } from "../types/rates.types";

const RESULTS_TITLE: Record<RateSearchMode, string> = {
  PUBLISHED_TARIFF: "Published Freight Rates",
  SERVICE_CONTRACTS: "Service Contracts",
  SURCHARGES: "Surcharges & Accessorials",
  SPOT_QUOTES: "Spot Rate Quotes",
};

export function useRatesController() {
  const toast = useToast();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"CARD" | "DATAVIEW">("CARD");
  const [searchParams, setSearchParams] = useState<RateSearchParams>({
    searchMode: "PUBLISHED_TARIFF",
    polCode: "USNYC",
    podCode: "SGSIN",
    eqpType: "40' High Cube Dry",
    commodity: "GEN-CGO",
  });
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
  const [quoteDefaults, setQuoteDefaults] = useState<
    Partial<CreateQuoteInput> | undefined
  >(undefined);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pol = urlParams.get("pol") || urlParams.get("ratepol");
    const pod = urlParams.get("pod") || urlParams.get("ratepod");
    const eqp = urlParams.get("eqpType") || urlParams.get("rateseqp");

    if (pol || pod || eqp) {
      setSearchParams((prev) => ({
        ...prev,
        polCode: pol || prev.polCode,
        podCode: pod || prev.podCode,
        eqpType: eqp || prev.eqpType,
      }));
    }
  }, []);

  const [selectedContract, setSelectedContract] = useState<ContractDTO | null>(
    null,
  );
  const [isSurchargeModalOpen, setIsSurchargeModalOpen] = useState(false);

  const mode = searchParams.searchMode;
  const commodityFilter =
    searchParams.commodity && searchParams.commodity !== "ALL"
      ? searchParams.commodity
      : undefined;
  const eqpFilter =
    searchParams.eqpType && searchParams.eqpType !== "ALL"
      ? searchParams.eqpType
      : undefined;

  const { data: tariffs = [], isLoading: isTariffsLoading } = useTariffsQuery({
    loadPort: searchParams.polCode,
    dischPort: searchParams.podCode,
    eqpType: eqpFilter,
    commodity: commodityFilter,
  });

  const { data: contracts = [], isLoading: isContractsLoading } =
    useContractsQuery({
      pol: searchParams.polCode,
      pod: searchParams.podCode,
    });

  const { data: surcharges = [], isLoading: isSurchargesLoading } =
    useSurchargesQuery({
      pol: searchParams.polCode,
      pod: searchParams.podCode,
      eqpType: eqpFilter,
    });

  const { data: quotes = [], isLoading: isQuotesLoading } = useQuotesQuery();

  const isLoading =
    isTariffsLoading ||
    isContractsLoading ||
    (mode === "SURCHARGES" && isSurchargesLoading) ||
    (mode === "SPOT_QUOTES" && isQuotesLoading);

  const surchargeRollup = surcharges.reduce((sum, s) => sum + s.amount, 0);
  const hasNorSurcharge = surcharges.some((s) => s.isNor);

  const contractCards: CombinedRateItem[] = contracts
    .filter((ctr) => {
      if (commodityFilter && ctr.commodity !== commodityFilter) return false;
      if (eqpFilter && ctr.eqpType !== eqpFilter) return false;
      return true;
    })
    .map((ctr, idx) => ({
      id: ctr.id,
      type: "CONTRACT" as const,
      title: ctr.customerName,
      code: ctr.contractNo,
      originPort: ctr.originPort,
      originPortName: ctr.originPortName,
      deliveryPort: ctr.deliveryPort,
      deliveryPortName: ctr.deliveryPortName,
      eqpType: ctr.eqpType,
      commodity: ctr.commodity,
      commodityName: ctr.commodityName,
      currency: ctr.currency,
      baseAmount: ctr.oceanFreight,
      surchargeAmount: ctr.subjectToChargesAmount,
      totalEstimatedAmount: ctr.oceanFreight + ctr.subjectToChargesAmount,
      effectiveFrom: ctr.effectiveFrom,
      effectiveTo: ctr.effectiveTo,
      isRecommended: idx === 0,
      surcharges: ctr.surcharges,
      soc: ctr.soc,
      nor: ctr.nor ?? ctr.surcharges?.some((s) => s.isNor),
      carrTerms: ctr.carrTerms,
      transService: ctr.transService,
    }));

  const tariffCards: CombinedRateItem[] = tariffs.map((trf, idx) => ({
    id: trf.id,
    type: "TARIFF" as const,
    title: "Published Freight Tariff",
    code: `TRF-${trf.loadPort}-${trf.dischPort}`,
    originPort: trf.loadPort,
    originPortName: trf.loadPortName,
    deliveryPort: trf.dischPort,
    deliveryPortName: trf.dischPortName,
    eqpType: trf.eqpType,
    commodity: trf.commodityCode,
    commodityName: trf.commodityName,
    currency: trf.currency,
    baseAmount: trf.tariffAmount,
    surchargeAmount: surchargeRollup,
    totalEstimatedAmount: trf.tariffAmount + surchargeRollup,
    effectiveFrom: trf.effectiveFrom,
    effectiveTo: trf.effectiveTo,
    isRecommended: idx === 0 && contractCards.length === 0,
    surcharges,
    soc: trf.soc ?? "No",
    nor: trf.nor ?? hasNorSurcharge,
    transService: trf.transService,
  }));

  const surchargeCards: CombinedRateItem[] = surcharges.map((sur) => ({
    id: sur.id,
    type: "SURCHARGE" as const,
    title: sur.chargeName,
    code: sur.chargeCode,
    originPort: sur.origin || searchParams.polCode || "",
    originPortName: sur.loadRegion || sur.origin || "",
    deliveryPort: sur.delivery || searchParams.podCode || "",
    deliveryPortName: sur.dischargeRegion || sur.delivery || "",
    eqpType: sur.eqpType,
    commodity: "",
    commodityName: sur.isNor ? "NOR applicable" : "Accessorial",
    currency: sur.currency,
    baseAmount: sur.amount,
    surchargeAmount: 0,
    totalEstimatedAmount: sur.amount,
    effectiveFrom: sur.effectiveFrom,
    effectiveTo: sur.effectiveTo,
    nor: sur.isNor,
  }));

  const quoteCards: CombinedRateItem[] = quotes
    .filter((q) => {
      if (
        searchParams.polCode &&
        q.originPort &&
        q.originPort !== searchParams.polCode
      ) {
        return false;
      }
      if (
        searchParams.podCode &&
        q.deliveryPort &&
        q.deliveryPort !== searchParams.podCode
      ) {
        return false;
      }
      return true;
    })
    .map((q) => ({
      id: q.id,
      type: "QUOTE" as const,
      title: q.customerName,
      code: q.quoteNo,
      originPort: q.originPort,
      originPortName: q.originPortName,
      deliveryPort: q.deliveryPort,
      deliveryPortName: q.deliveryPortName,
      eqpType: q.eqpType,
      commodity: q.commodity,
      commodityName: q.commodity,
      currency: "USD",
      baseAmount: q.quotedAmountUsd,
      surchargeAmount: 0,
      totalEstimatedAmount: q.quotedAmountUsd,
      effectiveFrom: q.validFrom,
      effectiveTo: q.validTo,
      quoteStatus: q.status,
    }));

  let cardRates: CombinedRateItem[] = [];
  switch (mode) {
    case "SERVICE_CONTRACTS":
      cardRates = contractCards;
      break;
    case "SURCHARGES":
      cardRates = surchargeCards;
      break;
    case "SPOT_QUOTES":
      cardRates = quoteCards;
      break;
    case "PUBLISHED_TARIFF":
    default:
      cardRates = tariffCards;
      break;
  }

  const openQuoteDrawer = (defaults?: Partial<CreateQuoteInput>) => {
    setQuoteDefaults({
      originPort: defaults?.originPort ?? searchParams.polCode,
      deliveryPort: defaults?.deliveryPort ?? searchParams.podCode,
      eqpType: defaults?.eqpType ?? searchParams.eqpType,
      commodity: defaults?.commodity ?? searchParams.commodity,
      ...defaults,
    });
    setIsQuoteDrawerOpen(true);
  };

  const handleSearch = (params: RateSearchParams) => {
    setSearchParams(params);
    if (params.searchMode === "SPOT_QUOTES" && viewMode === "CARD") {
      toast.info("Showing spot quotes for this lane…");
    } else {
      toast.info(
        `Searching ${RESULTS_TITLE[params.searchMode]} for ${params.polCode || "All"} → ${params.podCode || "All"}...`,
      );
    }
  };

  const handleBookNow = (rate: CombinedRateItem) => {
    toast.success(
      `Selected rate ${rate.code} (${rate.currency} $${rate.totalEstimatedAmount.toFixed(2)}). Proceeding to Schedules & Booking...`,
    );
    navigate({ to: "/schedules" as never });
  };

  const handleViewSurcharges = (rate: CombinedRateItem) => {
    const dummyContract: ContractDTO = {
      id: rate.id,
      contractNo: rate.code,
      customerCode: "CUST-APEX",
      customerName: rate.title,
      originPort: rate.originPort,
      originPortName: rate.originPortName,
      deliveryPort: rate.deliveryPort,
      deliveryPortName: rate.deliveryPortName,
      rateNo: "RAT-9901-A",
      eqpType: rate.eqpType,
      commodity: rate.commodity,
      commodityName: rate.commodityName,
      oceanFreight: rate.baseAmount,
      currency: rate.currency,
      subjectToChargesAmount: rate.surchargeAmount,
      soc: rate.soc ?? "No",
      carrTerms: rate.carrTerms ?? "CY / CY",
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo,
      surcharges: rate.surcharges || surcharges,
      transService: rate.transService,
      nor: rate.nor,
    };
    setSelectedContract(dummyContract);
    setIsSurchargeModalOpen(true);
  };

  const handleShareRate = (rate: CombinedRateItem) => {
    toast.info(`Opening rate quote email share dialog for ${rate.code}...`);
  };

  const handleRequestQuote = () => {
    openQuoteDrawer({
      originPort: searchParams.polCode,
      deliveryPort: searchParams.podCode,
      eqpType: searchParams.eqpType,
      commodity: searchParams.commodity,
    });
  };

  return {
    viewMode,
    setViewMode,
    searchParams,
    searchMode: searchParams.searchMode,
    setSearchMode: (nextMode: RateSearchMode) =>
      setSearchParams((prev) => ({ ...prev, searchMode: nextMode })),
    resultsTitle: RESULTS_TITLE[mode],
    cardRates,
    isLoading,
    handleSearch,
    handleBookNow,
    handleViewSurcharges,
    handleShareRate,
    handleRequestQuote,
    selectedContract,
    isSurchargeModalOpen,
    handleCloseSurchargeModal: () => setIsSurchargeModalOpen(false),
    isQuoteDrawerOpen,
    quoteDefaults,
    handleCloseQuoteDrawer: () => setIsQuoteDrawerOpen(false),
  };
}
