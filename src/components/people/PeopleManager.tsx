import { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Person } from '@/types';
import { AddFromFriendsDialog } from './AddFromFriendsDialog';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

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
  const { user } = useAuth();
  const [showVenmoField, setShowVenmoField] = useState(false);
  const [friendsDialogOpen, setFriendsDialogOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load friends list
  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  // Filter friends based on input
  useEffect(() => {
    if (newPersonName.trim().length > 0) {
      const filtered = friends.filter(friend =>
        friend.name.toLowerCase().startsWith(newPersonName.toLowerCase())
      );
      setFilteredFriends(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [newPersonName, friends]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadFriends = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleAdd = () => {
    onAdd();
    setShowVenmoField(false);
    setShowSuggestions(false);
  };

  const handleSelectFriend = (friend: Friend) => {
    onAddFromFriend(friend);
    onNameChange('');
    onVenmoIdChange('');
    setShowSuggestions(false);
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">People</h3>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Enter person's name"
              value={newPersonName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !showVenmoField && handleAdd()}
              className="w-full"
            />
            {showSuggestions && filteredFriends.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[200px] overflow-y-auto"
              >
                {filteredFriends.map((friend, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectFriend(friend)}
                    className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="font-medium">{friend.name}</div>
                    {friend.venmoId && (
                      <div className="text-xs text-muted-foreground">
                        @{friend.venmoId}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={useNameAsVenmoId ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm hover:opacity-80 transition-opacity"
            onClick={() => {
              onUseNameAsVenmoIdChange(!useNameAsVenmoId);
              if (!useNameAsVenmoId) {
                setShowVenmoField(false);
              }
            }}
          >
            Use name as Venmo ID
          </Badge>

          <Badge
            variant={saveToFriendsList ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm hover:opacity-80 transition-opacity"
            onClick={() => onSaveToFriendsListChange(!saveToFriendsList)}
          >
            Save to friends
          </Badge>

          {!useNameAsVenmoId && (
            <Badge
              variant={showVenmoField ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm hover:opacity-80 transition-opacity"
              onClick={() => setShowVenmoField(!showVenmoField)}
            >
              Add custom Venmo ID
            </Badge>
          )}
        </div>

        {showVenmoField && !useNameAsVenmoId && (
          <Input
            id="venmoId"
            placeholder="Enter Venmo username (without @)"
            value={newPersonVenmoId}
            onChange={(e) => onVenmoIdChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            className="text-sm"
          />
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
