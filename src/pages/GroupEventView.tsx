import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog';
import { GroupCard } from '@/components/groups/GroupCard';
import { useGroupManager } from '@/hooks/useGroupManager';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function GroupEventView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{ id: string; name: string } | null>(null);
  const { groups, loading, createGroup, deleteGroup } = useGroupManager();
  const { toast } = useToast();

  const handleCreateGroup = async (name: string, description: string) => {
    try {
      await createGroup(name, description);

      toast({
        title: 'Group created',
        description: `${name} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create group. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    setGroupToDelete({ id: groupId, name: group.name });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      await deleteGroup(groupToDelete.id);
      toast({
        title: 'Group deleted',
        description: `${groupToDelete.name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  return (
    <>
      <div className="text-center mb-4 md:mb-12 space-y-3 md:space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Groups & Events
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Create groups to organize and track multiple bills for roommates, trips, or events.
          </p>
        </div>
        {groups.length > 0 && (
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="sm:inline">New Group</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading groups...</div>
      ) : groups.length === 0 ? (
        <Card className="p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No groups yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create your first group to start organizing bills with roommates, friends, or for events.
            </p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Create First Group
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => handleGroupClick(group.id)}
              onDelete={handleDeleteGroup}
              currentUserId={user?.uid}
            />
          ))}
        </div>
      )}

      <CreateGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreateGroup={handleCreateGroup}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{groupToDelete?.name}"? This action cannot be undone and will remove all associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGroup} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card className="p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-semibold">Organize by Group</h4>
          <p className="text-sm text-muted-foreground">
            Keep roommate bills separate from vacation expenses
          </p>
        </Card>

        <Card className="p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h4 className="font-semibold">Transaction History</h4>
          <p className="text-sm text-muted-foreground">
            See all past bills and payments for each group
          </p>
        </Card>

        <Card className="p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-lg bg-primary-glow/10 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-primary-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h4 className="font-semibold">Shared Members</h4>
          <p className="text-sm text-muted-foreground">
            Add members once, reuse across all group transactions
          </p>
        </Card>
      </div>
    </>
  );
}
