import { X } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { StorySettings } from '../types/story';
import { formatPerspective, formatGender, formatLanguage } from '../utils/formatUtils';

interface StoryInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StorySettings;
}

export function StoryInfoModal({ isOpen, onClose, settings }: StoryInfoModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-[#252526] rounded-lg shadow-xl max-w-md w-full">
          <Dialog.Title className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3e3e42]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#cccccc]">
              Story Settings
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Title>
          
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Genre</h4>
                <p className="mt-1 text-gray-900 dark:text-[#cccccc]">{settings.genre}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Narrative Perspective</h4>
                <p className="mt-1 text-gray-900 dark:text-[#cccccc]">{formatPerspective(settings.perspective)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Protagonist</h4>
                <p className="mt-1 text-gray-900 dark:text-[#cccccc]">{formatGender(settings.protagonistGender)}</p>
              </div>
              
              {settings.styleInspiration && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Writing Style Inspiration</h4>
                  <p className="mt-1 text-gray-900 dark:text-[#cccccc]">{settings.styleInspiration}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Language</h4>
                <p className="mt-1 text-gray-900 dark:text-[#cccccc]">{formatLanguage(settings.language)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end p-4 border-t border-gray-200 dark:border-[#3e3e42]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                       hover:text-gray-500 dark:hover:text-gray-400"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}