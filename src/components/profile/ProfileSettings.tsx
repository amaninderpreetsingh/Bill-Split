import { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettings({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { profile, loading, updateVenmoId } = useUserProfile();
  const [venmoId, setVenmoId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.venmoId) {
      setVenmoId(profile.venmoId);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateVenmoId(venmoId.trim());
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Update your Venmo ID to enable charging others for their split.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile?.displayName || user?.displayName || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile?.email || user?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venmoId">
              Venmo Username
              <span className="text-xs text-muted-foreground ml-2">
                (without @)
              </span>
            </Label>
            <Input
              id="venmoId"
              placeholder="Enter your Venmo username"
              value={venmoId}
              onChange={(e) => setVenmoId(e.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              This will be used when others charge you on Venmo
            </p>
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
