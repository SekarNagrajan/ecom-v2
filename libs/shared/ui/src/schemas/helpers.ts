import z from 'zod';

interface FieldStateOptions {
  nullable?: boolean;
  optional?: boolean;
}

interface TextFieldOptions extends FieldStateOptions {
  allowEmpty?: boolean;
  invalidMessage?: string;
  message?: string;
  requiredMessage?: string;
  trim?: boolean;
}

interface NumberFieldOptions extends FieldStateOptions {
  integer?: boolean;
  integerMessage?: string;
  invalidMessage?: string;
  message?: string;
  max?: number;
  maxMessage?: string;
  min?: number;
  minMessage?: string;
  nonNegative?: boolean;
  nonNegativeMessage?: string;
  positive?: boolean;
  positiveMessage?: string;
  requiredMessage?: string;
}

interface SelectFieldOptions extends FieldStateOptions {
  invalidMessage?: string;
  message?: string;
  requiredMessage?: string;
}

interface IdFieldOptions extends FieldStateOptions {
  invalidMessage?: string;
  message?: string;
  requiredMessage?: string;
}

interface BooleanFieldOptions extends FieldStateOptions {
  invalidMessage?: string;
  message?: string;
  requiredMessage?: string;
}

type ApplyFieldState<
  TSchema extends z.ZodType,
  TOptions extends FieldStateOptions | undefined
> = TOptions extends { nullable: true }
  ? TOptions extends { optional: true }
    ? z.ZodOptional<z.ZodNullable<TSchema>>
    : z.ZodNullable<TSchema>
  : TOptions extends { optional: true }
  ? z.ZodOptional<TSchema>
  : TSchema;

function isMissingInput(input: unknown) {
  return input === undefined || input === null;
}

function normalizeLabel(label: string) {
  const trimmedLabel = label.trim();
  const firstCharacter = trimmedLabel[0];
  const secondCharacter = trimmedLabel[1];
  const startsWithAcronym =
    firstCharacter?.toUpperCase() === firstCharacter &&
    firstCharacter?.toLowerCase() !== firstCharacter &&
    secondCharacter?.toUpperCase() === secondCharacter &&
    secondCharacter?.toLowerCase() !== secondCharacter;

  if (!trimmedLabel || startsWithAcronym) {
    return trimmedLabel;
  }

  return `${firstCharacter ?? ''}${trimmedLabel.slice(1)}`.replace(
    /^./,
    (character) => character.toLowerCase()
  );
}

export function getRequiredFieldMessage(label: string) {
  return `${label.trim()} is required`;
}

export function getInvalidFieldMessage(label: string) {
  return `Enter a valid ${normalizeLabel(label)}`;
}

export function getInvalidSelectionMessage(label: string) {
  return `Select a valid ${normalizeLabel(label)}`;
}

function applyFieldState<
  TSchema extends z.ZodType,
  TOptions extends FieldStateOptions | undefined
>(schema: TSchema, options?: TOptions) {
  let result: z.ZodType = schema;

  if (options?.nullable) {
    result = result.nullable();
  }

  if (options?.optional) {
    result = result.optional();
  }

  return result as ApplyFieldState<TSchema, TOptions>;
}

export function textField<TOptions extends TextFieldOptions | undefined>(
  label: string,
  options?: TOptions
) {
  const textOptions: TextFieldOptions = options ?? {};
  const isRequired =
    !textOptions.allowEmpty && !textOptions.optional && !textOptions.nullable;
  const requiredMessage =
    textOptions.requiredMessage ??
    textOptions.message ??
    getRequiredFieldMessage(label);
  const invalidMessage =
    textOptions.invalidMessage ??
    textOptions.message ??
    (isRequired ? requiredMessage : getInvalidFieldMessage(label));

  let schema = z.string({
    error: (issue) => {
      if (isMissingInput(issue.input)) {
        return requiredMessage;
      }

      return invalidMessage;
    },
  });

  if (textOptions.trim !== false) {
    schema = schema.trim();
  }

  if (isRequired) {
    schema = schema.min(1, { message: requiredMessage });
  }

  return applyFieldState(schema, options);
}

export function numberField<TOptions extends NumberFieldOptions | undefined>(
  label: string,
  options?: TOptions
) {
  const numberOptions: NumberFieldOptions = options ?? {};
  const requiredMessage =
    numberOptions.requiredMessage ??
    numberOptions.message ??
    getRequiredFieldMessage(label);
  const invalidMessage =
    numberOptions.invalidMessage ??
    numberOptions.message ??
    getInvalidFieldMessage(label);
  const constraintMessage = numberOptions.message;

  let schema = z.number({
    error: (issue) => {
      if (isMissingInput(issue.input)) {
        return requiredMessage;
      }

      return invalidMessage;
    },
  });

  if (numberOptions.integer) {
    schema = schema.int(
      numberOptions.integerMessage ??
        constraintMessage ??
        `${label.trim()} must be a whole number`
    );
  }

  if (numberOptions.positive) {
    schema = schema.gt(
      0,
      numberOptions.positiveMessage ??
        constraintMessage ??
        `${label.trim()} must be greater than 0`
    );
  }

  if (numberOptions.nonNegative) {
    schema = schema.min(
      0,
      numberOptions.nonNegativeMessage ??
        constraintMessage ??
        `${label.trim()} cannot be negative`
    );
  }

  if (numberOptions.min !== undefined) {
    schema = schema.min(
      numberOptions.min,
      numberOptions.minMessage ??
        constraintMessage ??
        `${label.trim()} must be at least ${numberOptions.min}`
    );
  }

  if (numberOptions.max !== undefined) {
    schema = schema.max(
      numberOptions.max,
      numberOptions.maxMessage ??
        constraintMessage ??
        `${label.trim()} must be at most ${numberOptions.max}`
    );
  }

  return applyFieldState(schema, options);
}

export function selectField<
  TValues extends readonly [string, ...string[]],
  TOptions extends SelectFieldOptions | undefined
>(values: TValues, label: string, options?: TOptions) {
  const selectOptions: SelectFieldOptions = options ?? {};
  const requiredMessage =
    selectOptions.requiredMessage ??
    selectOptions.message ??
    getRequiredFieldMessage(label);
  const invalidMessage =
    selectOptions.invalidMessage ??
    selectOptions.message ??
    getInvalidSelectionMessage(label);

  const schema = z.enum(values, {
    error: (issue) => {
      if (isMissingInput(issue.input) || issue.input === '') {
        return requiredMessage;
      }

      return invalidMessage;
    },
  });

  return applyFieldState(schema, options);
}

export function idField<TOptions extends IdFieldOptions | undefined>(
  label: string,
  options?: TOptions
) {
  const idOptions: IdFieldOptions = options ?? {};
  const requiredMessage =
    idOptions.requiredMessage ??
    idOptions.message ??
    getRequiredFieldMessage(label);
  const invalidMessage =
    idOptions.invalidMessage ??
    idOptions.message ??
    getInvalidSelectionMessage(label);

  const schema = z.union(
    [
      textField(label, {
        invalidMessage,
        requiredMessage,
      }),
      numberField(label, {
        invalidMessage,
        requiredMessage,
      }),
    ],
    {
      error: (issue) => {
        if (isMissingInput(issue.input) || issue.input === '') {
          return requiredMessage;
        }

        return invalidMessage;
      },
    }
  );

  return applyFieldState(schema, options);
}

export function booleanField<TOptions extends BooleanFieldOptions | undefined>(
  label: string,
  options?: TOptions
) {
  const booleanOptions: BooleanFieldOptions = options ?? {};
  const requiredMessage =
    booleanOptions.requiredMessage ??
    booleanOptions.message ??
    getRequiredFieldMessage(label);
  const invalidMessage =
    booleanOptions.invalidMessage ??
    booleanOptions.message ??
    getInvalidSelectionMessage(label);

  const schema = z.boolean({
    error: (issue) => {
      if (isMissingInput(issue.input)) {
        return requiredMessage;
      }

      return invalidMessage;
    },
  });

  return applyFieldState(schema, options);
}
