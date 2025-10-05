import { DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PersonTotal } from '@/types';

interface Props {
  personTotals: PersonTotal[];
  allItemsAssigned: boolean;
}

export function SplitSummary({ personTotals, allItemsAssigned }: Props) {
  if (!allItemsAssigned) {
    return (
      <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
          Please assign all items to see the split summary
        </p>
      </Card>
    );
  }

  if (personTotals.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">Split Summary</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personTotals.map((pt) => (
          <div
            key={pt.personId}
            className="p-4 bg-secondary/30 rounded-lg border border-primary/10"
          >
            <div className="font-semibold text-lg mb-3">{pt.name}</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span>${pt.itemsSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>${pt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Tip:</span>
                <span className="font-semibold">${pt.tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                <span>Total:</span>
                <span className="text-primary">${pt.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
