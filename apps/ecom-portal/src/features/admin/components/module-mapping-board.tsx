// Created by Sekar Nagarajan (2026-08-27 12:56)
/**
 * Module Mapping board — dual lists with drag-and-drop (Available ↔ Assigned).
 * Default (D) menus stay locked on the assigned side.
 */
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AppButton, AppCheckbox } from "@solverminds/shared-ui";
import { Empty, Input, Tag, Tooltip, Typography } from "antd";
import { useState, type ReactNode } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { ModuleMappingMenu } from "../types/admin.types";

const { Text } = Typography;

export type MappingColumnId = "available" | "assigned";

export function displayMenuName(name: string) {
  return name === "OBLPrint" ? "Bill of Lading" : name;
}

interface ModuleMappingBoardProps {
  availableMenus: ModuleMappingMenu[];
  defaultMenus: ModuleMappingMenu[];
  assignedMenus: ModuleMappingMenu[];
  selectedAvailableIds: string[];
  selectedAssignedIds: string[];
  onToggleAvailable: (menuId: string) => void;
  onToggleAssigned: (menuId: string) => void;
  onAddSelected: () => void;
  onRemoveSelected: () => void;
  onQuickAdd: (menuId: string) => void;
  onQuickRemove: (menuId: string) => void;
  onDropToAssigned: (menuIds: string[]) => void;
  onDropToAvailable: (menuIds: string[]) => void;
  isAdding: boolean;
  isRemoving: boolean;
  disabled?: boolean;
}

function filterMenus(menus: ModuleMappingMenu[], term: string) {
  const q = term.trim().toLowerCase();
  if (!q) return menus;
  return menus.filter(
    (m) =>
      displayMenuName(m.menuName).toLowerCase().includes(q) ||
      (m.refNo ?? "").toLowerCase().includes(q),
  );
}

function MappingMenuCard({
  menu,
  column,
  selected,
  locked,
  onToggle,
  onQuickMove,
  disabled,
}: {
  menu: ModuleMappingMenu;
  column: MappingColumnId;
  selected: boolean;
  locked?: boolean;
  onToggle?: () => void;
  onQuickMove?: () => void;
  disabled?: boolean;
}) {
  const dragId = `${column}:${menu.menuId}`;
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: dragId,
    data: { menuId: menu.menuId, column, menu },
    disabled: locked || disabled,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop:${dragId}`,
    data: { column },
    disabled,
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "admin-mapping-card",
        locked ? "admin-mapping-card--locked" : "",
        selected ? "admin-mapping-card--selected" : "",
        isDragging ? "admin-mapping-card--dragging" : "",
        isOver ? "admin-mapping-card--drop-target" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {locked ? (
        <span className="admin-mapping-card__handle admin-mapping-card__handle--locked">
          <AppIcon icon={Icons.lock} size={14} />
        </span>
      ) : (
        <Tooltip title="Drag to move">
          <button
            type="button"
            className="admin-mapping-card__handle"
            aria-label={`Drag ${displayMenuName(menu.menuName)}`}
            disabled={disabled}
            {...listeners}
            {...attributes}
          >
            <AppIcon icon={Icons.gripVertical} size={14} />
          </button>
        </Tooltip>
      )}

      <div className="admin-mapping-card__body">
        {locked || !onToggle ? (
          <Text className="admin-mapping-card__name">
            {displayMenuName(menu.menuName)}
          </Text>
        ) : (
          <AppCheckbox
            id={`map-${column}-${menu.menuId}`}
            checked={selected}
            disabled={disabled}
            onChange={onToggle}
          >
            {displayMenuName(menu.menuName)}
          </AppCheckbox>
        )}
        {menu.refNo ? (
          <Tag className="admin-code-tag" color={locked ? "default" : "blue"}>
            {menu.refNo}
          </Tag>
        ) : null}
        {locked ? (
          <Tag className="admin-status-tag" color="success">
            Default
          </Tag>
        ) : null}
      </div>

      {!locked && onQuickMove ? (
        <Tooltip
          title={
            column === "available" ? "Add to customer" : "Remove from customer"
          }
        >
          <span>
            <AppButton
              type="text"
              size="small"
              disabled={disabled}
              aria-label={
                column === "available"
                  ? `Add ${displayMenuName(menu.menuName)}`
                  : `Remove ${displayMenuName(menu.menuName)}`
              }
              icon={
                <AppIcon
                  icon={
                    column === "available" ? Icons.arrowRight : Icons.arrowLeft
                  }
                  size={14}
                />
              }
              onClick={onQuickMove}
            />
          </span>
        </Tooltip>
      ) : null}
    </div>
  );
}

function MappingDropColumn({
  id,
  title,
  hint,
  count,
  search,
  onSearchChange,
  children,
  emptyText,
  isEmpty,
}: {
  id: MappingColumnId;
  title: string;
  hint: string;
  count: number;
  search: string;
  onSearchChange: (value: string) => void;
  children: ReactNode;
  emptyText: string;
  isEmpty: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { column: id },
  });

  return (
    <div
      ref={setNodeRef}
      className={[
        "admin-mapping-column",
        isOver ? "admin-mapping-column--over" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="admin-mapping-column__head">
        <div className="admin-mapping-column__title-row">
          <Text strong className="admin-mapping-column__title">
            {title}
          </Text>
          <Tag className="admin-status-tag">{count}</Tag>
        </div>
        <Text type="secondary" className="admin-mapping-column__hint">
          {hint}
        </Text>
        <Input
          size="large"
          allowClear
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter modules"
          prefix={<AppIcon icon={Icons.search} size={16} />}
        />
      </div>
      <div className="admin-mapping-column__list custom-scroll">
        {isEmpty ? <Empty description={emptyText} /> : children}
      </div>
    </div>
  );
}

function MappingDragPreview({ menu }: { menu: ModuleMappingMenu }) {
  return (
    <div className="admin-mapping-card admin-mapping-card--overlay">
      <span className="admin-mapping-card__handle">
        <AppIcon icon={Icons.gripVertical} size={14} />
      </span>
      <Text className="admin-mapping-card__name">
        {displayMenuName(menu.menuName)}
      </Text>
      {menu.refNo ? (
        <Tag className="admin-code-tag" color="blue">
          {menu.refNo}
        </Tag>
      ) : null}
    </div>
  );
}

export function ModuleMappingBoard({
  availableMenus,
  defaultMenus,
  assignedMenus,
  selectedAvailableIds,
  selectedAssignedIds,
  onToggleAvailable,
  onToggleAssigned,
  onAddSelected,
  onRemoveSelected,
  onQuickAdd,
  onQuickRemove,
  onDropToAssigned,
  onDropToAvailable,
  isAdding,
  isRemoving,
  disabled = false,
}: ModuleMappingBoardProps) {
  const [availableSearch, setAvailableSearch] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<ModuleMappingMenu | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // avoid fighting checkbox clicks
    }),
  );

  const busy = disabled || isAdding || isRemoving;
  const filteredAvailable = filterMenus(availableMenus, availableSearch);
  const filteredDefault = filterMenus(defaultMenus, assignedSearch);
  const filteredAssigned = filterMenus(assignedMenus, assignedSearch);
  const assignedSideEmpty =
    filteredDefault.length === 0 && filteredAssigned.length === 0;

  const handleDragStart = (event: DragStartEvent) => {
    const menu = event.active.data.current?.menu as
      | ModuleMappingMenu
      | undefined;
    setActiveMenu(menu ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveMenu(null);
    if (busy) return;

    const { active, over } = event;
    if (!over) return;

    const menuId = active.data.current?.menuId as string | undefined;
    const source = active.data.current?.column as MappingColumnId | undefined;
    if (!menuId || !source) return;

    const overId = String(over.id);
    const overColumn = over.data.current?.column as MappingColumnId | undefined;
    const target: MappingColumnId | null =
      overColumn ??
      (overId === "available" || overId === "assigned"
        ? overId
        : overId.includes("available")
        ? "available"
        : overId.includes("assigned")
        ? "assigned"
        : null);

    if (!target || target === source) return;

    if (source === "available" && target === "assigned") {
      const ids =
        selectedAvailableIds.includes(menuId) && selectedAvailableIds.length > 1
          ? selectedAvailableIds
          : [menuId];
      onDropToAssigned(ids);
      return;
    }

    if (source === "assigned" && target === "available") {
      const ids =
        selectedAssignedIds.includes(menuId) && selectedAssignedIds.length > 1
          ? selectedAssignedIds
          : [menuId];
      onDropToAvailable(ids);
    }
  };

  const handleDragCancel = () => {
    setActiveMenu(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className={[
          "admin-mapping-board",
          busy ? "admin-mapping-board--busy" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <MappingDropColumn
          id="available"
          title="Available Privileges"
          hint="Modules not yet assigned — drag right or select and Add"
          count={availableMenus.length}
          search={availableSearch}
          onSearchChange={setAvailableSearch}
          emptyText="No privileged modules left to assign"
          isEmpty={filteredAvailable.length === 0}
        >
          {filteredAvailable.map((menu) => (
            <MappingMenuCard
              key={menu.menuId}
              menu={menu}
              column="available"
              selected={selectedAvailableIds.includes(menu.menuId)}
              disabled={busy}
              onToggle={() => onToggleAvailable(menu.menuId)}
              onQuickMove={() => onQuickAdd(menu.menuId)}
            />
          ))}
        </MappingDropColumn>

        <div className="admin-mapping-transfer">
          <Tooltip title="Add selected to customer">
            <AppButton
              type="primary"
              loading={isAdding}
              disabled={busy || selectedAvailableIds.length === 0}
              icon={
                <AppIcon icon={Icons.arrowRight} size={16} tone="approve" />
              }
              onClick={onAddSelected}
              aria-label="Add selected privileges"
            />
          </Tooltip>
          <Tooltip title="Remove selected from customer">
            <AppButton
              danger
              loading={isRemoving}
              disabled={busy || selectedAssignedIds.length === 0}
              icon={<AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />}
              onClick={onRemoveSelected}
              aria-label="Remove selected privileges"
            />
          </Tooltip>
          <Text type="secondary" className="admin-mapping-transfer__hint">
            or drag
          </Text>
        </div>

        <MappingDropColumn
          id="assigned"
          title="Customer Access"
          hint="Default modules stay locked; drag assigned modules left to remove"
          count={defaultMenus.length + assignedMenus.length}
          search={assignedSearch}
          onSearchChange={setAssignedSearch}
          emptyText="No modules on this customer yet"
          isEmpty={assignedSideEmpty}
        >
          {filteredDefault.map((menu) => (
            <MappingMenuCard
              key={`def-${menu.menuId}`}
              menu={menu}
              column="assigned"
              selected={false}
              locked
              disabled={busy}
            />
          ))}
          {filteredAssigned.map((menu) => (
            <MappingMenuCard
              key={`np-${menu.menuId}`}
              menu={menu}
              column="assigned"
              selected={selectedAssignedIds.includes(menu.menuId)}
              disabled={busy}
              onToggle={() => onToggleAssigned(menu.menuId)}
              onQuickMove={() => onQuickRemove(menu.menuId)}
            />
          ))}
        </MappingDropColumn>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeMenu ? <MappingDragPreview menu={activeMenu} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
