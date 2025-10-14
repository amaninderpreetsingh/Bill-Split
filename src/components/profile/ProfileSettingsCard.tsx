import { User as UserIcon, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useProfileEditor } from '@/hooks/useProfileEditor';
import { useToast } from '@/hooks/use-toast';
import { UI_TEXT, SUCCESS_MESSAGES } from '@/utils/uiConstants';

export function ProfileSettingsCard() {
  const {
    user,
    signOut,
    profile,
    venmoId,
    isEditing,
    saving,
    setVenmoId,
    handleSave: save,
    handleCancel,
    startEditing,
  } = useProfileEditor();
  const { toast } = useToast();
  

  const handleSave = async () => {
    await save();
    toast({
      title: SUCCESS_MESSAGES.PROFILE_UPDATED,
      description: SUCCESS_MESSAGES.PROFILE_UPDATED_DESC,
    });
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <h2 className="text-xl md:text-2xl font-semibold">{UI_TEXT.PROFILE_SETTINGS}</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm md:text-base">Name</Label>
          <Input
            id="name"
            value={profile?.displayName || user?.displayName || ''}
            disabled
            className="bg-muted text-base md:text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm md:text-base">Email</Label>
          <Input
            id="email"
            value={profile?.email || user?.email || ''}
            disabled
            className="bg-muted text-base md:text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venmoId" className="text-sm md:text-base">
            {UI_TEXT.VENMO_USERNAME}
            <span className="text-xs text-muted-foreground ml-2">
              {UI_TEXT.VENMO_WITHOUT_AT}
            </span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="venmoId"
              placeholder="Enter your Venmo username"
              value={venmoId}
              onChange={(e) => setVenmoId(e.target.value)}
              disabled={!isEditing || saving}
              className="text-base md:text-sm"
            />
            {!isEditing && (
              <Button onClick={startEditing} variant="outline">
                {UI_TEXT.EDIT}
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
              {saving ? UI_TEXT.SAVING : UI_TEXT.SAVE_CHANGES}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={saving}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              {UI_TEXT.CANCEL}
            </Button>
          </div>
        )}
        <div className="space-y-2">
          <Button
              onClick={signOut}
              variant="outline"
              className="flex-1 text-destructive"
            > 
              {UI_TEXT.SIGN_OUT}
            </Button>
        </div>
      </div>
    </Card>
  );
}
