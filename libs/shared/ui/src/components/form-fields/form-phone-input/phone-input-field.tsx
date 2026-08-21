import { Input, type InputRef } from 'antd';
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/min';
import React, { useRef, useState } from 'react';
import type { FieldValues } from 'react-hook-form';

import { getA11yProps } from '../common/helper';
import { CountrySelect } from './country-select';
import {
  formatDigits,
  MAX_PHONE_INPUT_DIGITS,
  parseFromDigits,
  toPhoneInputState,
} from './helper';
import type { PhoneInputFieldProps } from './types';

function isDigit(character: string | undefined) {
  return !!character && /\d/.test(character);
}

function removeDigitAtIndex(value: string, index: number) {
  return value.slice(0, index) + value.slice(index + 1);
}

function getDisplayPositionForDigitCount(display: string, digitCount: number) {
  if (digitCount <= 0) {
    return 0;
  }

  let seenDigits = 0;

  for (let index = 0; index < display.length; index += 1) {
    if (isDigit(display[index])) {
      seenDigits += 1;
    }

    if (seenDigits === digitCount) {
      return index + 1;
    }
  }

  return display.length;
}

export const PhoneInputField = <T extends FieldValues>({
  field,
  disabled,
  emptyValueCountry,
  suffix,
  id,
  error,
  required,
  autoComplete,
  inputMode,
  maxLength,
  ...rest
}: PhoneInputFieldProps<T>) => {
  const { value, onChange, onBlur, ref: rhfRef } = field;
  const inputRef = useRef<InputRef>(null);
  const normalizedValue = typeof value === 'string' ? value : '';
  const [emptyFieldCountryOverride, setEmptyFieldCountryOverride] =
    useState<CountryCode | null>(null);
  const { country, digits } = toPhoneInputState(normalizedValue, {
    emptyValueCountry: emptyFieldCountryOverride ?? emptyValueCountry,
  });

  /**
   * Format for display
   */
  const displayValue = formatDigits(digits, country);
  const maxDisplayLength = formatDigits(
    '9'.repeat(MAX_PHONE_INPUT_DIGITS),
    country
  ).length;
  const resolvedMaxLength =
    maxLength === undefined
      ? maxDisplayLength
      : Math.min(maxLength, maxDisplayLength);
  const visualSuffix = suffix ?? <span />;

  const refocusInput = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    });
  };

  const setCaretPosition = (position: number) => {
    requestAnimationFrame(() => {
      inputRef.current?.input?.setSelectionRange(position, position);
    });
  };

  const updateDigitsValue = (
    nextDigits: string,
    nextCountry: CountryCode,
    nextCaretPosition?: number
  ) => {
    setEmptyFieldCountryOverride(nextCountry);

    if (!nextDigits) {
      onChange('');

      if (nextCaretPosition !== undefined) {
        setCaretPosition(nextCaretPosition);
      }

      return;
    }

    const { e164 } = parseFromDigits(nextDigits, nextCountry);
    onChange(e164);

    if (nextCaretPosition !== undefined) {
      setCaretPosition(nextCaretPosition);
    }
  };

  // Handle Country Selection
  const handleCountryChange = (newCountry: CountryCode) => {
    if (!digits) {
      setEmptyFieldCountryOverride(newCountry);
      onChange('');
      refocusInput();
      return;
    }

    const nextDigits = digits.slice(0, MAX_PHONE_INPUT_DIGITS);
    updateDigitsValue(nextDigits, newCountry);
    refocusInput();
  };

  // Handle Typing
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextDigits = e.target.value
      .replace(/\D/g, '')
      .slice(0, MAX_PHONE_INPUT_DIGITS);

    updateDigitsValue(nextDigits, country);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    let pasted = e.clipboardData.getData('text').trim();
    if (!pasted) return;

    // Normalize 00 prefix
    if (pasted.startsWith('00')) {
      pasted = '+' + pasted.slice(2);
    }

    const phone =
      parsePhoneNumberFromString(pasted) ??
      parsePhoneNumberFromString(pasted, country);

    if (!phone) return;

    e.preventDefault();

    const nextCountry = phone.country || country;
    const nextDigits = phone.nationalNumber
      .replace(/\D/g, '')
      .slice(0, MAX_PHONE_INPUT_DIGITS);

    updateDigitsValue(nextDigits, nextCountry);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace' && e.key !== 'Delete') {
      return;
    }

    const input = e.currentTarget;
    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? selectionStart;

    if (selectionStart !== selectionEnd || !displayValue) {
      return;
    }

    if (e.key === 'Backspace') {
      const previousCharacter = displayValue[selectionStart - 1];

      if (isDigit(previousCharacter)) {
        return;
      }

      const digitsBeforeCaret = displayValue
        .slice(0, selectionStart)
        .replace(/\D/g, '').length;
      const digitIndexToRemove = digitsBeforeCaret - 1;

      if (digitIndexToRemove < 0) {
        return;
      }

      e.preventDefault();

      const nextDigits = removeDigitAtIndex(digits, digitIndexToRemove);
      const nextDisplayValue = formatDigits(nextDigits, country);
      const nextCaretPosition = getDisplayPositionForDigitCount(
        nextDisplayValue,
        digitIndexToRemove
      );

      updateDigitsValue(nextDigits, country, nextCaretPosition);
      return;
    }

    const nextCharacter = displayValue[selectionStart];

    if (isDigit(nextCharacter)) {
      return;
    }

    const digitsBeforeCaret = displayValue
      .slice(0, selectionStart)
      .replace(/\D/g, '').length;
    const digitIndexToRemove = digitsBeforeCaret;

    if (digitIndexToRemove >= digits.length) {
      return;
    }

    e.preventDefault();

    const nextDigits = removeDigitAtIndex(digits, digitIndexToRemove);
    const nextDisplayValue = formatDigits(nextDigits, country);
    const nextCaretPosition = getDisplayPositionForDigitCount(
      nextDisplayValue,
      digitIndexToRemove
    );

    updateDigitsValue(nextDigits, country, nextCaretPosition);
  };

  return (
    <Input
      placeholder="Phone number"
      {...rest}
      {...getA11yProps({ id, error, required, autoComplete })}
      disabled={disabled}
      // Merge refs so we can focus input programmatically AND let RHF register it
      ref={(node) => {
        inputRef.current = node;
        rhfRef(node?.input);
      }}
      inputMode={inputMode ?? 'tel'}
      maxLength={resolvedMaxLength}
      autoComplete={autoComplete ?? 'off'}
      value={displayValue}
      // Country flag + dial-code combobox lives in the Input's native prefix
      // slot so it shares the input's background and border (no `Space.Addon`
      // gray chip / extra border on the left). The combobox renders its own
      // popover-anchored trigger button, which fits inline alongside the
      // phone-number text.
      //
      // The wrapper span swallows pointer-down events from anywhere in the
      // country-picker hit area:
      //   - `preventDefault()` blocks the browser's default focus shift to
      //     the phone input on click.
      //   - `stopPropagation()` keeps the event from reaching AntD's
      //     `Input.affix-wrapper` mousedown handler, which would otherwise
      //     refocus the phone input and race with `AppCombobox`'s
      //     "focus the search field" effect — the symptom reported was the
      //     popover opening but the search bar not receiving focus when the
      //     user clicked just outside the flag itself. Click events still
      //     bubble normally so the popover opens as expected.
      prefix={
        <span
          style={{ display: 'inline-flex', alignItems: 'center' }}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <CountrySelect
            value={country}
            onChange={handleCountryChange}
            disabled={disabled}
          />
        </span>
      }
      suffix={visualSuffix}
      onChange={handleTextChange}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
    />
  );
};
