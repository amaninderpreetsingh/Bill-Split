import { useState } from 'react';
import { Users, UserPlus, Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Person } from '@/types';
import { AddFromFriendsDialog } from './AddFromFriendsDialog';

interface Friend {
  name: string;
  venmoId?: string;
}

interface Props {
  people: Person[];
  newPersonName: string;
  newPersonVenmoId: string;
  useNameAsVenmoId: boolean;
  saveToFriendsList: boolean;
  onNameChange: (name: string) => void;
  onVenmoIdChange: (venmoId: string) => void;
  onUseNameAsVenmoIdChange: (checked: boolean) => void;
  onSaveToFriendsListChange: (checked: boolean) => void;
  onAdd: () => void;
  onAddFromFriend: (friend: Friend) => void;
  onRemove: (personId: string) => void;
}

export function PeopleManager({
  people,
  newPersonName,
  newPersonVenmoId,
  useNameAsVenmoId,
  saveToFriendsList,
  onNameChange,
  onVenmoIdChange,
  onUseNameAsVenmoIdChange,
  onSaveToFriendsListChange,
  onAdd,
  onAddFromFriend,
  onRemove
}: Props) {
  const [showVenmoField, setShowVenmoField] = useState(false);
  const [friendsDialogOpen, setFriendsDialogOpen] = useState(false);

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
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex-1 sm:flex-none">
              <UserPlus className="w-4 h-4 mr-2" />
              Add
            </Button>
            <Button
              onClick={() => setFriendsDialogOpen(true)}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Add from friends
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3">
            <Switch
              id="use-name-as-venmo"
              checked={useNameAsVenmoId}
              onCheckedChange={(checked) => {
                onUseNameAsVenmoIdChange(!!checked);
                if (checked) {
                  setShowVenmoField(false);
                }
              }}
            />
            <Label
              htmlFor="use-name-as-venmo"
              className="text-sm font-medium cursor-pointer"
            >
              Use name as Venmo ID
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="save-to-friends"
              checked={saveToFriendsList}
              onCheckedChange={(checked) => onSaveToFriendsListChange(!!checked)}
            />
            <Label
              htmlFor="save-to-friends"
              className="text-sm font-medium cursor-pointer"
            >
              Save to friends
            </Label>
          </div>

          {!useNameAsVenmoId && (
            <div className="flex items-center space-x-3">
              <Switch
                id="add-custom-venmo"
                checked={showVenmoField}
                onCheckedChange={(checked) => setShowVenmoField(!!checked)}
              />
              <Label
                htmlFor="add-custom-venmo"
                className="text-sm font-medium cursor-pointer"
              >
                Add custom Venmo ID
              </Label>
            </div>
          )}
        </div>

        {showVenmoField && !useNameAsVenmoId && (
          <div className="space-y-2">
            <Label htmlFor="venmoId" className="text-sm text-muted-foreground">
              Venmo Username
            </Label>
            <Input
              id="venmoId"
              placeholder="Enter Venmo username (without @)"
              value={newPersonVenmoId}
              onChange={(e) => onVenmoIdChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              className="text-sm"
            />
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

      <AddFromFriendsDialog
        open={friendsDialogOpen}
        onOpenChange={setFriendsDialogOpen}
        onAddPerson={onAddFromFriend}
      />
    </Card>
  );
}
