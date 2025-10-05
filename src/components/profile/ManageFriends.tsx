import { useState, useEffect } from 'react';
import { Users, Trash2, UserPlus, Pencil, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Friend {
  name: string;
  venmoId?: string;
}

export function ManageFriends({ open, onOpenChange }: Props) {
  const { profile, updateFriends } = useUserProfile();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendVenmoId, setNewFriendVenmoId] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingVenmoId, setEditingVenmoId] = useState('');

  useEffect(() => {
    if (profile?.friends) {
      setFriends(profile.friends);
    }
  }, [profile]);

  const handleAddFriend = () => {
    if (!newFriendName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a friend\'s name.',
        variant: 'destructive',
      });
      return;
    }

    const newFriend: Friend = {
      name: newFriendName.trim(),
      venmoId: newFriendVenmoId.trim() || undefined,
    };

    setFriends([...friends, newFriend]);
    setNewFriendName('');
    setNewFriendVenmoId('');
  };

  const handleRemoveFriend = (index: number) => {
    setFriends(friends.filter((_, i) => i !== index));
  };

  const handleEditFriend = (index: number) => {
    setEditingIndex(index);
    setEditingName(friends[index].name);
    setEditingVenmoId(friends[index].venmoId || '');
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a friend\'s name.',
        variant: 'destructive',
      });
      return;
    }

    const updatedFriends = [...friends];
    updatedFriends[editingIndex!] = {
      name: editingName.trim(),
      venmoId: editingVenmoId.trim() || undefined,
    };

    setFriends(updatedFriends);
    setEditingIndex(null);
    setEditingName('');
    setEditingVenmoId('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingName('');
    setEditingVenmoId('');
  };

  const handleSave = async () => {
    setSaving(true);
    await updateFriends(friends);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Friends
          </DialogTitle>
          <DialogDescription>
            Add or remove friends to quickly add them to bills.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add Friend Form */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Friend's name"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Venmo ID (optional)"
                  value={newFriendVenmoId}
                  onChange={(e) => setNewFriendVenmoId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
                />
              </div>
              <Button onClick={handleAddFriend} size="icon">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Friends List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {friends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No friends saved yet. Add friends to quickly add them to bills.
              </p>
            ) : (
              friends.map((friend, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg border border-border"
                >
                  {editingIndex === index ? (
                    <>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Name"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Venmo ID"
                          value={editingVenmoId}
                          onChange={(e) => setEditingVenmoId(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveEdit}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium">{friend.name}</p>
                        {friend.venmoId && (
                          <p className="text-xs text-muted-foreground">
                            @{friend.venmoId}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFriend(index)}
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFriend(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
