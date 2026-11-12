// Modified by Sekar Nagarajan (2026-11-12 15:10)
/**
 * Module Mapping board — dual lists with drag-and-drop (Available ↔ Customer Access).
 * Default (D) menus stay locked on the assigned side. Pointer, touch and keyboard sensors; the
 * keyboard getter jumps the dragged card between the two columns with ← / →.
 */
import {
  DndContext,
  DragOverlay,
  KeyboardCode,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AppButton, AppCheckbox } from "@solverminds/shared-ui";
import { Input, Tag, Tooltip, Typography } from "antd";
import { useState, type ReactNode } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import type { ModuleMappingMenu } from "../types/admin.types";
import { AdminStatusPill } from "./shared/AdminStatusPill";

const { Text } = Typography;

export type MappingColumnId = "available" | "assigned";
export type MappingVisibleColumn = MappingColumnId | "both";

const KEYBOARD_STEP = 24;

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
  /** Human-readable module name (canonical portal title when known). */
  displayName: (menu: ModuleMappingMenu) => string;
  isAdding: boolean;
  isRemoving: boolean;
  disabled?: boolean;
  /** Mobile shows one column at a time. */
  visibleColumn?: MappingVisibleColumn;
}

function filterMenus(
  menus: ModuleMappingMenu[],
  term: string,
  displayName: (menu: ModuleMappingMenu) => string,
) {
  const q = term.trim().toLowerCase();
  if (!q) return menus;
  return menus.filter(
    (m) =>
      displayName(m).toLowerCase().includes(q) ||
      (m.refNo ?? "").toLowerCase().includes(q),
  );
}

/** ↑/↓ nudge; ←/→ jump to the other column so keyboard users can drop across. */
const columnCoordinateGetter: KeyboardCoordinateGetter = (event, { currentCoordinates, context }) => {
  switch (event.code) {
    case KeyboardCode.Up:
      return { ...currentCoordinates, y: currentCoordinates.y - KEYBOARD_STEP };
    case KeyboardCode.Down:
      return { ...currentCoordinates, y: currentCoordinates.y + KEYBOARD_STEP };
    case KeyboardCode.Left:
    case KeyboardCode.Right: {
      const target: MappingColumnId = event.code === KeyboardCode.Right ? "assigned" : "available";
      const rect = context.droppableRects.get(target);
      if (!rect) return undefined;
      const width = context.collisionRect?.width ?? 0;
      return { x: rect.left + rect.width / 2 - width / 2, y: rect.top + KEYBOARD_STEP * 3 };
    }
    default:
      return undefined;
  }
};

function MappingMenuCard({
  menu,
  column,
  selected,
  locked,
  onToggle,
  onQuickMove,
  disabled,
  displayName,
}: {
  menu: ModuleMappingMenu;
  column: MappingColumnId;
  selected: boolean;
  locked?: boolean;
  onToggle?: () => void;
  onQuickMove?: () => void;
  disabled?: boolean;
  displayName: (menu: ModuleMappingMenu) => string;
}) {
  const name = displayName(menu);
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

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

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
        <span className="admin-mapping-card__handle admin-mapping-card__handle--locked" aria-hidden>
          <AppIcon icon={Icons.lock} size={14} />
        </span>
      ) : (
        <Tooltip title="Drag to move (Space to pick up, ← → to switch column)">
          <button
            type="button"
            className="admin-mapping-card__handle"
            aria-label={`Drag ${name}`}
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
          <Text className="admin-mapping-card__name">{name}</Text>
        ) : (
          <AppCheckbox
            id={`map-${column}-${menu.menuId}`}
            checked={selected}
            disabled={disabled}
            onChange={onToggle}
          >
            {name}
          </AppCheckbox>
        )}
        {menu.refNo ? <Tag className="admin-code-tag">{menu.refNo}</Tag> : null}
        {locked ? (
          <AdminStatusPill tone="success" dot={false}>
            Default
          </AdminStatusPill>
        ) : null}
      </div>

      {!locked && onQuickMove ? (
        <Tooltip title={column === "available" ? "Add to customer" : "Remove from customer"}>
          <span>
            <AppButton
              type="text"
              size="small"
              disabled={disabled}
              aria-label={column === "available" ? `Add ${name}` : `Remove ${name}`}
              icon={
                <AppIcon
                  icon={column === "available" ? Icons.arrowRight : Icons.arrowLeft}
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
  hidden,
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
  hidden: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { column: id } });

  return (
    <section
      ref={setNodeRef}
      aria-label={`${title}, ${count} module${count === 1 ? "" : "s"}`}
      className={[
        "admin-mapping-column",
        isOver ? "admin-mapping-column--over" : "",
        hidden ? "admin-mapping-column--hidden" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="admin-mapping-column__head">
        <div className="admin-mapping-column__title-row">
          <Text strong className="admin-mapping-column__title">
            {title}
          </Text>
          <AdminStatusPill tone="neutral" dot={false}>
            {count}
          </AdminStatusPill>
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
          aria-label={`Filter ${title}`}
          prefix={<AppIcon icon={Icons.search} size={16} />}
        />
      </div>
      <div className="admin-mapping-column__list custom-scroll">
        {isEmpty ? (
          <ModuleEmptyState variant={search ? "filtered" : "blank"} title={emptyText} artSize="sm" />
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function MappingDragPreview({ menu, name }: { menu: ModuleMappingMenu; name: string }) {
  return (
    <div className="admin-mapping-card admin-mapping-card--overlay">
      <span className="admin-mapping-card__handle" aria-hidden>
        <AppIcon icon={Icons.gripVertical} size={14} />
      </span>
      <Text className="admin-mapping-card__name">{name}</Text>
      {menu.refNo ? <Tag className="admin-code-tag">{menu.refNo}</Tag> : null}
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
  displayName,
  isAdding,
  isRemoving,
  disabled = false,
  visibleColumn = "both",
}: ModuleMappingBoardProps) {
  const [availableSearch, setAvailableSearch] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<ModuleMappingMenu | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // avoid fighting checkbox clicks
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: columnCoordinateGetter }),
  );

  const busy = disabled || isAdding || isRemoving;
  const filteredAvailable = filterMenus(availableMenus, availableSearch, displayName);
  const filteredDefault = filterMenus(defaultMenus, assignedSearch, displayName);
  const filteredAssigned = filterMenus(assignedMenus, assignedSearch, displayName);
  const assignedSideEmpty = filteredDefault.length === 0 && filteredAssigned.length === 0;

  const menuOf = (data: Record<string, unknown> | undefined) => data?.menu as ModuleMappingMenu | undefined;
  const columnLabel = (id: unknown) =>
    String(id).includes("assigned") ? "Customer Access" : "Available Privileges";

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      const menu = menuOf(active.data.current);
      return menu ? `Picked up ${displayName(menu)}. Use left and right arrows to switch column, space to drop.` : undefined;
    },
    onDragOver: ({ active, over }) => {
      const menu = menuOf(active.data.current);
      return menu && over ? `${displayName(menu)} is over ${columnLabel(over.id)}.` : undefined;
    },
    onDragEnd: ({ active, over }) => {
      const menu = menuOf(active.data.current);
      return menu && over ? `${displayName(menu)} dropped on ${columnLabel(over.id)}.` : undefined;
    },
    onDragCancel: ({ active }) => {
      const menu = menuOf(active.data.current);
      return menu ? `Moving ${displayName(menu)} was cancelled.` : undefined;
    },
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveMenu(menuOf(event.active.data.current) ?? null);
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

  const single = visibleColumn !== "both";

  return (
    <DndContext
      sensors={sensors}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveMenu(null)}
    >
      <div
        className={[
          "admin-mapping-board",
          busy ? "admin-mapping-board--busy" : "",
          single ? "admin-mapping-board--single" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-busy={busy}
      >
        <MappingDropColumn
          id="available"
          title="Available Privileges"
          hint="Modules not yet assigned — drag right, or select and add"
          count={availableMenus.length}
          search={availableSearch}
          onSearchChange={setAvailableSearch}
          emptyText="No privileged modules left to assign"
          isEmpty={filteredAvailable.length === 0}
          hidden={single && visibleColumn !== "available"}
        >
          {filteredAvailable.map((menu) => (
            <MappingMenuCard
              key={menu.menuId}
              menu={menu}
              column="available"
              selected={selectedAvailableIds.includes(menu.menuId)}
              disabled={busy}
              displayName={displayName}
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
              icon={<AppIcon icon={Icons.arrowRight} size={16} />}
              onClick={onAddSelected}
              aria-label="Add selected privileges"
            />
          </Tooltip>
          <Tooltip title="Remove selected from customer">
            <AppButton
              danger
              loading={isRemoving}
              disabled={busy || selectedAssignedIds.length === 0}
              icon={<AppIcon icon={Icons.arrowLeft} size={16} tone="delete"/>}
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
          hidden={single && visibleColumn !== "assigned"}
        >
          {filteredDefault.map((menu) => (
            <MappingMenuCard
              key={`def-${menu.menuId}`}
              menu={menu}
              column="assigned"
              selected={false}
              locked
              disabled={busy}
              displayName={displayName}
            />
          ))}
          {filteredAssigned.map((menu) => (
            <MappingMenuCard
              key={`np-${menu.menuId}`}
              menu={menu}
              column="assigned"
              selected={selectedAssignedIds.includes(menu.menuId)}
              disabled={busy}
              displayName={displayName}
              onToggle={() => onToggleAssigned(menu.menuId)}
              onQuickMove={() => onQuickRemove(menu.menuId)}
            />
          ))}
        </MappingDropColumn>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeMenu ? <MappingDragPreview menu={activeMenu} name={displayName(activeMenu)} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
