import { Modal } from './common/Modal';
import { StorySettings } from '../types/story';
import { StorySetup } from './StorySetup';

interface StorySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: StorySettings) => void;
  initialSettings: StorySettings;
}

export function StorySettingsModal({ isOpen, onClose, onSave, initialSettings }: StorySettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Story Settings">
      <div className="space-y-6">
        <StorySetup 
          initialSettings={initialSettings}
          onComplete={onSave}
          onCancel={onClose}
          isEditing={true}
        />
      </div>
    </Modal>
  );
}