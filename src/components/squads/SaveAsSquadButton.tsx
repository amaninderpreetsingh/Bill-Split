import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Person } from '@/types';
import { SquadMember } from '@/types/squad.types';
import { useSquadManager } from '@/hooks/useSquadManager';
import { convertPeopleToSquadMembers } from '@/utils/squadUtils';
import { SquadForm } from './SquadForm';

interface SaveAsSquadButtonProps {
  people: Person[];
  disabled?: boolean;
}

export function SaveAsSquadButton({ people, disabled = false }: SaveAsSquadButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { createSquad } = useSquadManager();

  const handleSave = async (name: string, description: string, members: SquadMember[]) => {
    const squadId = await createSquad({ name, description, members });

    if (squadId) {
      setDialogOpen(false);
    }
  };

  const handleOpenDialog = () => {
    if (people.length >= 2) {
      setDialogOpen(true);
    }
  };

  // Filter out the current user and convert people to squad members
  const initialMembers = convertPeopleToSquadMembers(
    people.filter(person => !person.id.startsWith('user-'))
  );

  const isDisabled = disabled || people.length < 2;

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        variant="outline"
        size="sm"
        disabled={isDisabled}
        title={isDisabled ? 'Add at least 2 people to save as squad' : 'Save current people as a squad'}
      >
        <Save className="w-4 h-4 mr-2" />
        Save as Squad
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Save as Squad</DialogTitle>
            <DialogDescription>
              Save the current people on this bill as a squad for quick access later
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <SquadForm
              key="save-as-squad"
              initialMembers={initialMembers}
              onSubmit={handleSave}
              submitLabel="Save Squad"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
