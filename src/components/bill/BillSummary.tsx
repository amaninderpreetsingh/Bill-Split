import { BillData } from '@/types';
import { Input } from '@/components/ui/input';

interface Props {
  billData: BillData;
  customTip: string;
  effectiveTip: number;
  onTipChange: (tip: string) => void;
}

export function BillSummary({ billData, customTip, effectiveTip, onTipChange }: Props) {
  return (
    <div className="mt-4 md:mt-6 space-y-2 border-t pt-3 md:pt-4">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal:</span>
        <span className="font-medium">${billData.subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Tax:</span>
        <span className="font-medium">${billData.tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center text-sm md:text-base">
        <span className="text-muted-foreground font-semibold">Tip:</span>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              placeholder={billData.tip.toFixed(2)}
              value={customTip}
              onChange={(e) => onTipChange(e.target.value)}
              className="w-28 md:w-32 h-9 md:h-10 text-right text-sm md:text-base pl-6"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between text-base md:text-lg font-bold border-t pt-2">
        <span>Total:</span>
        <span>${(billData.subtotal + billData.tax + effectiveTip).toFixed(2)}</span>
      </div>
    </div>
  );
}
