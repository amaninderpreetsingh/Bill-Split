import { useState, useEffect } from 'react';
import { User as UserIcon, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function ProfileSettingsCard() {
  const { user } = useAuth();
  const { profile, loading, updateVenmoId } = useUserProfile();
  const { toast } = useToast();
  const [venmoId, setVenmoId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
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
    setIsEditing(false);
    toast({
      title: 'Profile updated',
      description: 'Your Venmo ID has been updated successfully.',
    });
  };

  const handleCancel = () => {
    setVenmoId(profile?.venmoId || '');
    setIsEditing(false);
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <h2 className="text-xl md:text-2xl font-semibold">Profile Settings</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm md:text-base">Name</Label>
          <Input
            id="name"
            value={profile?.displayName || user?.displayName || ''}
            disabled
            className="bg-muted text-sm md:text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm md:text-base">Email</Label>
          <Input
            id="email"
            value={profile?.email || user?.email || ''}
            disabled
            className="bg-muted text-sm md:text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venmoId" className="text-sm md:text-base">
            Venmo Username
            <span className="text-xs text-muted-foreground ml-2">
              (without @)
            </span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="venmoId"
              placeholder="Enter your Venmo username"
              value={venmoId}
              onChange={(e) => setVenmoId(e.target.value)}
              disabled={!isEditing || saving}
              className="text-sm md:text-base"
            />
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit
              </Button>
            )}
          </div>
          {!isEditing && (
            <p className="text-xs text-muted-foreground">
              This will be used when others charge you on Venmo
            </p>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={saving}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
