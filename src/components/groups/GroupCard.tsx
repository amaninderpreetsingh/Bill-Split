import { Users, Calendar, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Group } from '@/types/group.types';
import { formatDistanceToNow } from 'date-fns';

interface GroupCardProps {
  group: Group;
  onClick?: () => void;
  onDelete?: (groupId: string) => void;
  currentUserId?: string;
}

export function GroupCard({ group, onClick, onDelete, currentUserId }: GroupCardProps) {
  const isOwner = currentUserId === group.ownerId;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(group.id);
    }
  };

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{group.memberIds.length} members</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Updated {formatDistanceToNow(group.updatedAt, { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        {isOwner && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
