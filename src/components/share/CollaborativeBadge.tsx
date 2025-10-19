import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CollaborativeBadgeProps {
  memberCount?: number;
  className?: string;
}

export function CollaborativeBadge({ memberCount, className = '' }: CollaborativeBadgeProps) {
  return (
    <Badge variant="secondary" className={`gap-1 ${className}`}>
      <Users className="w-3 h-3" />
      Collaborative
      {memberCount !== undefined && memberCount > 0 && (
        <span className="ml-1">({memberCount})</span>
      )}
    </Badge>
  );
}
