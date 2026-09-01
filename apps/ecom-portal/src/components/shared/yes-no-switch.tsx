// Created by Sekar Nagarajan (2026-09-01 16:00)
import { AppIcon, Icons } from "../icons";

const SWITCH_ICON_SIZE = 16;

/** Shared class: off = primary cancel, on = white tick. */
export const FORM_YES_NO_SWITCH_CLASS = "form-yes-no-switch";

export const yesNoSwitchInner = {
  checkedChildren: <AppIcon icon={Icons.check} size={SWITCH_ICON_SIZE} />,
  unCheckedChildren: <AppIcon icon={Icons.x} size={SWITCH_ICON_SIZE} />,
};
