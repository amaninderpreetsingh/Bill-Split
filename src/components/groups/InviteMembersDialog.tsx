import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Mail, X, Loader2 } from 'lucide-react';
import { Group } from '@/types/group.types';
import { useGroupInvites } from '@/hooks/useGroupInvites';

interface InviteMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

export function InviteMembersDialog({ open, onOpenChange, group }: InviteMembersDialogProps) {
  const [email, setEmail] = useState('');
  const { inviteMember, isInviting } = useGroupInvites(group.id);

  const handleInvite = async () => {
    if (!email.trim()) return;

    const success = await inviteMember(email.trim().toLowerCase());
    if (success) {
      setEmail('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isInviting) {
      handleInvite();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Invite people to {group.name} by email. If they have an account, they'll be added immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isInviting}
              />
              <Button onClick={handleInvite} disabled={!email.trim() || isInviting}>
                {isInviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Invite'
                )}
              </Button>
            </div>
          </div>

          {/* Pending Invitations */}
          {group.pendingInvites && group.pendingInvites.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Pending Invitations</Label>
              <div className="space-y-1">
                {group.pendingInvites.map((inviteEmail) => (
                  <div
                    key={inviteEmail}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{inviteEmail}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Members */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Members ({group.memberIds.length})
            </Label>
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {group.memberIds.length} {group.memberIds.length === 1 ? 'member' : 'members'}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
