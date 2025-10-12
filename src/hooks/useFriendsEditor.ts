import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile';
import { useToast } from './use-toast';
import { ERROR_MESSAGES } from '@/utils/uiConstants';

interface Friend {
  name: string;
  venmoId?: string;
}

export function useFriendsEditor() {
  const { profile, updateFriends } = useUserProfile();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendVenmoId, setNewFriendVenmoId] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
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
        title: ERROR_MESSAGES.NAME_REQUIRED,
        description: ERROR_MESSAGES.NAME_REQUIRED_DESC,
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
    setHasChanges(true);
  };

  const handleRemoveFriend = (index: number) => {
    setFriends(friends.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleEditFriend = (index: number) => {
    setEditingIndex(index);
    setEditingName(friends[index].name);
    setEditingVenmoId(friends[index].venmoId || '');
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      toast({
        title: ERROR_MESSAGES.NAME_REQUIRED,
        description: ERROR_MESSAGES.NAME_REQUIRED_DESC,
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
    setHasChanges(true);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingName('');
    setEditingVenmoId('');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    await updateFriends(friends);
    setSaving(false);
    setHasChanges(false);
  };

  return {
    // Data
    friends,
    newFriendName,
    newFriendVenmoId,
    hasChanges,
    saving,
    editingIndex,
    editingName,
    editingVenmoId,

    // Setters
    setNewFriendName,
    setNewFriendVenmoId,
    setEditingName,
    setEditingVenmoId,

    // Actions
    handleAddFriend,
    handleRemoveFriend,
    handleEditFriend,
    handleSaveEdit,
    handleCancelEdit,
    handleSaveAll,
  };
}
