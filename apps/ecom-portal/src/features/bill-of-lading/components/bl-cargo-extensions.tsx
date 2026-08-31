// Modified by Sekar Nagarajan (2026-08-28 12:22)
import {
  Typography
} from "antd";

import { useBookingLookups } from "../../booking/api/booking.queries";
import type { SIContainer } from "../../shipping-instruction/types/si.types";

const { Text } = Typography;

export type BlContainerExtensions = SIContainer & {
  isSoc?: boolean;
  tareWeight?: number;
  reeferMode?: "none" | "operating" | "nor";
  setTemp?: number;
  tempUnit?: string;
  isOog?: boolean;
  olForward?: number;
  olAft?: number;
  owLeft?: number;
  owRight?: number;
  oh?: number;
  dimensionUnit?: string;
};

interface BlCargoExtensionsProps {
  container: BlContainerExtensions;
  enableOog?: boolean;
  onChange: (patch: Partial<BlContainerExtensions>) => void;
}

/** True when the selected equipment code is a reefer type (RF / RH / RE). */
function isReeferContainerType(containerType: string | undefined): boolean {
  const code = (containerType ?? "").trim().toUpperCase();
  return /RF|RH|RE/.test(code);
}

export function BlCargoExtensions({
  container,
  enableOog = true,
  onChange,
}: BlCargoExtensionsProps) {
  const { data: containerTypes = [] } = useBookingLookups("containerTypes");
  const eqpSize = container.eqpSize || "20DC";
  const reeferMode = container.reeferMode ?? "none";
  const isOog = container.isOog ?? false;
  const showReeferMode = isReeferContainerType(eqpSize);

  return null;
  //   <Collapse
  //     ghost
  //     className="bl-cargo-extensions"
  //     defaultActiveKey={["extensions"]}
  //     items={[
  //       {
  //         key: "extensions",
  //         label: `Container ${
  //           container.containerNo || "—"
  //         } — Type / SOC / Reefer / OOG`,
  //         children: (
  //           <>
  //             <Row gutter={[24, 24]}>
  //               {/* Modified by Sekar Nagarajan (2026-08-28 12:22) */}
  //               <Col xs={24} md={showReeferMode ? 5 : 8}>
  //                 <label className="form-field-label">
  //                   Container Type <Text type="danger">*</Text>
  //                 </label>
  //                 <Select
  //                   size="large"
  //                   className="form-field-full-width"
  //                   value={eqpSize}
  //                   options={containerTypes}
  //                   showSearch
  //                   optionFilterProp="label"
  //                   onChange={(value: string) => {
  //                     const patch: Partial<BlContainerExtensions> = {
  //                       eqpSize: value,
  //                     };
  //                     if (!isReeferContainerType(value)) {
  //                       patch.reeferMode = "none";
  //                     }
  //                     onChange(patch);
  //                   }}
  //                 />
  //               </Col>
  //               <Col xs={24} md={4}>
  //                 <label className="form-field-label">Tare Weight (kg)</label>
  //                 <InputNumber
  //                   size="large"
  //                   min={0}
  //                   className="form-field-full-width"
  //                   value={container.tareWeight}
  //                   onChange={(value) =>
  //                     onChange({ tareWeight: value ?? undefined })
  //                   }
  //                 />
  //               </Col>
  //               <Col xs={24} md={4}>
  //                 <label className="form-field-label">SOC / OOG</label>
  //                 <Flex align="center" gap="middle" wrap="wrap">
  //                   <Checkbox
  //                     checked={container.isSoc ?? false}
  //                     onChange={(e) => onChange({ isSoc: e.target.checked })}
  //                   >
  //                     <b>SOC</b>
  //                   </Checkbox>
  //                   {enableOog ? (
  //                     <Checkbox
  //                       checked={isOog}
  //                       onChange={(e) => onChange({ isOog: e.target.checked })}
  //                     >
  //                       <Text strong>OOG</Text>
  //                     </Checkbox>
  //                   ) : null}
  //                 </Flex>
  //               </Col>
  //               {showReeferMode ? (
  //                 <Col xs={24} md={showReeferMode ? 11 : 8}>
  //                   <label className="form-field-label">Reefer Mode</label>
  //                   <Segmented
  //                     block
  //                     value={reeferMode}
  //                     onChange={(value) =>
  //                       onChange({
  //                         reeferMode:
  //                           value as BlContainerExtensions["reeferMode"],
  //                       })
  //                     }
  //                     options={[
  //                       { label: "None", value: "none" },
  //                       { label: "Operating", value: "operating" },
  //                       { label: "NOR", value: "nor" },
  //                     ]}
  //                   />
  //                 </Col>
  //               ) : null}
  //             </Row>

  //             {showReeferMode && reeferMode === "operating" ? (
  //               <Card
  //                 size="small"
  //                 title="Reefer Details"
  //                 className="form-step-card form-step-section"
  //               >
  //                 <Row gutter={[24, 24]}>
  //                   <Col {...RESPONSIVE_COL.formThird}>
  //                     <label className="form-field-label">
  //                       Set Temp <Text type="danger">*</Text>
  //                     </label>
  //                     <InputNumber
  //                       size="large"
  //                       className="form-field-full-width"
  //                       value={container.setTemp}
  //                       onChange={(value) =>
  //                         onChange({ setTemp: value ?? undefined })
  //                       }
  //                     />
  //                   </Col>
  //                   <Col {...RESPONSIVE_COL.formThird}>
  //                     <label className="form-field-label">Temp Unit</label>
  //                     <Select
  //                       size="large"
  //                       className="form-field-full-width"
  //                       value={container.tempUnit ?? "Celsius"}
  //                       onChange={(value) => onChange({ tempUnit: value })}
  //                       options={[
  //                         { value: "Celsius", label: "Celsius" },
  //                         { value: "Fahrenheit", label: "Fahrenheit" },
  //                       ]}
  //                     />
  //                   </Col>
  //                 </Row>
  //               </Card>
  //             ) : null}

  //             {enableOog && isOog ? (
  //               <Card
  //                 size="small"
  //                 title="OOG Details"
  //                 className="form-step-card form-step-section"
  //               >
  //                 <Row gutter={[24, 24]}>
  //                   <Col {...RESPONSIVE_COL.formSixth}>
  //                     <label className="form-field-label">Dimension Unit</label>
  //                     <Select
  //                       size="large"
  //                       className="form-field-full-width"
  //                       value={container.dimensionUnit ?? "CM"}
  //                       onChange={(value) => onChange({ dimensionUnit: value })}
  //                       options={[
  //                         { value: "CM", label: "CM" },
  //                         { value: "IN", label: "IN" },
  //                       ]}
  //                     />
  //                   </Col>
  //                   <Col {...RESPONSIVE_COL.formSixth}>
  //                     <label className="form-field-label">OL Forward</label>
  //                     <InputNumber
  //                       size="large"
  //                       className="form-field-full-width"
  //                       value={container.olForward}
  //                       onChange={(value) =>
  //                         onChange({ olForward: value ?? undefined })
  //                       }
  //                     />
  //                   </Col>
  //                   <Col {...RESPONSIVE_COL.formSixth}>
  //                     <label className="form-field-label">OL Aft</label>
  //                     <InputNumber
  //                       size="large"
  //                       className="form-field-full-width"
  //                       value={container.olAft}
  //                       onChange={(value) =>
  //                         onChange({ olAft: value ?? undefined })
  //                       }
  //                     />
  //                   </Col>
  //                   <Col {...RESPONSIVE_COL.formSixth}>
  //                     <label className="form-field-label">OW Left</label>
  //                     <InputNumber
  //                       size="large"
  //                       className="form-field-full-width"
  //                       value={container.owLeft}
  //                       onChange={(value) =>
  //                         onChange({ owLeft: value ?? undefined })
  //                       }
  //                     />
  //                   </Col>
  //                   <Col {...RESPONSIVE_COL.formSixth}>
  //                     <label className="form-field-label">OW Right</label>
  //                     <InputNumber
  //                       size="large"
  //                       className="form-field-full-width"
  //                       value={container.owRight}
  //                       onChange={(value) =>
  //                         onChange({ owRight: value ?? undefined })
  //                       }
  //                     />
  //                   </Col>
  //                   <Col {...RESPONSIVE_COL.formSixth}>
  //                     <label className="form-field-label">OH</label>
  //                     <InputNumber
  //                       size="large"
  //                       className="form-field-full-width"
  //                       value={container.oh}
  //                       onChange={(value) =>
  //                         onChange({ oh: value ?? undefined })
  //                       }
  //                     />
  //                   </Col>
  //                 </Row>
  //               </Card>
  //             ) : null}
  //           </>
  //         ),
  //       },
  //     ]}
  //   />
  // );
}
