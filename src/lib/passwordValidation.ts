import { z } from 'zod';

export const passwordSchema = z.string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial (!@#$%^&*...)');

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    suggestions.push('Use pelo menos 8 caracteres');
  }

  if (password.length >= 12) {
    score++;
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    suggestions.push('Adicione letras maiúsculas');
  }

  if (/[a-z]/.test(password)) {
    // Already counted in minimum requirements
  } else {
    suggestions.push('Adicione letras minúsculas');
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    suggestions.push('Adicione números');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    suggestions.push('Adicione caracteres especiais (!@#$%^&*)');
  }

  // Normalize score to 0-4
  const normalizedScore = Math.min(4, Math.floor(score * 0.8));

  const strengthLabels: Record<number, { label: string; color: string }> = {
    0: { label: 'Muito fraca', color: 'bg-red-500' },
    1: { label: 'Fraca', color: 'bg-orange-500' },
    2: { label: 'Razoável', color: 'bg-yellow-500' },
    3: { label: 'Boa', color: 'bg-lime-500' },
    4: { label: 'Forte', color: 'bg-green-500' },
  };

  return {
    score: normalizedScore,
    label: strengthLabels[normalizedScore].label,
    color: strengthLabels[normalizedScore].color,
    suggestions,
  };
}

export function isPasswordValid(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}
