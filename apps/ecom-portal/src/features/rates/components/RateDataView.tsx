// Modified by Sekar Nagarajan (2026-08-25 19:25)
import { AppTabs } from "@solverminds/shared-ui";
import { Card } from "antd";

import type { RateSearchMode } from "./RateSearchFilter";
import { ContractView } from "./ContractView";
import { QuotesView } from "./QuotesView";
import { SurchargeView } from "./SurchargeView";
import { TariffView } from "./TariffView";

interface RateDataViewProps {
  activeMode: RateSearchMode;
  onModeChange: (mode: RateSearchMode) => void;
}

export function RateDataView({ activeMode, onModeChange }: RateDataViewProps) {
  const tabKeyMap: Record<RateSearchMode, string> = {
    PUBLISHED_TARIFF: "tariff",
    SURCHARGES: "surcharge",
    SERVICE_CONTRACTS: "contract",
    SPOT_QUOTES: "quotes",
  };

  const reverseTabKeyMap: Record<string, RateSearchMode> = {
    tariff: "PUBLISHED_TARIFF",
    surcharge: "SURCHARGES",
    contract: "SERVICE_CONTRACTS",
    quotes: "SPOT_QUOTES",
  };

  const items = [
    {
      key: "tariff",
      label: "Published Line Tariffs",
      children: <TariffView />,
    },
    {
      key: "surcharge",
      label: "Surcharges & Accessorials",
      children: <SurchargeView />,
    },
    {
      key: "contract",
      label: "Service Contracts",
      children: <ContractView />,
    },
    {
      key: "quotes",
      label: "Spot Rate Quotes",
      children: <QuotesView />,
    },
  ];

  return (
    <Card className="rates-dataview-shell" bordered={false}>
      <AppTabs
        activeKey={tabKeyMap[activeMode] || "tariff"}
        onChange={(key) =>
          onModeChange(reverseTabKeyMap[key] || "PUBLISHED_TARIFF")
        }
        items={items}
      />
    </Card>
  );
}
