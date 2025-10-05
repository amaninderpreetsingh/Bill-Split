import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AssignmentMode } from '@/types';

interface Props {
  mode: AssignmentMode;
  onChange: (mode: AssignmentMode) => void;
}

export function AssignmentModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center rounded-lg border border-border bg-background p-1 shadow-sm">
        <button
          onClick={() => onChange('checkboxes')}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            mode === 'checkboxes'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Badge className="w-3.5 h-3.5 mr-2" variant="outline" />
          Badges
        </button>
        <button
          onClick={() => onChange('dropdown')}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            mode === 'dropdown'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <ChevronDown className="w-3.5 h-3.5 mr-2" />
          Dropdown
        </button>
      </div>
    </div>
  );
}
