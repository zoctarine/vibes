import React from 'react';
import { SavedStory } from '../types/story';
import { STORAGE_KEY } from '../services/storyLibrary';
import { 
  Book, 
  Trash2,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Info,
  FileDown,
  Upload,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { handleShowSummary } from '../utils/summaryUtils';
import { SummaryModal } from './SummaryModal';
import { StoryInfoModal } from './StoryInfoModal';
import { updateStory } from '../services/storyLibrary';
import { useNavigate } from 'react-router-dom';
import { getAllStories, deleteStory } from '../services/storyLibrary';

interface StoryActionsProps {
  story: SavedStory;
  expandedStory: string | null;
  setExpandedStory: (id: string | null) => void;
  onContinueStory: (story: SavedStory) => void;
  onDeleteStory: (id: string) => void;
  onShowSummary: (story: SavedStory) => void;
  onShowInfo: (story: SavedStory) => void;
}

function StoryActions({
  story,
  expandedStory,
  setExpandedStory,
  onContinueStory,
  onDeleteStory,
  onShowSummary,
  onShowInfo,
}: StoryActionsProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 w-full">
        <div className="flex flex-wrap flex-items-center gap-2">
          <button
            onClick={() =>
              setExpandedStory(expandedStory === story.id ? null : story.id)
            }
            className="p-2 text-gray-400 hover:text-story-600 dark:text-gray-500 
                     dark:hover:text-story-400 transition-colors duration-200"
            title={expandedStory === story.id ? 'Hide preview' : 'Show preview'}
          >
            {expandedStory === story.id ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => saveStoryAsMd(story)}
            className="p-2 text-gray-400 hover:text-story-600 dark:text-gray-500 
                     dark:hover:text-story-400 transition-colors duration-200"
            title="Download story as markdown"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => exportStoryAsJson(story)}
            className="p-2 text-gray-400 hover:text-story-600 dark:text-gray-500 
                     dark:hover:text-story-400 transition-colors duration-200"
            title="Export story data"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onShowInfo(story)}
            className="p-2 text-gray-400 hover:text-story-600 dark:text-gray-500 
                     dark:hover:text-story-400 transition-colors duration-200"
            title="View story settings"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteStory(story.id)}
            className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 
                     dark:hover:text-red-400 transition-colors duration-200"
            title="Delete story"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex lg:ml-auto">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onShowSummary(story)}
              className="flex items-center justify-center gap-1 px-3 py-1 bg-white dark:bg-[#333333] text-story-600 dark:text-story-400 
                       border border-story-600 dark:border-story-400 rounded-md hover:bg-story-50  wdark:hover:bg-gray-700 sm:w-auto"
              title="Show story summary"
            >
              <FileText className="w-4 h-4" />
              Summary
            </button>
            <button
              onClick={() => onContinueStory(story)}
              className="flex items-center justify-center gap-1 px-3 py-1 bg-story-600 text-white rounded-md 
                     hover:bg-story-700 transition-colors duration-200 sm:w-auto"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function saveStoryAsMd(story: SavedStory): void {
  const storyContent = [
    ...story.state.segments.map((s) => s.content),
    story.state.currentSegment?.content,
  ]
    .filter(Boolean)
    .join('\n\n');
  
  const blob = new Blob([storyContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${story.title}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportStoryAsJson(story: SavedStory): void {
  const blob = new Blob([JSON.stringify(story, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${story.title}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importStoryFromJson(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const story = JSON.parse(e.target?.result as string);
        // Validate the story object has required properties
        if (!story.id || !story.title || !story.state) {
          throw new Error('Invalid story file format');
        }
        const stories = getAllStories();
        stories.push(story);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
        window.dispatchEvent(new CustomEvent('storiesUpdated'));
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

interface StoryLibraryProps {
  storyManager: any;
}

export function StoryLibrary({ storyManager }: StoryLibraryProps) {
  const navigate = useNavigate();
  const stories = getAllStories();
  const [expandedStory, setExpandedStory] = React.useState<string | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = React.useState(false);
  const [currentSummary, setCurrentSummary] = React.useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = React.useState(false);
  const [infoModalOpen, setInfoModalOpen] = React.useState(false);
  const [currentEditingStory, setCurrentEditingStory] = React.useState<SavedStory | null>(null);
  const [libraryKey, setLibraryKey] = React.useState(0);

  const handleContinueStory = (story: SavedStory) => {
    navigate(`/story/${story.id}`);
  };

  const handleDeleteStory = (id: string) => {
    deleteStory(id);
    setLibraryKey(prev => prev + 1);
  };

  const handleShowSummaryClick = async (story: SavedStory) => {
    setSummaryModalOpen(true);
    await handleShowSummary(story.state, setIsLoadingSummary, setCurrentSummary);
  };

  const handleShowInfo = (story: SavedStory) => {
    setInfoModalOpen(true);
    setCurrentEditingStory(story); // Keep this to show the info
  };

  const handleSaveSettings = (settings: StorySettings) => {
    if (currentEditingStory) {
      const oldSettings = currentEditingStory.state.settings;
      console.log(
        'Settings before update:',
        JSON.stringify(oldSettings, null, 2)
      );
      console.log('New settings to apply:', JSON.stringify(settings, null, 2));

      // Generate settings change text by comparing old and new settings
      const changes: string[] = [];

      if (oldSettings?.genre !== settings.genre) {
        changes.push(`Genre(${oldSettings?.genre}->${settings.genre})`);
      }
      if (oldSettings?.perspective !== settings.perspective) {
        changes.push(
          `Perspective(${oldSettings?.perspective}->${settings.perspective})`
        );
      }
      if (oldSettings?.protagonistGender !== settings.protagonistGender) {
        changes.push(
          `Protagonist(${oldSettings?.protagonistGender}->${settings.protagonistGender})`
        );
      }
      if (oldSettings?.styleInspiration !== settings.styleInspiration) {
        changes.push(
          `Style(${oldSettings?.styleInspiration || 'none'}->${
            settings.styleInspiration || 'none'
          })`
        );
      }

      // Only add settings change text if there were actual changes
      const settingsChangeText =
        changes.length > 0
          ? `\n\n\`\`\`\nSettings Changed: ${changes.join(', ')}\n\`\`\`\n\n`
          : '';

      // Update the current segment's content with the settings change text
      const currentSegment = currentEditingStory.state.currentSegment;
      if (currentSegment && settingsChangeText) {
        currentSegment.content = currentSegment.content + settingsChangeText;
      }

      const updatedState = {
        ...currentEditingStory.state,
        currentSegment,
        settings: {
          ...settings,
          language: oldSettings?.language || 'en',
        },
      };

      console.log(
        'Final settings to save:',
        JSON.stringify(updatedState.settings, null, 2)
      );
      const success = updateStory(currentEditingStory.id, updatedState);

      if (success) {
        console.log('Settings updated successfully, dispatching event');
        window.dispatchEvent(
          new CustomEvent('storiesUpdated', {
            detail: { storyId: currentEditingStory.id },
          })
        );
      } else {
        console.error('Failed to update story settings');
      }

      setInfoModalOpen(false);
      setCurrentEditingStory(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-[#cccccc] flex items-center gap-2">
        
          Your Story Library
        </h2>
        <div className="flex gap-2">
          <label className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-[#333333] text-story-600 dark:text-story-400 
                         border border-story-600 dark:border-story-400 rounded-lg hover:bg-story-50 dark:hover:bg-gray-700 
                         transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Story
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  importStoryFromJson(file)
                    .then(() => {
                      window.location.reload();
                    })
                    .catch((error) => {
                      alert('Failed to import story: ' + error.message);
                    });
                }
              }}
            />
          </label>
          <button
            onClick={() => navigate('/story/new')}
            className="w-full sm:w-auto px-4 py-2 bg-story-600 text-white rounded-lg hover:bg-story-700 
                     transition-colors duration-200 flex items-center justify-center gap-2"
          >
            Start New Story
          </button>
        </div>
      </div>
      {stories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-[#252526] rounded-lg">
          <Book className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Your library is empty. Start a new story to begin your adventure!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white dark:bg-[#252526] rounded-lg shadow-sm border border-gray-200 
                       dark:border-[#3e3e42] p-4 transition-all duration-200 hover:shadow-md w-full"
            >
              <div className="flex flex-col sm:flex-row justify-between items-stretch">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#cccccc] mb-2">
                    {story.title?.replace(/_/g, ' ').trim()}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {story.summary}
                  </p>
                  {expandedStory === story.id && (
                    <div className="mt-4 mb-6 border-t border-gray-200 dark:border-[#3e3e42] pt-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="mb-4">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-[#cccccc]">
                            {story.title}
                          </h2>
                        </div>
                        {/* Show last segment preview */}
                        <div className="text-gray-600 dark:text-gray-400">
                          <ReactMarkdown>
                            {story.state.currentSegment?.content ||
                              story.state.segments[
                                story.state.segments.length - 1
                              ]?.content ||
                              'No content available'}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                    <Clock className="w-4 h-4 mr-1" />
                    Last modified: {formatDate(story.lastModified)}
                  </div>
                </div>
              </div>
              <div className="flex mt-4 border-t border-gray-200 dark:border-[#3e3e42] pt-4">
                <StoryActions
                  story={story}
                  expandedStory={expandedStory}
                  setExpandedStory={setExpandedStory}
                  onContinueStory={handleContinueStory}
                  onDeleteStory={handleDeleteStory}
                  onShowSummary={handleShowSummaryClick}
                  onShowInfo={handleShowInfo}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <SummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summary={currentSummary}
        isLoading={isLoadingSummary}
      />
      {currentEditingStory && (
        <StoryInfoModal
          isOpen={infoModalOpen}
          onClose={() => {
            setInfoModalOpen(false);
            setCurrentEditingStory(null);
          }}
          settings={currentEditingStory.state.settings}
        />
      )}
    </div>
  );
}