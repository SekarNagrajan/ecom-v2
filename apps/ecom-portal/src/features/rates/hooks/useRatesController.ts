// Modified by Sekar Nagarajan (2026-08-25 19:25)
// Controller hook for Rates feature with URL query param auto-fetch on mount

import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  useContractsQuery,
  useSurchargesQuery,
  useTariffsQuery,
} from "../api/rates.queries";
import type { CombinedRateItem } from "../components/RateCardList";
import type {
  RateSearchMode,
  RateSearchParams,
} from "../components/RateSearchFilter";
import type { ContractDTO } from "../types/rates.types";

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

  const { data: tariffs = [], isLoading: isTariffsLoading } = useTariffsQuery({
    loadPort: searchParams.polCode,
    dischPort: searchParams.podCode,
    eqpType: searchParams.eqpType === "ALL" ? undefined : searchParams.eqpType,
  });

  const { data: contracts = [], isLoading: isContractsLoading } =
    useContractsQuery({
      pol: searchParams.polCode,
      pod: searchParams.podCode,
    });

  const { data: surcharges = [] } = useSurchargesQuery({
    pol: searchParams.polCode,
    pod: searchParams.podCode,
  });

  const isLoading = isTariffsLoading || isContractsLoading;

  const cardRates: CombinedRateItem[] = [];

  contracts.forEach((ctr, idx) => {
    cardRates.push({
      id: ctr.id,
      type: "CONTRACT",
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
    });
  });

  tariffs.forEach((trf) => {
    cardRates.push({
      id: trf.id,
      type: "TARIFF",
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
      surchargeAmount: 450.0,
      totalEstimatedAmount: trf.tariffAmount + 450.0,
      effectiveFrom: trf.effectiveFrom,
      effectiveTo: trf.effectiveTo,
      surcharges: surcharges,
    });
  });

  const handleSearch = (params: RateSearchParams) => {
    setSearchParams(params);
    toast.info(
      `Searching freight rates for ${params.polCode || "All"} → ${params.podCode || "All"}...`,
    );
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
      soc: "No",
      carrTerms: "CY / CY",
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo,
      surcharges: rate.surcharges || surcharges,
    };
    setSelectedContract(dummyContract);
    setIsSurchargeModalOpen(true);
  };

  const handleShareRate = (rate: CombinedRateItem) => {
    toast.info(`Opening rate quote email share dialog for ${rate.code}...`);
  };

  return {
    viewMode,
    setViewMode,
    searchParams,
    searchMode: searchParams.searchMode,
    setSearchMode: (mode: RateSearchMode) =>
      setSearchParams((prev) => ({ ...prev, searchMode: mode })),
    cardRates,
    isLoading,
    handleSearch,
    handleBookNow,
    handleViewSurcharges,
    handleShareRate,
    selectedContract,
    isSurchargeModalOpen,
    handleCloseSurchargeModal: () => setIsSurchargeModalOpen(false),
  };
}
