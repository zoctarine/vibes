import * as React from 'react';
import { StorySettings } from '../types/story';
import { GENRES } from '../prompts/genres';

interface StorySetupProps {
  onComplete: (settings: StorySettings) => void;
  onCancel?: () => void;
  initialSettings?: StorySettings;
  isEditing?: boolean;
  className?: string;
}

export function StorySetup({ onComplete, onCancel, initialSettings, isEditing = false, className }: StorySetupProps) {
  const [settings, setSettings] = React.useState<StorySettings>({
    genre: initialSettings?.genre || '',
    perspective: initialSettings?.perspective || 'third',
    protagonistGender: initialSettings?.protagonistGender || 'other',
    styleInspiration: initialSettings?.styleInspiration || '',
    language: initialSettings?.language || 'en',
    promptStrategy: initialSettings?.promptStrategy || 'v1',
  });

  const [selectedStrategy, setSelectedStrategy] = React.useState<'v1' | 'v2'>(initialSettings?.promptStrategy || 'v1');

  const handleStrategyChange = (strategy: string) => {
    setSelectedStrategy(strategy as 'v1' | 'v2');
    setSettings(prev => ({
      ...prev,
      promptStrategy: strategy as 'v1' | 'v2'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onComplete) {
      onComplete({ 
        ...settings,
        promptStrategy: selectedStrategy
      });
    }
  };

  const getRandomElement = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  };
  
  const handleSurpriseMe = () => {
    const genreNames = Object.keys(GENRES);
    const randomGenre = getRandomElement(genreNames);
    const randomPerspective = getRandomElement(['first', 'second', 'third']);
    const randomGender = getRandomElement(['male', 'female', 'other']);
    const randomAuthor = getRandomElement(GENRES[randomGenre].authors);
    const randomLanguage = getRandomElement(['en', 'ro']);

    // Update local state with random selections
    setSettings({
      genre: randomGenre,
      perspective: randomPerspective as 'first' | 'second' | 'third',
      protagonistGender: randomGender as 'male' | 'female' | 'other',
      styleInspiration: randomAuthor,
      openingSentence: '',
      openingTitle: '',
      language: randomLanguage as 'en' | 'ro',
      promptStrategy: 'v1',
    });
  };

  return (
    <div className={className}>
      <div className="p-6 space-y-8 bg-white dark:bg-[#252526] rounded-lg shadow-sm border border-gray-200 dark:border-[#3e3e42]">
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="space-y-6">
            {/* Story Type & Genre */}
            <div className="space-y-6 pb-6 border-b dark:border-gray-700">
              {/* Genre Selection with Description */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#cccccc] mb-2">
                    Genre
                  </label>
                  <select
                    value={settings.genre}
                    onChange={(e) => setSettings({ ...settings, genre: e.target.value })}
                    required
                    className="mt-1 block w-full px-4 py-3 text-base border-gray-300 dark:border-[#3e3e42] 
                             bg-gray-50 dark:bg-[#333333] text-gray-900 dark:text-[#cccccc]
                             focus:outline-none focus:ring-story-500 focus:border-story-500 rounded-md"
                  >
                    <option value="">Select genre...</option>
                    {Object.values(GENRES).map((genre) => (
                      <option key={genre.name} value={genre.name}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  {settings.genre ? (
                    <div className="h-full flex flex-col justify-center">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-[#cccccc] mb-1">About this genre</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {GENRES[settings.genre].description}
                      </p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center text-gray-400 dark:text-gray-500 text-sm italic">
                      Select a genre to see its description
                    </div>
                  )}
                </div>
              </div>

              {/* Writing Style Inspiration */}
              <div>
                <label htmlFor="styleInspiration" className="block text-sm font-medium text-gray-700 dark:text-[#cccccc] mb-2">
                  Writing Style Inspiration
                </label>
                <input
                  type="text"
                  id="styleInspiration"
                  placeholder="e.g., Stephen King, Jane Austen, Terry Pratchett"
                  value={settings.styleInspiration}
                  onChange={(e) => setSettings({ ...settings, styleInspiration: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border-gray-300 dark:border-[#3e3e42] 
                           bg-gray-50 dark:bg-[#333333] text-gray-900 dark:text-[#cccccc]
                           rounded-md shadow-sm focus:ring-story-500 focus:border-story-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Narrative Settings */}
            <div className="space-y-6 pb-6 border-b dark:border-gray-700">
              {/* Narrative Perspective */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#cccccc] mb-2">
                  Narrative Perspective
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'first', label: 'First Person ("I/We")' },
                    { id: 'second', label: 'Second Person ("You")' },
                    { id: 'third', label: 'Third Person Limited' }
                  ].map((perspective) => (
                    <div key={perspective.id} className="flex items-center bg-gray-50 dark:bg-[#333333] p-3 rounded-md">
                      <input
                        type="radio"
                        id={perspective.id}
                        name="perspective"
                        value={perspective.id}
                        checked={settings.perspective === perspective.id}
                        onChange={(e) =>
                          setSettings({ ...settings, perspective: e.target.value as 'first' | 'second' | 'third' })
                        }
                        className="h-4 w-4 text-story-600 focus:ring-story-500 border-gray-300 dark:border-[#3e3e42]"
                      />
                      <label htmlFor={perspective.id} className="ml-3 block text-sm text-gray-700 dark:text-[#cccccc]">
                        {perspective.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protagonist's Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#cccccc] mb-2">
                  Protagonist Gender
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'male', label: 'Male' },
                    { id: 'female', label: 'Female' },
                    { id: 'other', label: 'Other' }
                  ].map((gender) => (
                    <div key={gender.id} className="flex items-center bg-gray-50 dark:bg-[#333333] p-3 rounded-md">
                      <input
                        type="radio"
                        id={gender.id}
                        name="gender"
                        value={gender.id}
                        checked={settings.protagonistGender === gender.id}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            protagonistGender: e.target.value as 'male' | 'female' | 'other'
                          })
                        }
                        className="h-4 w-4 text-story-600 focus:ring-story-500 border-gray-300 dark:border-[#3e3e42]"
                      />
                      <label htmlFor={gender.id} className="ml-3 block text-sm text-gray-700 dark:text-[#cccccc]">
                        {gender.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Story Starter */}
            {!isEditing && (
              <div className="space-y-6 pb-6 dark:border-gray-700">
                <div>
                  <label htmlFor="openingTitle" className="block text-sm font-medium text-gray-700 dark:text-[#cccccc] mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="openingTitle"
                    value={settings.openingTitle}
                    onChange={(e) => setSettings(prev => ({ ...prev, openingTitle: e.target.value }))}
                    placeholder="Write your own title or leave blank to auto-generate"
                    className="mt-1 block w-full px-4 py-3 border-gray-300 dark:border-gray-600 
                             bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                             rounded-md shadow-sm focus:ring-story-500 focus:border-story-500 sm:text-sm"
                  />
                </div>

                <div className="mt-6">
                  <label htmlFor="openingSentence" className="block text-sm font-medium text-gray-700 dark:text-[#cccccc] mb-2">
                    First Paragraph
                  </label>
                  <textarea
                    id="openingSentence"
                    rows={3}
                    placeholder="Write your own opening paragraph or leave blank to auto-generate"
                    value={settings.openingSentence}
                    onChange={(e) => setSettings(prev => ({ ...prev, openingSentence: e.target.value }))}
                    className="mt-1 block w-full px-4 py-3 border-gray-300 dark:border-gray-600 
                             bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                             rounded-md shadow-sm focus:ring-story-500 focus:border-story-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Language Selection */}
            {!isEditing && (
              <div className="pt-4 border-t dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-[#cccccc] mb-2">
                  Generate story in
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'ro', label: 'Romanian' }
                  ].map((lang) => (
                    <div key={lang.id} className="flex items-center bg-gray-50 dark:bg-[#333333] p-3 rounded-md">
                      <input
                        type="radio"
                        id={lang.id}
                        name="language"
                        value={lang.id}
                        checked={settings.language === lang.id}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            language: e.target.value as 'en' | 'ro'
                          })
                        }
                        className="h-4 w-4 text-story-600 focus:ring-story-500 border-gray-300 dark:border-[#3e3e42]"
                      />
                      <label htmlFor={lang.id} className="ml-3 block text-sm text-gray-700 dark:text-[#cccccc]">
                        {lang.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategy Selection */}
            <div className="space-y-6 pb-6 border-b dark:border-gray-700">
              <label htmlFor="strategy-select" className="block text-sm font-medium text-gray-700 dark:text-[#cccccc] mb-2">
                Select Prompt Strategy
              </label>
              <select
                id="strategy-select"
                value={selectedStrategy}
                onChange={(e) => handleStrategyChange(e.target.value)}
                className="mt-1 block w-full px-4 py-3 text-base border-gray-300 dark:border-[#3e3e42] 
                         bg-gray-50 dark:bg-[#333333] text-gray-900 dark:text-[#cccccc]
                         focus:outline-none focus:ring-story-500 focus:border-story-500 rounded-md"
              >
                <option value="v1">Strategy V1</option>
                <option value="v2">Strategy V2</option>
              </select>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCancel?.();
                }}
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                         px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700
                         focus:outline-none focus:ring-2 focus:ring-offset-2
                         focus:ring-gray-500 dark:focus:ring-offset-gray-800"
              >
                Cancel
              </button>
              {!isEditing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSurpriseMe();
                  }}
                  className="flex-1 bg-white dark:bg-gray-800 text-story-600 dark:text-story-400 
                           border border-story-600 dark:border-story-400 px-4 py-2 rounded-md 
                           hover:bg-story-50 dark:hover:bg-gray-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 
                           focus:ring-story-500 dark:focus:ring-offset-gray-800"
                >
                  Surprise Me!
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-story-600 text-white px-4 py-2 rounded-md 
                         hover:bg-story-700 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-story-500
                         dark:focus:ring-offset-gray-800"
              >
                {isEditing ? 'Save Changes' : 'Start Adventure'}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}