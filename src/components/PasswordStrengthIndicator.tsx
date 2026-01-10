import { validatePasswordStrength } from '@/lib/passwordValidation';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
}

const PasswordStrengthIndicator = ({ password, showSuggestions = true }: PasswordStrengthIndicatorProps) => {
  if (!password) return null;

  const strength = validatePasswordStrength(password);
  const progressValue = (strength.score / 4) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Progress value={progressValue} className="h-2 flex-1" />
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${strength.color} text-white`}>
          {strength.label}
        </span>
      </div>
      
      {showSuggestions && strength.suggestions.length > 0 && strength.score < 3 && (
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {strength.suggestions.slice(0, 3).map((suggestion, index) => (
            <li key={index} className="flex items-center gap-1">
              <span className="text-orange-500">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
