// Modified by Sekar Nagarajan (2026-09-28 14:57) — GWFC-8388 link to GWF legal pages
import { Checkbox, Flex, Typography } from "antd";
import { Controller, useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { LEGAL_LINKS } from "../../../constants/legal-links";
import type { RegistrationFormData } from "../types/registration.schema";

const { Text, Title } = Typography;

const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function TermsStep() {
  const { t } = useTranslation(["registration", "common"]);
  const {
    control,
    formState: { errors },
  } = useFormContext<RegistrationFormData>();

  return (
    <Flex vertical gap={24} className="reg-step-body">
      <div className="reg-terms-box custom-scroll">
        <Title level={5} className="reg-page__title">
          {t("terms.heading")}
        </Title>
        <Text className="reg-terms-box__para">
          <Trans
            i18nKey="terms.paragraphs.acceptance"
            ns="registration"
            components={{
              termsLink: (
                <a
                  href={LEGAL_LINKS.websiteTermsOfUse.href}
                  {...externalLinkProps}
                />
              ),
            }}
          />
        </Text>
        <Text className="reg-terms-box__para">
          <Trans
            i18nKey="terms.paragraphs.privacy"
            ns="registration"
            components={{
              privacyLink: (
                <a href={LEGAL_LINKS.privacyPolicy.href} {...externalLinkProps} />
              ),
            }}
          />
        </Text>
        <Text className="reg-terms-box__para">
          {t("terms.paragraphs.security")}
        </Text>
        <Text className="reg-terms-box__para">
          {t("terms.paragraphs.accurate")}
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
                <Trans
                  i18nKey="terms.agree"
                  ns="registration"
                  components={{
                    termsLink: (
                      <a
                        href={LEGAL_LINKS.websiteTermsOfUse.href}
                        {...externalLinkProps}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ),
                  }}
                />
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
