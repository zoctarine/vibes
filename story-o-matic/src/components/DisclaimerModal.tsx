import { AlertTriangle } from 'lucide-react';
import { Modal } from './common/Modal';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function DisclaimerModal({ isOpen, onClose, onContinue }: DisclaimerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Content Disclaimer">
      <div className="space-y-4 text-gray-600 dark:text-gray-400">
        <p>
          <AlertTriangle className="inline mr-2 text-yellow-500" />
          All story content is generated in real-time using Google's Gemini AI. We have no control over or responsibility for the generated content.
        </p>
        <p>
          The content may be unpredictable and could potentially include mature themes, unexpected plot developments, or content that might not be suitable for all audiences.
        </p>
        <p className="text-sm">
          By continuing, you acknowledge that you understand and accept these terms. For more information about Gemini AI, please review{' '}
          <a 
            href="https://ai.google.dev/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-story-600 dark:text-story-400 hover:underline"
          >
            Google's AI Terms of Service
          </a>.
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => {
            onContinue();
            onClose();
          }}
          className="px-4 py-2 bg-story-600 text-white rounded-md 
                   hover:bg-story-700 transition-colors"
        >
          I Understand, Continue
        </button>
      </div>
    </Modal>
  );
}