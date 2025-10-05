import { Badge, ChevronDown } from 'lucide-react';
import { AssignmentMode } from '@/types';

interface Props {
  mode: AssignmentMode;
  onModeChange: (mode: AssignmentMode) => void;
}

export function AssignmentModeToggle({ mode, onModeChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center rounded-lg border border-border bg-background p-1 shadow-sm">
        <button
          onClick={() => onModeChange("checkboxes")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            mode === "checkboxes"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Badge className="w-3.5 h-3.5 mr-2" />
          Badges
        </button>
        <button
          onClick={() => onModeChange("dropdown")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            mode === "dropdown"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <ChevronDown className="w-3.5 h-3.5 mr-2" />
          Dropdown
        </button>
      </div>
    </div>
  );
}
