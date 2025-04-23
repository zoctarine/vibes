import ReactMarkdown from 'react-markdown';
import { Modal } from './common/Modal';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string | null;
  isLoading: boolean;
}

export function SummaryModal({ isOpen, onClose, summary, isLoading }: SummaryModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Story Summary">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-gray-400 dark:text-gray-500">
            Generating summary...
          </div>
        </div>
      ) : summary ? (
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400 text-center">
          No summary available
        </div>
      )}
    </Modal>
  );
}