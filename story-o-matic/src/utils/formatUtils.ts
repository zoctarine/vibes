export function formatPerspective(perspective: string): string {
  switch (perspective) {
    case 'first':
      return 'First Person ("I/We")';
    case 'second':
      return 'Second Person ("You")';
    case 'third':
      return 'Third Person Limited';
    default:
      return perspective;
  }
}

export function formatGender(gender: string): string {
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

export function formatLanguage(language: string): string {
  return language === 'en' ? 'English' : 'Romanian';
}