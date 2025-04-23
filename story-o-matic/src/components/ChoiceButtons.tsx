import ReactMarkdown from 'react-markdown';
import { ChevronUp, Tags, Plus, RefreshCw } from 'lucide-react';
import { Choice } from '../types/story';
import { STORY_INSTRUCTIONS, StoryInstruction } from '../prompts/instructions';
import { Button } from './common/Button';
import { useState } from 'react';

interface ChoiceButtonsProps {
  choices: Choice[];
  onChoiceSelected: (choice: Choice) => void;
  onRegenerateChoices: () => void;
  disabled: boolean;
}

export function ChoiceButtons({ choices, onChoiceSelected, onRegenerateChoices, disabled }: ChoiceButtonsProps) {
  const [customChoice, setCustomChoice] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);

  const handleCustomChoice = () => {
    if (customChoice.trim()) {
      onChoiceSelected({
        id: crypto.randomUUID(),
        text: customChoice.trim()
      });
      setCustomChoice('');
      setShowCustomInput(false);
    }
  };

  const handleInstructionToggle = (instruction: StoryInstruction) => {
    setSelectedInstructions(prev =>
      prev.includes(instruction.title)
        ? prev.filter(i => i !== instruction.title)
        : [...prev, instruction.title]
    );
  };

  const handleChoiceWithInstructions = (choice: Choice) => {
    const selectedPrompts = selectedInstructions
      .map(title => STORY_INSTRUCTIONS.find(i => i.title === title)?.prompt || '')
      .filter((prompt): prompt is string => !!prompt);

    onChoiceSelected({
      ...choice,
      instructions: selectedPrompts
    });
    setSelectedInstructions([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-3">
      {choices.map((choice) => (
        <Button
          key={choice.id}
          onClick={() => handleChoiceWithInstructions(choice)}
          disabled={disabled}
          className="w-full text-left bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#3e3e42] rounded-lg shadow-sm 
                     hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-story-300 dark:hover:border-story-600 transition-colors duration-200
                     text-gray-700 dark:text-[#cccccc]"
        >
          <ReactMarkdown className="prose prose-sm dark:prose-invert">
            {choice.text}
          </ReactMarkdown>
        </Button>
      ))}

      <div className="mt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowInstructions(!showInstructions)}
              disabled={disabled}
              title="Add custom instructions for next block"
              className="text-sm text-story-600 dark:text-story-400 hover:text-story-700 dark:hover:text-story-300 flex items-center gap-1"
            >
              <Tags className="w-4 h-4" />
              Nudge the Narrative
            </Button>
            <Button 
              onClick={onRegenerateChoices}
              disabled={disabled}
              title="Regenerate choices"
              className="text-sm text-story-600 dark:text-story-400 hover:text-story-700 dark:hover:text-story-300 flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Explore Alternatives
            </Button>
          </div>
          <Button
            onClick={() => setShowCustomInput(!showCustomInput)}
            disabled={disabled}
            title="Add custom choice. Write your own."
            className="text-sm text-story-600 dark:text-story-400 hover:text-story-700 dark:hover:text-story-300 flex items-center gap-1"
          >
            {showCustomInput ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Seize Control
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Seize Control
              </>
            )}
          </Button>
        </div>

        {showCustomInput && (
          <div className="flex gap-2 mt-4 animate-[fadeIn_0.2s_ease-in_forwards]">
            <textarea
              value={customChoice}
              onChange={(e) => setCustomChoice(e.target.value)}
              placeholder="Write your own choice..."
              disabled={disabled}
              rows={4}
              className="flex-1 p-4 text-left bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#3e3e42] rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-story-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-gray-700 dark:text-[#cccccc]"
            />
            <Button
              onClick={handleCustomChoice}
              disabled={disabled || !customChoice.trim()}
              className="px-6 bg-story-600 text-white rounded-lg
                       hover:bg-story-700 disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-story-500 focus:border-transparent"
            >
              Choose
            </Button>
          </div>
        )}

        {showInstructions && (
          <div className="mt-4 p-4 bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#3e3e42] rounded-lg
                      animate-[fadeIn_0.2s_ease-in_forwards]">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Spice up the <i>next</i> scene with more:</p>
            <div className="flex flex-wrap gap-2">
              {STORY_INSTRUCTIONS.map((instruction) => (
                <Button
                  key={instruction.title}
                  onClick={() => handleInstructionToggle(instruction)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                    selectedInstructions.includes(instruction.title)
                      ? 'bg-story-600 text-white'
                      : 'bg-gray-100 dark:bg-[#333333] text-gray-700 dark:text-[#cccccc] hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {instruction.title}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}