import { Users, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSquadEditor } from '@/hooks/useSquadEditor';
import { SquadList } from './SquadList';
import { SquadForm } from './SquadForm';
import { DIALOG_DESCRIPTIONS } from '@/utils/uiConstants';

interface ManageSquadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageSquadsDialog({ open, onOpenChange }: ManageSquadsDialogProps) {
  const {
    squads,
    loading,
    activeTab,
    editingSquad,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleTabChange,
    setActiveTab,
  } = useSquadEditor();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Squads
          </DialogTitle>
          <DialogDescription>
            {DIALOG_DESCRIPTIONS.MANAGE_SQUADS}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Your Squads</TabsTrigger>
            <TabsTrigger value={activeTab === 'edit' ? 'edit' : 'create'}>
              {activeTab === 'edit' ? 'Edit Squad' : 'Create New'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 py-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Loading squads...</p>
              </div>
            ) : (
              <>
                <SquadList squads={squads} onEdit={handleEdit} onDelete={handleDelete} />
                <Button
                  onClick={() => setActiveTab('create')}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Squad
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="create" className="py-4">
            <SquadForm key="create-squad" onSubmit={handleCreate} submitLabel="Create Squad" />
          </TabsContent>

          <TabsContent value="edit" className="py-4">
            {editingSquad && (
              <SquadForm
                key={`edit-${editingSquad.id}`}
                initialName={editingSquad.name}
                initialDescription={editingSquad.description}
                initialMembers={editingSquad.members}
                onSubmit={handleUpdate}
                submitLabel="Update Squad"
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
