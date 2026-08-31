/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useState } from "react";

import { useToast } from "../../hooks";
import { CardView } from "./card-view/card-view";
import { DataView } from "./data-view";
import { KanbanView } from "./kanban-view/kanban-view";
import type { KanbanUpdateParams } from "./kanban-view/types";
import { ListView } from "./list-view/list-view";
import type { DataViewColumn } from "./types";

// =============================================================================
// MOCK DATA & TYPES
// =============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Pending" | "Inactive";
  role: string;
}

const STATUS_OPTIONS = ["Active", "Pending", "Inactive"] as const;
const ROLE_OPTIONS = ["Admin", "User", "Manager"] as const;

const MOCK_USERS: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: STATUS_OPTIONS[i % STATUS_OPTIONS.length] as User["status"],
  role: ROLE_OPTIONS[i % ROLE_OPTIONS.length] as User["role"],
}));

const COLUMNS: DataViewColumn<User>[] = [
  { field: "name", headerName: "Name", isPrimary: true },
  { field: "email", headerName: "Email", isSecondary: true },
  { field: "status", headerName: "Status" },
  { field: "role", headerName: "Role" },
];

// =============================================================================
// META
// =============================================================================

const meta: Meta = {
  title: "Components/DataView/Unified",
  decorators: [
    (Story) => (
      <div
        style={{
          height: "600px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

// =============================================================================
// 1. LIST VIEW STORIES
// =============================================================================

export const ListViewClient: StoryObj<typeof ListView> = {
  name: "ListView / Client Mode",
  render: () => (
    <ListView
      dataMode="client"
      rowData={MOCK_USERS}
      columnDefs={COLUMNS as any}
      style={{ flex: 1, minHeight: 0 }}
    />
  ),
};

// =============================================================================
// 2. CARD VIEW STORIES
// =============================================================================

function StatefulCardView() {
  const pageSize = 12;
  const [page, setPage] = useState(0); // 0-indexed

  return (
    <CardView
      data={MOCK_USERS}
      columnDefs={COLUMNS}
      totalCount={MOCK_USERS.length}
      page={page}
      pageSize={pageSize}
      paginationMode="pagination"
      onPaginationChange={(newPage) => setPage(newPage)}
    />
  );
}

export const CardViewStory: StoryObj<typeof CardView> = {
  name: "CardView / Client Mode",
  render: () => <StatefulCardView />,
};

// =============================================================================
// 3. KANBAN VIEW STORIES
// =============================================================================

const KanbanDemo = ({
  shouldFail = false,
  customCard = false,
  isLargeDataset = false,
  collapsible = false,
}: {
  shouldFail?: boolean;
  customCard?: boolean;
  isLargeDataset?: boolean;
  collapsible?: boolean;
}) => {
  const initialData = isLargeDataset
    ? Array.from({ length: 1000 }, (_, i) => ({
        id: String(i + 1),
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: STATUS_OPTIONS[i % STATUS_OPTIONS.length] as User["status"],
        role: ROLE_OPTIONS[i % ROLE_OPTIONS.length] as User["role"],
      }))
    : MOCK_USERS;

  const [data, setData] = useState(initialData);
  const toast = useToast();

  const handleUpdate = useCallback(
    async ({
      item,
      field,
      newValue,
      beforeId,
      afterId,
    }: KanbanUpdateParams<User>) => {
      toast.info(`Updating ${item.name}...`);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (shouldFail) {
        toast.error(`Failed to move ${item.name} to ${newValue}`);
        throw new Error("API Error");
      }

      setData((prev) => {
        const newState = prev.filter((i) => i.id !== item.id);
        const updatedItem = { ...item, [field]: newValue };

        if (beforeId) {
          const index = newState.findIndex((i) => i.id === beforeId);
          newState.splice(index + 1, 0, updatedItem);
        } else if (afterId) {
          const index = newState.findIndex((i) => i.id === afterId);
          newState.splice(index, 0, updatedItem);
        } else {
          newState.push(updatedItem);
        }
        return [...newState];
      });

      toast.success(
        `${item.name} moved to ${newValue} (Pos: ${
          beforeId ? "after " + beforeId : afterId ? "before " + afterId : "end"
        })`,
      );
    },
    [shouldFail, toast],
  );

  return (
    <KanbanView<User>
      data={data}
      columnDefs={COLUMNS as any}
      groupByField="status"
      idField="id"
      lanes={[
        { id: "Active", title: "Active", color: "#047857" },
        { id: "Pending", title: "Pending", color: "#faad14" },
        { id: "Inactive", title: "Inactive", color: "#ff4d4f" },
      ]}
      onItemUpdate={handleUpdate}
      collapsible={collapsible}
      renderCard={
        customCard
          ? ({ item, dragHandleProps }) => (
              <div
                {...dragHandleProps}
                style={{
                  padding: "12px",
                  background: "#fff",
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  cursor: "grab",
                }}
              >
                <div style={{ fontWeight: "bold", color: "#1890ff" }}>
                  {item.name}
                </div>
                <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                  {item.email}
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    display: "inline-block",
                    padding: "2px 8px",
                    background: "#f5f5f5",
                    borderRadius: "4px",
                    fontSize: "11px",
                  }}
                >
                  {item.role}
                </div>
              </div>
            )
          : undefined
      }
    />
  );
};

export const KanbanViewSuccess: StoryObj<typeof KanbanView> = {
  name: "KanbanView / Success Flow",
  render: () => <KanbanDemo />,
};

export const KanbanViewFailure: StoryObj<typeof KanbanView> = {
  name: "KanbanView / Error Handling (Rollback)",
  render: () => <KanbanDemo shouldFail />,
};

export const KanbanViewCustomCard: StoryObj<typeof KanbanView> = {
  name: "KanbanView / Custom Card Rendering",
  render: () => <KanbanDemo customCard />,
};

export const KanbanViewLargeDataset: StoryObj<typeof KanbanView> = {
  name: "KanbanView / Large Dataset (1000 items)",
  render: () => <KanbanDemo isLargeDataset />,
};

export const KanbanViewCollapsible: StoryObj<typeof KanbanView> = {
  name: "KanbanView / Collapsible Lanes",
  render: () => <KanbanDemo collapsible />,
};

// =============================================================================
// 4. DATA VIEW (ORCHESTRATOR) STORIES
// =============================================================================

const DataViewDemo = ({ shouldFail = false }: { shouldFail?: boolean }) => {
  const [data, setData] = useState(MOCK_USERS);
  const toast = useToast();

  return (
    <DataView
      dataMode="client"
      rowData={data}
      columnDefs={COLUMNS as any}
      kanbanOptions={{
        groupByField: "status",
        idField: "id",
        lanes: [
          { id: "Active", title: "Active" },
          { id: "Pending", title: "Pending" },
          { id: "Inactive", title: "Inactive" },
        ],
        onItemUpdate: async ({
          item,
          field,
          newValue,
        }: KanbanUpdateParams<User>) => {
          toast.info(`Updating ${item.name}...`);
          await new Promise((r) => setTimeout(r, 1000));

          if (shouldFail) {
            toast.error("Server rejected the update");
            throw new Error("Failure");
          }

          setData((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, [field]: newValue } : i,
            ),
          );

          toast.success(`Successfully moved ${item.name}`);
        },
      }}
    />
  );
};

export const DataViewWithCustomKanban: StoryObj<typeof DataView> = {
  name: "DataView / Orchestrator with Kanban",
  render: () => <DataViewDemo />,
};

export const DataViewOrchestrator: StoryObj<typeof DataView> = {
  name: "DataView / Orchestrator (List + Card + Kanban)",
  render: () => (
    <DataView
      dataMode="client"
      rowData={MOCK_USERS}
      columnDefs={COLUMNS as any}
      kanbanOptions={{
        groupByField: "status",
        idField: "id",
        lanes: [
          { id: "Active", title: "Active", color: "#047857" },
          { id: "Pending", title: "Pending", color: "#faad14" },
          { id: "Inactive", title: "Inactive", color: "#ff4d4f" },
        ],
      }}
    />
  ),
};
