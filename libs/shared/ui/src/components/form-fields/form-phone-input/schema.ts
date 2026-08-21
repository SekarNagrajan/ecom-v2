import {
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
} from 'libphonenumber-js/max';
import { z } from 'zod';

const INVALID_PHONE_NUMBER_MESSAGE = 'Enter a valid phone number';
const INVALID_MOBILE_NUMBER_MESSAGE = 'Enter a valid mobile number';
const INVALID_PHONE_NUMBER_LENGTH_MESSAGE = 'Phone number length is invalid';
const PHONE_NUMBER_TOO_LONG_MESSAGE = 'Phone number is too long';
const PHONE_NUMBER_TOO_SHORT_MESSAGE = 'Phone number is too short';
const PHONE_NUMBER_MOBILE_TYPE_MESSAGE = 'Enter a valid mobile number';
const REQUIRED_PHONE_NUMBER_MESSAGE = 'Phone number is required';

function getPhoneLengthValidationMessage(value: string) {
  const lengthValidationResult = validatePhoneNumberLength(value);

  switch (lengthValidationResult) {
    case 'TOO_SHORT':
      return PHONE_NUMBER_TOO_SHORT_MESSAGE;
    case 'TOO_LONG':
      return PHONE_NUMBER_TOO_LONG_MESSAGE;
    case 'INVALID_LENGTH':
      return INVALID_PHONE_NUMBER_LENGTH_MESSAGE;
    default:
      return null;
  }
}

function getPhoneNumberValidationMessage(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return REQUIRED_PHONE_NUMBER_MESSAGE;
  }

  const lengthMessage = getPhoneLengthValidationMessage(trimmedValue);
  if (lengthMessage) {
    return lengthMessage;
  }

  const phone = parsePhoneNumberFromString(trimmedValue);

  if (!phone?.isPossible() || !phone.isValid()) {
    return INVALID_PHONE_NUMBER_MESSAGE;
  }

  return null;
}

function getMobilePhoneValidationMessage(value: string) {
  const baseMessage = getPhoneNumberValidationMessage(value);

  if (baseMessage) {
    return baseMessage;
  }

  const phone = parsePhoneNumberFromString(value.trim());
  const phoneType = phone?.getType();

  if (phoneType === 'MOBILE' || phoneType === 'FIXED_LINE_OR_MOBILE') {
    return null;
  }

  return phoneType
    ? INVALID_MOBILE_NUMBER_MESSAGE
    : PHONE_NUMBER_MOBILE_TYPE_MESSAGE;
}

function buildRequiredPhoneSchema(validate: (value: string) => string | null) {
  return z
    .string({ error: REQUIRED_PHONE_NUMBER_MESSAGE })
    .trim()
    .superRefine((value, context) => {
      const message = validate(value);

      if (!message) {
        return;
      }

      context.addIssue({
        code: 'custom',
        message,
      });
    });
}

function buildOptionalPhoneSchema(validate: (value: string) => string | null) {
  return z
    .string({ error: INVALID_PHONE_NUMBER_MESSAGE })
    .trim()
    .superRefine((value, context) => {
      if (!value) {
        return;
      }

      const message = validate(value);

      if (!message || message === REQUIRED_PHONE_NUMBER_MESSAGE) {
        return;
      }

      context.addIssue({
        code: 'custom',
        message,
      });
    })
    .optional()
    .or(z.literal(''));
}

export const phoneE164Schema = buildRequiredPhoneSchema(
  getPhoneNumberValidationMessage
);

export const phoneE164SchemaOptional = buildOptionalPhoneSchema(
  getPhoneNumberValidationMessage
);

export const mobilePhoneE164Schema = buildRequiredPhoneSchema(
  getMobilePhoneValidationMessage
);

export const mobilePhoneE164SchemaOptional = buildOptionalPhoneSchema(
  getMobilePhoneValidationMessage
);

export type FormValues = z.infer<typeof phoneE164Schema>;
