import { useState } from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Person } from '@/types';

interface Props {
  people: Person[];
  newPersonName: string;
  newPersonVenmoId: string;
  useNameAsVenmoId: boolean;
  onNameChange: (name: string) => void;
  onVenmoIdChange: (venmoId: string) => void;
  onUseNameAsVenmoIdChange: (checked: boolean) => void;
  onAdd: () => void;
  onRemove: (personId: string) => void;
}

export function PeopleManager({
  people,
  newPersonName,
  newPersonVenmoId,
  useNameAsVenmoId,
  onNameChange,
  onVenmoIdChange,
  onUseNameAsVenmoIdChange,
  onAdd,
  onRemove
}: Props) {
  const [showVenmoField, setShowVenmoField] = useState(false);

  const handleAdd = () => {
    onAdd();
    setShowVenmoField(false);
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">People</h3>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Enter person's name"
            value={newPersonName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !showVenmoField && handleAdd()}
            className="flex-1"
          />
          <Button onClick={handleAdd} className="sm:w-auto">
            <UserPlus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="add-venmo"
            checked={showVenmoField}
            onCheckedChange={(checked) => setShowVenmoField(!!checked)}
          />
          <Label
            htmlFor="add-venmo"
            className="text-sm font-normal cursor-pointer"
          >
            Add Venmo ID (optional)
          </Label>
        </div>

        {showVenmoField && (
          <div className="space-y-2 pl-6 border-l-2 border-primary/20">
            <Input
              placeholder="Venmo username (without @)"
              value={useNameAsVenmoId ? newPersonName : newPersonVenmoId}
              onChange={(e) => onVenmoIdChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              disabled={useNameAsVenmoId}
              className="text-sm"
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-name-as-venmo"
                checked={useNameAsVenmoId}
                onCheckedChange={(checked) => onUseNameAsVenmoIdChange(!!checked)}
              />
              <Label
                htmlFor="use-name-as-venmo"
                className="text-xs font-normal cursor-pointer text-muted-foreground"
              >
                Use name as Venmo ID
              </Label>
            </div>
          </div>
        )}
      </div>

      {people.length > 0 && (
        <div className="space-y-2">
          {people.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
            >
              <div className="flex-1">
                <span className="font-medium">{person.name}</span>
                {person.venmoId && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (@{person.venmoId})
                  </span>
                )}
              </div>
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
