export interface StoryInstruction {
  title: string;
  prompt: string;
}

export const STORY_INSTRUCTIONS: StoryInstruction[] = [
  {
    title: 'Dialogue',
    prompt: 'Include meaningful character interactions through dynamic dialogue that reveals personality, advances the plot, and shows rather than tells. Focus on natural conversation flow with distinct character voices.'
  },
  {
    title: 'Description',
    prompt: 'Paint a vivid picture of the scene using rich, sensory details. Describe the environment, atmosphere, and character appearances in a way that immerses the reader without overwhelming them.'
  },
  {
    title: 'Action',
    prompt: 'Create a dynamic, fast-paced scene with clear, moment-to-moment action. Use strong verbs and varied sentence structure to maintain tension and excitement while keeping the sequence easy to follow.'
  },
  {
    title: 'Plot Twist',
    prompt: 'Introduce an unexpected but logical revelation or event that changes the direction of the story. The twist should be surprising yet feel natural within the established narrative.'
  },
  {
    title: 'Character',
    prompt: 'Explore the protagonist\'s inner journey, showing growth, change, or revelation. Demonstrate character development through actions, decisions, and internal monologue that reveal deeper layers of personality.'
  },
  {
    title: 'World-Building',
    prompt: 'Expand the story\'s universe by naturally weaving in details about the setting, culture, history, or rules of the world. Show how these elements influence and shape the characters and plot.'
  },
  {
    title: 'Emotion',
    prompt: 'Create a powerful emotional scene that resonates with readers. Focus on subtle details, internal reactions, and authentic emotional responses that deepen character connections.'
  },
  {
    title: 'Tension',
    prompt: 'Build anticipation and uncertainty through pacing, foreshadowing, and strategic revelation of information. Create a sense of urgency or unease that keeps readers engaged.'
  },
  {
    title: 'Senses',
    prompt: 'Engage all five senses in the narrative. Describe not just what characters see, but what they hear, smell, taste, and feel, creating a more immersive experience.'
  },
  {
    title: 'Mystery',
    prompt: 'Introduce an intriguing question, unexplained event, or mysterious circumstance that adds depth to the story. Plant subtle clues that contribute to the larger narrative.'
  },
  {
    title: 'Brevity',
    prompt: 'Switch to brief, impactful sentences. Create urgency. Build tension. Break complex thoughts into sharp fragments. Use sentence length as a tool. Make each word count. Drive the action forward with staccato rhythm. Let the short structure mirror the intensity of the moment.'
  }
];