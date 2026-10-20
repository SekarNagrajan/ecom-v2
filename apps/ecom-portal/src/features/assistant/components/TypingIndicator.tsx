// Modified by Sekar Nagarajan (2026-10-20 18:10)
import { AppIcon, Icons } from "../../../components/icons";
import { AssistantStatusChip } from "./AssistantStatusChip";

export function TypingIndicator() {
  return (
    <div className="assistant-row">
      <span className="assistant-avatar" aria-hidden>
        <AppIcon icon={Icons.wechatChat} size={15} />
      </span>
      <AssistantStatusChip />
    </div>
  );
}
