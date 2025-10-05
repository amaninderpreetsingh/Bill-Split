import { Users, UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Person } from '@/types';

interface Props {
  people: Person[];
  newPersonName: string;
  onNameChange: (name: string) => void;
  onAdd: () => void;
  onRemove: (personId: string) => void;
}

export function PeopleManager({ people, newPersonName, onNameChange, onAdd, onRemove }: Props) {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">People</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder="Enter person's name"
          value={newPersonName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onAdd()}
          className="flex-1"
        />
        <Button onClick={onAdd} className="sm:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {people.length > 0 && (
        <div className="space-y-2">
          {people.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
            >
              <span className="font-medium">{person.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(person.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {people.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Add people to start splitting the bill
        </p>
      )}
    </Card>
  );
}
