import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`bg-white dark:bg-[#252526] rounded-lg shadow-xl max-w-2xl w-full ${className}`}>
          {title && (
            <Dialog.Title className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3e3e42]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#cccccc]">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Title>
          )}

          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}