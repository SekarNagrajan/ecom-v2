import { useAntdBreakpoint } from '../../../hooks';
import { AppDrawer } from '../../ui/dialog';
import {
  useEmailCenterActions,
  useEmailCenterStore,
} from '../context/email-center-store-context';
import { getEmailComposerTitle } from '../utils/email-compose-helpers';
import { buildComposerFormKey } from '../utils/email-composer-key';
import { EmailComposerForm } from './email-composer-form';
import type { EmailComposerModalProps } from './email-composer-modal.types';

export function EmailComposerModal({
  recipientOptions,
  attachmentConstraints,
  onSubmit,
  onDraftChange,
  onDraftAutoSaveRequested,
  audioDictation,
  dictationTooltip,
}: EmailComposerModalProps) {
  const { isMobile } = useAntdBreakpoint();
  const composer = useEmailCenterStore((state) => state.composer);
  const isComposerSubmitting = useEmailCenterStore(
    (state) => state.isComposerSubmitting
  );
  const draftAutoSaveDebounceMs = useEmailCenterStore(
    (state) => state.draftAutoSaveDebounceMs
  );

  const actions = useEmailCenterActions();

  const formKey = buildComposerFormKey({
    mode: composer.context.mode,
    threadId: composer.context.threadId,
    messageId: composer.context.messageId,
    initialDraft: composer.initialDraft,
  });

  return (
    <AppDrawer
      open={composer.open}
      onClose={() => actions.closeComposer()}
      title={getEmailComposerTitle(composer.context)}
      dialogSize={isMobile ? 'fullscreen' : 'md'}
      destroyOnHidden
      maskClosable={false}
    >
      <EmailComposerForm
        key={formKey}
        context={composer.context}
        initialDraft={composer.initialDraft}
        recipientOptions={recipientOptions}
        attachmentConstraints={attachmentConstraints}
        draftAutoSaveDebounceMs={draftAutoSaveDebounceMs}
        submitting={isComposerSubmitting}
        onClose={() => actions.closeComposer()}
        onSubmit={onSubmit}
        onDraftChange={onDraftChange}
        onDraftAutoSaveRequested={onDraftAutoSaveRequested}
        audioDictation={audioDictation}
        dictationTooltip={dictationTooltip}
      />
    </AppDrawer>
  );
}
