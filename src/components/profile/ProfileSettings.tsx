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
import { useProfileEditor } from '@/hooks/useProfileEditor';
import { UI_TEXT, DIALOG_DESCRIPTIONS } from '@/utils/uiConstants';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettings({ open, onOpenChange }: Props) {
  const {
    user,
    profile,
    venmoId,
    saving,
    setVenmoId,
    handleSave: save,
  } = useProfileEditor();

  const handleSave = async () => {
    await save();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            {UI_TEXT.PROFILE_SETTINGS}
          </DialogTitle>
          <DialogDescription>
            {DIALOG_DESCRIPTIONS.PROFILE_SETTINGS}
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
              {UI_TEXT.VENMO_USERNAME}
              <span className="text-xs text-muted-foreground ml-2">
                {UI_TEXT.VENMO_WITHOUT_AT}
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
            {UI_TEXT.CANCEL}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? UI_TEXT.SAVING : UI_TEXT.SAVE_CHANGES}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
