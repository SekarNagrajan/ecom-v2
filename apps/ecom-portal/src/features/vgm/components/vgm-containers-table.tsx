// Modified by Sekar Nagarajan (2026-08-26 17:19)
import { FormInput, FormSelect } from "@solverminds/shared-ui";
import { Card, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Control, FieldArrayWithId } from "react-hook-form";

import type { VgmFormValues } from "../types/vgm.types";
import { VGM_FIELD_ITEM_PROPS } from "../utils/vgm-form-labels";

const { Text } = Typography;

interface VgmContainersTableProps {
  control: Control<VgmFormValues>;
  fields: FieldArrayWithId<VgmFormValues, "containers", "id">[];
}

export function VgmContainersTable({
  control,
  fields,
}: VgmContainersTableProps) {
  const columns: ColumnsType<
    FieldArrayWithId<VgmFormValues, "containers", "id">
  > = [
    { dataIndex: "containerNo", title: "Container No", width: 250 },
    { dataIndex: "eqpType", title: "Type", width: 250 },
    { dataIndex: "tareWeight", title: "Tare Wt.", width: 250 },
    {
      dataIndex: "vgmWeight",
      title: (
        <>
          VGM Weight <Text type="danger">*</Text>
        </>
      ),
      render: (_value, _record, index) => (
        <div className="vgm-field-cell">
          <FormInput
            control={control}
            name={`containers.${index}.vgmWeight`}
            size="large"
            formItemProps={VGM_FIELD_ITEM_PROPS}
          />
        </div>
      ),
    },
    {
      dataIndex: "vgmUnit",
      title: (
        <>
          Unit <Text type="danger">*</Text>
        </>
      ),
      width: 250,
      render: (_value, _record, index) => (
        <div className="vgm-field-cell">
          <FormSelect
            control={control}
            name={`containers.${index}.vgmUnit`}
            size="large"
            formItemProps={VGM_FIELD_ITEM_PROPS}
            options={[
              { label: "Kgs", value: "K" },
              { label: "Tons", value: "T" },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <Card
      className="vgm-section-card vgm-section-card--flush form-step-card"
      title="Containers"
      bordered={false}
    >
      <div className="responsive-table-wrap custom-scroll vgm-containers-wrap">
        <Table
          dataSource={fields}
          columns={columns}
          pagination={false}
          scroll={{ y: 300, x: "max-content" }}
          rowKey="id"
          size="small"
        />
      </div>
    </Card>
  );
}
