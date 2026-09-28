// Modified by Sekar Nagarajan (2026-09-28 14:57) — GWFC-8388 link to GWF legal pages
import { Checkbox, Flex, Typography } from "antd";
import { Controller, useFormContext } from "react-hook-form";

import { LEGAL_LINKS } from "../../../constants/legal-links";
import type { RegistrationFormData } from "../types/registration.schema";

const { Text, Title } = Typography;

const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function TermsStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<RegistrationFormData>();

  return (
    <Flex vertical gap={24} className="reg-step-body">
      <div className="reg-terms-box custom-scroll">
        <Title level={5} className="reg-page__title">
          Terms and Conditions
        </Title>
        <Text className="reg-terms-box__para">
          1. Acceptance of Terms: By registering for an account on the E-Com
          Portal, you agree to abide by the{" "}
          <a
            href={LEGAL_LINKS.websiteTermsOfUse.href}
            {...externalLinkProps}
          >
            {LEGAL_LINKS.websiteTermsOfUse.label}
          </a>
          .
        </Text>
        <Text className="reg-terms-box__para">
          2. Privacy Policy: We are committed to protecting your privacy. Your
          personal and company information will be handled in accordance with
          our{" "}
          <a href={LEGAL_LINKS.privacyPolicy.href} {...externalLinkProps}>
            {LEGAL_LINKS.privacyPolicy.label}
          </a>{" "}
          and applicable data protection laws.
        </Text>
        <Text className="reg-terms-box__para">
          3. Account Security: You are responsible for maintaining the
          confidentiality of your account credentials and for all activities
          that occur under your account.
        </Text>
        <Text className="reg-terms-box__para">
          4. Accurate Information: You agree to provide accurate, current, and
          complete information during the registration process and to update
          such information to keep it accurate, current, and complete.
        </Text>
      </div>

      <Flex vertical gap={8}>
        <Controller
          name="agreeToTerms"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <Checkbox
              {...field}
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
            >
              <span className="form-field-label">
                I agree to the{" "}
                <a
                  href={LEGAL_LINKS.websiteTermsOfUse.href}
                  {...externalLinkProps}
                  onClick={(e) => e.stopPropagation()}
                >
                  {LEGAL_LINKS.websiteTermsOfUse.label}
                </a>
                <Text type="danger"> *</Text>
              </span>
            </Checkbox>
          )}
        />
        {errors.agreeToTerms && (
          <Text type="danger" className="form-field-error">
            {errors.agreeToTerms.message}
          </Text>
        )}
      </Flex>
    </Flex>
  );
}
