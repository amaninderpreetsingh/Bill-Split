import { useState, useEffect } from 'react';
import { VenmoCharge } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { openVenmoApp, isVenmoInstalled, getVenmoWebUrl } from '@/utils/venmo';

interface Props {
  charge: VenmoCharge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VenmoChargeDialog({ charge, open, onOpenChange }: Props) {
  const [venmoId, setVenmoId] = useState('');

  useEffect(() => {
    if (charge?.recipientId) {
      setVenmoId(charge.recipientId);
    } else {
      setVenmoId('');
    }
  }, [charge]);

  if (!charge) return null;

  const handleOpenVenmo = () => {
    if (!venmoId.trim()) {
      return;
    }

    const updatedCharge = {
      ...charge,
      recipientId: venmoId.trim(),
    };

    if (isVenmoInstalled()) {
      openVenmoApp(updatedCharge);
    } else {
      window.open(getVenmoWebUrl(updatedCharge), '_blank');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Charge on Venmo</DialogTitle>
          <DialogDescription>
            Review the charge details before opening Venmo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Charging:</span>
              <span className="font-semibold">{charge.recipientName}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venmoId">
                Venmo ID <span className="text-xs text-muted-foreground">(without @)</span>
              </Label>
              <Input
                id="venmoId"
                placeholder="Enter their Venmo username"
                value={venmoId}
                onChange={(e) => setVenmoId(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="text-2xl font-bold text-primary">
                ${charge.amount.toFixed(2)}
              </span>
            </div>

            <div className="border-t pt-3">
              <span className="text-sm text-muted-foreground block mb-1">
                Description:
              </span>
              <span className="text-sm">{charge.note}</span>
            </div>
          </div>

          {!isVenmoInstalled() && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Venmo app not detected. Opening in browser instead.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleOpenVenmo} disabled={!venmoId.trim()} className="gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.384 4.616c.616.952.933 2.064.933 3.432 0 4.284-3.636 9.816-6.612 13.248H6.864L4.8 4.728l6.12-.576 1.176 13.488c1.44-2.304 3.576-6.144 3.576-8.688 0-1.176-.24-2.064-.696-2.832l4.608-1.504z"/>
            </svg>
            Open Venmo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
