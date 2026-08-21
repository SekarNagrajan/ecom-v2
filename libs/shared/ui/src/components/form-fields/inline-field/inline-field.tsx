import {
  LoadingOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Spin, theme, Typography, Button } from 'antd';
import { useState, useId, type ReactNode } from 'react';

const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InlineFieldViewActions {
  /** Programmatically switch to edit mode. No-op when `disabled` is true. */
  onEdit: () => void;
}

export interface InlineFieldEditActions {
  /** Call after a successful save — switches back to view mode. */
  onConfirm: () => void;
  /** Call to abort editing — switches back to view mode without saving. */
  onCancel: () => void;
  /**
   * Apply this as the `id` on your `<form>` (or Ant Design `<Form>`) element.
   * The ✓ button is rendered as `<button type="submit" form={formId}>` so
   * clicking it triggers native form submission, which runs RHF validation
   * before your `onConfirm` is ever called.
   */
  formId: string;
}

export interface InlineFieldProps<T = string> {
  /**
   * The source-of-truth value.
   * `InlineField` holds this internally so `renderView` and `renderEdit`
   * always receive the same stable copy — no stale-closure risk from the parent.
   */
  value: T;

  /**
   * Render the view-mode UI.
   * Receives the internal `value` and an `onEdit` callback so you can wire
   * the edit trigger to exactly the element you want (icon, text, button, etc.).
   *
   * Default: renders `String(value)` as plain `<Text>`.
   */
  renderView?: (value: T, actions: InlineFieldViewActions) => ReactNode;

  /**
   * Render the edit-mode UI.
   * Receives the internal `value` and `{ onConfirm, onCancel }` callbacks.
   *
   * The parent is fully responsible for:
   * - validation and error display
   * - calling the API / any async work
   * - calling `onConfirm` on success or `onCancel` to abort
   */
  renderEdit: (value: T, actions: InlineFieldEditActions) => ReactNode;

  /**
   * Whether clicking the view slot enters edit mode automatically.
   * Set to `false` when you want edit to be triggered only via the `onEdit`
   * callback inside `renderView` (e.g. an explicit edit-icon button).
   * @default true
   */
  clickToEdit?: boolean;

  /**
   * Show ✓ / ✗ action buttons beside the edit content.
   * Set to `false` when the edit content already has its own Save/Cancel UI.
   * @default true
   */
  showActions?: boolean;

  /**
   * When `true`, shows a loading spinner in place of the ✓ button.
   * Use this while an async save is in-flight.
   * @default false
   */
  isLoading?: boolean;

  /**
   * When `true`, the component stays in view mode permanently.
   * Click and `onEdit` are both suppressed.
   * @default false
   */
  disabled?: boolean;

  // ── Controlled mode ─────────────────────────────────────────────────────────

  /**
   * When provided, the parent fully controls whether edit mode is active.
   * Works together with `onEditingChange`.
   */
  isEditing?: boolean;

  /**
   * Called when `InlineField` wants to change the editing state.
   * Provide when using controlled mode (`isEditing` prop).
   */
  onEditingChange?: (editing: boolean) => void;

  /** Extra CSS class applied to the outermost wrapper. */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * `InlineField` — a thin view ↔ edit switcher.
 *
 * It owns **only** the toggle UI (hover state, click-to-edit, ✓/✗ buttons).
 * Validation, API calls, and error messages are the parent's responsibility.
 *
 * @example — minimal
 * ```tsx
 * <InlineField
 *   value={lead.email}
 *   renderEdit={(val, { onConfirm, onCancel }) => (
 *     <EmailForm defaultValue={val} onSubmit={onConfirm} onCancel={onCancel} />
 *   )}
 * />
 * ```
 *
 * @example — custom view + edit icon trigger
 * ```tsx
 * <InlineField
 *   value={lead.mobile}
 *   clickToEdit={false}
 *   renderView={(val, { onEdit }) => (
 *     <Flex gap={4} align="center">
 *       <Text>{val}</Text>
 *       <EditOutlined onClick={onEdit} />
 *     </Flex>
 *   )}
 *   renderEdit={(val, { onConfirm, onCancel }) => (
 *     <PhoneForm defaultValue={val} onSubmit={onConfirm} onCancel={onCancel} />
 *   )}
 * />
 * ```
 *
 * @example — controlled by parent
 * ```tsx
 * <InlineField
 *   value={lead.name}
 *   isEditing={isRowEditing}
 *   onEditingChange={setIsRowEditing}
 *   renderEdit={(val, { onConfirm, onCancel }) => <NameForm ... />}
 * />
 * ```
 */
export function InlineField<T = string>({
  value,
  renderView,
  renderEdit,
  clickToEdit = true,
  showActions = true,
  isLoading = false,
  disabled = false,
  isEditing: controlledIsEditing,
  onEditingChange,
  className,
}: InlineFieldProps<T>) {
  const { token } = theme.useToken();

  // Uncontrolled internal state — ignored when parent passes `isEditing`
  const [internalEditing, setInternalEditing] = useState(false);
  const formId = useId();

  const isControlled = controlledIsEditing !== undefined;
  const isEditing = isControlled ? controlledIsEditing : internalEditing;

  const setEditing = (next: boolean) => {
    if (!isControlled) setInternalEditing(next);
    onEditingChange?.(next);
  };

  const onEdit = () => {
    if (disabled) return;
    setEditing(true);
  };

  const onConfirm = () => setEditing(false);
  const onCancel = () => setEditing(false);

  // ── View Mode ──────────────────────────────────────────────────────────────

  if (!isEditing) {
    const viewContent = renderView ? (
      renderView(value, { onEdit })
    ) : (
      <Text type={disabled ? 'secondary' : undefined}>
        {String(value ?? '')}
      </Text>
    );

    return (
      <div
        className={className}
        style={
          {
            // display: 'flex',
            // alignItems: 'center',
            // gap: token.marginXXS,
            // borderRadius: token.borderRadius,
            // padding: `${token.paddingXXS}px ${token.paddingXS}px`,
            // cursor: disabled ? 'default' : clickToEdit ? 'pointer' : 'default',
            // transition: 'background-color 0.2s',
            // backgroundColor:
            //   isHovered && !disabled && clickToEdit
            //     ? token.colorFillQuaternary
            //     : 'transparent',
          }
        }
        // onMouseEnter={() => setIsHovered(true)}
        // onMouseLeave={() => setIsHovered(false)}
        onClick={clickToEdit && !disabled ? onEdit : undefined}
      >
        {viewContent}
      </div>
    );
  }

  // ── Edit Mode ──────────────────────────────────────────────────────────────

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: token.marginXS,
        width: '100%',
      }}
    >
      {/* Edit content fills remaining space */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {renderEdit(value, { onConfirm, onCancel, formId })}
      </div>

      {/* Action buttons — hidden via showActions=false when edit content has its own */}
      {showActions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            height: token.controlHeight,
          }}
        >
          {isLoading ? (
            <Spin
              indicator={
                <LoadingOutlined style={{ fontSize: token.fontSizeSM }} spin />
              }
            />
          ) : (
            <>
              {/* ✓ — native submit so RHF validates before onConfirm is called */}
              <Button
                type="text"
                size="small"
                htmlType="submit"
                form={formId}
                icon={<CheckOutlined style={{ color: token.colorSuccess }} />}
                aria-label="Save"
              />

              {/* ✗ */}
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined style={{ color: token.colorError }} />}
                onClick={onCancel}
                aria-label="Cancel"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
