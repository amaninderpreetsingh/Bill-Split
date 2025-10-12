import { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSquadManager } from '@/hooks/useSquadManager';
import { SquadList } from './SquadList';
import { SquadForm } from './SquadForm';
import { Squad, SquadMember, CreateSquadInput } from '@/types/squad.types';

export function ManageSquadsCard() {
  const { squads, loading, createSquad, updateSquad, deleteSquad } = useSquadManager();
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingSquad, setEditingSquad] = useState<Squad | null>(null);

  const handleCreate = async (name: string, description: string, members: SquadMember[]) => {
    const input: CreateSquadInput = { name, description, members };
    const squadId = await createSquad(input);

    if (squadId) {
      setActiveTab('list');
    }
  };

  const handleEdit = (squad: Squad) => {
    setEditingSquad(squad);
    setActiveTab('edit');
  };

  const handleUpdate = async (name: string, description: string, members: SquadMember[]) => {
    if (!editingSquad) return;

    const success = await updateSquad(editingSquad.id, { name, description, members });

    if (success) {
      setEditingSquad(null);
      setActiveTab('list');
    }
  };

  const handleDelete = async (squadId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this squad?');
    if (confirmed) {
      await deleteSquad(squadId);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'list' | 'create' | 'edit');
    if (value === 'list') {
      setEditingSquad(null);
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <h2 className="text-xl md:text-2xl font-semibold">Manage Squads</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Create and manage groups of people to quickly add them to bills
      </p>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="text-sm md:text-base">Your Squads</TabsTrigger>
          <TabsTrigger value={activeTab === 'edit' ? 'edit' : 'create'} className="text-sm md:text-base">
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
              {squads.length > 0 && (
                <Button
                  onClick={() => setActiveTab('create')}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Squad
                </Button>
              )}
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
    </Card>
  );
}
