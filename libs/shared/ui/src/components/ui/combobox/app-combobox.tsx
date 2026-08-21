import { DownOutlined } from '@ant-design/icons';
import { Button, Popover, Select, Spin, theme } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { useEffect, useRef, useState } from 'react';

import { usePopupContainer } from '../../../hooks';
import { useDebouncedCallback } from '../../../hooks/use-debounced-callback';
import type { AppComboboxProps, ComboboxOption } from './types';

// Custom tokens registered by `theme-builder.ts` so non-AntD-Input controls
// (the combobox trigger here, rich-text editor elsewhere) can match the
// Input/Select/InputNumber/DatePicker surface and radius treatment.
type FieldSurfaceToken = ReturnType<typeof theme.useToken>['token'] & {
  colorFieldBg?: string;
  colorFieldBorder?: string;
  colorFieldBorderHover?: string;
  colorFieldBorderActive?: string;
  fieldActiveShadow?: string;
  borderRadiusField?: number;
};

function extractStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function extractOptionValue(value: unknown): string | number | null {
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (value != null) return String(value);
  return null;
}

function hasDisplayValue(value: unknown): value is string | number {
  return !(
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.length === 0)
  );
}

export function AppCombobox({
  value: propValue,
  onChange,
  options: staticOptions,
  fetchOptions,
  fetchOnOpen = false,
  minChars = 3,
  debounceTimeout = 300,
  allowFreeText = false,
  fieldNames,
  onOptionsFetched,
  onOpenChange,
  placeholder = 'Select...',
  disabled,
  loading: externalLoading = false,
  width,
  initialDisplayLabel,
  prefix,
  suffix,
  renderTrigger,
  popoverProps,
  selectProps,
}: AppComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [asyncOptions, setAsyncOptions] = useState<DefaultOptionType[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const fetchIdRef = useRef(0);
  const popupContainerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { token } = theme.useToken();
  const fieldToken = token as FieldSurfaceToken;
  const fieldBgColor = fieldToken.colorFieldBg ?? token.colorBgContainer;
  const fieldBorderColor = fieldToken.colorFieldBorder ?? token.colorBorder;
  const fieldHoverBorderColor =
    fieldToken.colorFieldBorderHover ?? token.colorPrimaryHover;
  const fieldActiveBorderColor =
    fieldToken.colorFieldBorderActive ?? token.colorPrimary;
  const fieldActiveShadow = fieldToken.fieldActiveShadow;
  const fieldBorderRadius = fieldToken.borderRadiusField ?? token.borderRadius;

  // Disabled-state colors. Mirrors the treatment AntD applies to native
  // `Input` / `Select` / `InputNumber` / `DatePicker` when they receive
  // `disabled` — same recessed fill + muted text/icons — so the combobox
  // trigger is visually indistinguishable from a disabled native field.
  const fieldDisabledBg = token.colorBgContainerDisabled;
  const fieldDisabledText = token.colorTextDisabled;

  const getPopupContainer = usePopupContainer();

  const isAsync = typeof fetchOptions === 'function';
  const isLoading = internalLoading || externalLoading;
  const hasStaticOptions = (staticOptions?.length ?? 0) > 0;
  const labelKey = fieldNames?.label ?? 'label';
  const valueKey = fieldNames?.value ?? 'value';
  const [hasAttemptedInitialFetch, setHasAttemptedInitialFetch] =
    useState(false);

  // Sync external value resets
  useEffect(() => {
    if (propValue === null) {
      setSelectedLabel(null);
    }
  }, [propValue]);

  // Focus the search input when popover opens
  useEffect(() => {
    if (open && popupContainerRef.current) {
      requestAnimationFrame(() => {
        const input =
          popupContainerRef.current?.querySelector<HTMLInputElement>('input');
        input?.focus();
      });
    }
  }, [open]);

  const runAsyncLoad = async (
    text: string,
    { allowEmptySearch = false }: { allowEmptySearch?: boolean } = {}
  ) => {
    if (
      !fetchOptions ||
      (!allowEmptySearch && (text.length === 0 || text.length < minChars))
    ) {
      setAsyncOptions([]);
      setInternalLoading(false);
      return;
    }

    const id = ++fetchIdRef.current;
    setInternalLoading(true);

    try {
      const result = await fetchOptions(text);
      if (id === fetchIdRef.current) {
        setAsyncOptions(result);
        onOptionsFetched?.(result);
      }
    } catch {
      if (id === fetchIdRef.current) {
        setAsyncOptions([]);
      }
    } finally {
      if (id === fetchIdRef.current) {
        setInternalLoading(false);
      }
    }
  };

  // ── Async fetch (debounced) ──
  const loadOptions = useDebouncedCallback((text: string) => {
    void runAsyncLoad(text);
  }, debounceTimeout);

  // ── Search handler ──
  const handleSearch = (val: string) => {
    setSearchValue(val);

    if (val.length === 0 && isAsync && fetchOnOpen && !hasStaticOptions) {
      setHasAttemptedInitialFetch(true);
      void runAsyncLoad('', { allowEmptySearch: true });
      return;
    }

    if (isAsync) {
      loadOptions(val);
    }
  };

  // ── Selection handler ──
  const handleSelect = (val: string, option: DefaultOptionType) => {
    const isNew = option.__isNew__ === true;
    const rawLabel = isNew ? val : option[labelKey] ?? option.label ?? val;
    const label = extractStringValue(rawLabel);
    const rawValue = isNew ? val : option[valueKey] ?? option.value ?? val;
    const optValue = extractOptionValue(rawValue) ?? val;

    const newOption: ComboboxOption = {
      ...option,
      value: optValue ?? val,
      label,
      __isNew__: isNew || undefined,
    };

    setSelectedLabel(label);
    onChange?.(newOption.value as string | number, newOption);
    setOpen(false);
    setSearchValue('');
    if (isAsync) setAsyncOptions([]);
  };

  // ── Resolve options to display ──
  const getDisplayOptions = () => {
    // In async mode, show fetched results when available; otherwise fall back
    // to staticOptions so callers can provide an initial/default list.
    const baseOptions = isAsync
      ? asyncOptions.length > 0 || searchValue.length >= minChars
        ? asyncOptions
        : staticOptions ?? []
      : staticOptions ?? [];

    const mapped = baseOptions.map((opt) => ({
      ...opt,
      label: opt[labelKey] ?? opt.label,
      value: opt[valueKey] ?? opt.value,
    }));

    if (allowFreeText && searchValue && searchValue.length >= 1) {
      const exactMatch = mapped.find(
        (o) => String(o.label).toLowerCase() === searchValue.toLowerCase()
      );
      if (!exactMatch) {
        return [
          {
            label: `Add "${searchValue}"`,
            value: searchValue,
            __isNew__: true,
          },
          ...mapped,
        ];
      }
    }
    return mapped;
  };

  // ── Not-found content ──
  const getNotFoundContent = () => {
    if (isLoading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: token.controlHeight,
            padding: token.paddingSM,
          }}
        >
          <Spin size="small" />
        </div>
      );
    }

    if (
      isAsync &&
      searchValue.length < minChars &&
      !(fetchOnOpen && hasAttemptedInitialFetch && !hasStaticOptions)
    ) {
      return (
        <div
          style={{
            padding: token.paddingSM,
            textAlign: 'center',
            color: token.colorTextDescription,
            fontSize: token.fontSizeSM,
          }}
        >
          Type at least {minChars} characters to search
        </div>
      );
    }

    return (
      <div
        style={{
          padding: token.paddingSM,
          textAlign: 'center',
          color: token.colorTextDescription,
          fontSize: token.fontSizeSM,
        }}
      >
        No results found
      </div>
    );
  };

  // ── Build showSearch config ──
  const getShowSearchConfig = () => {
    const userShowSearch = selectProps?.showSearch;

    if (isAsync) {
      // Async mode: controlled search, no client-side filter
      const base = typeof userShowSearch === 'object' ? userShowSearch : {};
      return {
        ...base,
        searchValue,
        onSearch: handleSearch,
        filterOption: false,
      };
    }

    // Local mode: client-side filtering
    if (userShowSearch !== undefined) {
      // User provided their own config, merge our onSearch for tracking
      const base = typeof userShowSearch === 'object' ? userShowSearch : {};
      return {
        ...base,
        searchValue,
        onSearch: handleSearch,
      };
    }

    // Default: filter by label
    return {
      searchValue,
      onSearch: handleSearch,
    };
  };

  // ── Display text ──
  const displayText =
    selectedLabel ??
    (hasDisplayValue(propValue)
      ? initialDisplayLabel ?? String(propValue)
      : null);

  // ── Popover content ──
  const popoverContent = (
    <div ref={popupContainerRef} style={{ position: 'relative' }}>
      <Select<string>
        autoFocus
        showSearch={getShowSearchConfig()}
        defaultActiveFirstOption
        open
        value={null}
        onSelect={handleSelect}
        options={getDisplayOptions()}
        placeholder={placeholder}
        notFoundContent={getNotFoundContent()}
        suffix={null}
        variant="borderless"
        getPopupContainer={(triggerNode) =>
          popupContainerRef.current ?? getPopupContainer(triggerNode)
        }
        popupMatchSelectWidth
        styles={{
          root: {
            width: '100%',
            border: `1px solid ${token.colorPrimary}`,
          },
        }}
        loading={isLoading}
        {...selectProps}
        // Ensure our showSearch always wins over selectProps.showSearch
        // (we already merged it above via getShowSearchConfig)
      />
    </div>
  );

  // ── Default trigger button ──
  // Visually mirrors the AntD Input/Select trigger (same border color, radius
  // and active ring) by reading the shared field tokens registered in
  // theme-builder.ts. `prefix`/`suffix` render INSIDE the trigger as inline
  // adornments — same look as AntD `Input`'s `prefix` slot, not as separated
  // `Space.Addon` blocks. When `disabled`, every painted surface (fill,
  // display text, placeholder, prefix/suffix, chevron) is rerouted to the
  // global disabled tokens so the trigger matches a disabled native field.
  const triggerBorderColor = open ? fieldActiveBorderColor : fieldBorderColor;
  const triggerBgColor = disabled ? fieldDisabledBg : fieldBgColor;
  const displayTextColor = disabled
    ? fieldDisabledText
    : displayText
    ? token.colorText
    : token.colorTextPlaceholder;
  const adornmentColor = disabled
    ? fieldDisabledText
    : token.colorTextDescription;
  const chevronColor = disabled ? fieldDisabledText : token.colorTextQuaternary;
  const adornmentStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    flex: '0 0 auto',
    color: adornmentColor,
  } as const;
  const defaultTrigger = (
    <Button
      ref={buttonRef}
      disabled={disabled}
      style={{
        padding: token.paddingSM,
        width: width ?? '100%',
        display: 'flex',
        alignItems: 'center',
        gap: token.marginXS,
        overflow: 'hidden',
        background: triggerBgColor,
        borderColor: triggerBorderColor,
        borderRadius: fieldBorderRadius,
        boxShadow: open && fieldActiveShadow ? fieldActiveShadow : undefined,
      }}
      onMouseEnter={(event) => {
        if (disabled || open) return;
        event.currentTarget.style.borderColor = fieldHoverBorderColor;
      }}
      onMouseLeave={(event) => {
        if (disabled || open) return;
        event.currentTarget.style.borderColor = fieldBorderColor;
      }}
    >
      {prefix ? (
        <span aria-hidden style={adornmentStyle}>
          {prefix}
        </span>
      ) : null}
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          textAlign: 'left',
          color: displayTextColor,
        }}
      >
        {displayText ?? placeholder}
      </span>
      {suffix ? (
        <span aria-hidden style={adornmentStyle}>
          {suffix}
        </span>
      ) : null}
      <DownOutlined
        style={{
          fontSize: token.fontSizeSM,
          color: chevronColor,
          flex: '0 0 auto',
        }}
      />
    </Button>
  );

  // ── Resolve trigger element ──
  // Note: No `onClick` needed — the Popover's `trigger="click"` handles open/close
  const triggerElement = renderTrigger
    ? renderTrigger({
        displayText,
        value: propValue ?? null,
        open,
        disabled,
        ref: buttonRef,
      })
    : defaultTrigger;

  return (
    <Popover
      open={open}
      onOpenChange={(visible) => {
        setOpen(visible);
        onOpenChange?.(visible);
        if (visible) {
          if (isAsync && fetchOnOpen && !hasStaticOptions) {
            setHasAttemptedInitialFetch(true);
            void runAsyncLoad('', { allowEmptySearch: true });
          }
          return;
        }

        fetchIdRef.current += 1;
        setInternalLoading(false);
        setHasAttemptedInitialFetch(false);
        if (!visible) {
          setSearchValue('');
          if (isAsync) setAsyncOptions([]);
        }
      }}
      trigger="click"
      arrow
      destroyOnHidden
      content={popoverContent}
      placement="bottom"
      {...popoverProps}
      styles={{
        ...(typeof popoverProps?.styles === 'object'
          ? popoverProps.styles
          : {}),
        container: {
          padding: 0,
          minWidth: buttonRef.current?.clientWidth,
          maxWidth: '90vw',
          ...(typeof popoverProps?.styles === 'object'
            ? popoverProps.styles.container
            : {}),
        },
      }}
    >
      {triggerElement}
    </Popover>
  );
}
