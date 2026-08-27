// Basic profanity / disallowed words filter
const DISALLOWED_WORDS = [
  'nigger', 'nigga', 'faggot', 'retard', 'cunt', 'chink', 'kike', 'bitch', 'whore',
  'fuck', 'shit', 'asshole', 'dick', 'pussy', 'nazi', 'hitler', 'rape'
];

export function validateNickname(name: string): { valid: boolean; error?: string; cleanName?: string } {
  if (!name) {
    return { valid: false, error: 'Nickname cannot be empty.' };
  }

  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'Nickname must be at least 3 characters long.' };
  }

  if (trimmed.length > 16) {
    return { valid: false, error: 'Nickname cannot exceed 16 characters.' };
  }

  // Check for allowed characters (letters, numbers, underscores, spaces, hyphens)
  if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) {
    return { valid: false, error: 'Nickname can only contain letters, numbers, spaces, and hyphens.' };
  }

  // Profanity check
  const lower = trimmed.toLowerCase();
  for (const bad of DISALLOWED_WORDS) {
    if (lower.includes(bad)) {
      return { valid: false, error: 'Nickname contains prohibited terms.' };
    }
  }

  return { valid: true, cleanName: trimmed };
}
