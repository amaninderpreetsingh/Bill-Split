import { Users, Trash2, UserPlus, Pencil, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFriendsEditor } from '@/hooks/useFriendsEditor';
import { useToast } from '@/hooks/use-toast';
import { UI_TEXT, SUCCESS_MESSAGES } from '@/utils/uiConstants';

export function ManageFriendsCard() {
  const {
    friends,
    newFriendName,
    newFriendVenmoId,
    hasChanges,
    saving,
    editingIndex,
    editingName,
    editingVenmoId,
    setNewFriendName,
    setNewFriendVenmoId,
    setEditingName,
    setEditingVenmoId,
    handleAddFriend,
    handleRemoveFriend,
    handleEditFriend,
    handleSaveEdit,
    handleCancelEdit,
    handleSaveAll: saveAll,
  } = useFriendsEditor();
  const { toast } = useToast();

  const handleSaveAll = async () => {
    await saveAll();
    toast({
      title: SUCCESS_MESSAGES.FRIENDS_UPDATED,
      description: SUCCESS_MESSAGES.FRIENDS_UPDATED_DESC,
    });
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          <h2 className="text-xl md:text-2xl font-semibold">Manage Friends</h2>
        </div>
        {hasChanges && (
          <Button onClick={handleSaveAll} disabled={saving} size="sm">
            {saving ? UI_TEXT.SAVING : UI_TEXT.SAVE_CHANGES}
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Add friends to quickly add them to bills
      </p>

      {/* Add Friend Form */}
      <div className="space-y-2 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Friend's name"
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
            className="flex-1 text-sm md:text-base"
          />
          <Input
            placeholder="Venmo ID (optional)"
            value={newFriendVenmoId}
            onChange={(e) => setNewFriendVenmoId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
            className="flex-1 text-sm md:text-base"
          />
          <Button onClick={handleAddFriend} className="gap-2">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>

      {/* Friends List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {friends.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
            No friends saved yet. Add friends above to get started.
          </p>
        ) : (
          friends.map((friend, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 md:p-3 bg-secondary/30 rounded-lg border border-border"
            >
              {editingIndex === index ? (
                <>
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Name"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 text-sm md:text-base"
                    />
                    <Input
                      placeholder="Venmo ID"
                      value={editingVenmoId}
                      onChange={(e) => setEditingVenmoId(e.target.value)}
                      className="flex-1 text-sm md:text-base"
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
                    <p className="text-sm md:text-base font-medium">{friend.name}</p>
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
    </Card>
  );
}
