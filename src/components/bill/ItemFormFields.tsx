import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FORM_LABELS, UI_TEXT } from '@/utils/uiConstants';

interface ItemFormFieldsProps {
  mode: 'add' | 'edit';
  itemName: string;
  itemPrice: string;
  onNameChange: (name: string) => void;
  onPriceChange: (price: string) => void;
  onSave: () => void;
  onCancel: () => void;
  layout?: 'card' | 'table';
}

/**
 * Reusable form fields for adding/editing bill items
 * Used by both BillItemCard and BillItemsTable
 */
export function ItemFormFields({
  mode,
  itemName,
  itemPrice,
  onNameChange,
  onPriceChange,
  onSave,
  onCancel,
  layout = 'card',
}: ItemFormFieldsProps) {
  const handleKeyPress = (e: React.KeyboardEvent, canSubmit: boolean) => {
    if (e.key === 'Enter' && canSubmit) {
      onSave();
    }
  };

  const canSubmit = itemName.trim() && itemPrice.trim();

  // Table layout - renders as table cells
  if (layout === 'table') {
    return (
      <>
        <Input
          placeholder={FORM_LABELS.ENTER_ITEM_NAME}
          value={itemName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, !!canSubmit)}
          className="h-8"
          autoFocus={mode === 'add'}
        />
        <div className="relative ml-auto w-24">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            type="number"
            placeholder={FORM_LABELS.PRICE_PLACEHOLDER}
            value={itemPrice}
            onChange={(e) => onPriceChange(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, !!canSubmit)}
            className="h-8 text-right pl-5"
            step="0.01"
            min="0"
          />
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            className={mode === 'add' ? 'bg-green-600 hover:bg-green-700' : ''}
            variant={mode === 'edit' ? 'ghost' : 'default'}
            onClick={onSave}
          >
            <Check className={`w-4 h-4 ${mode === 'edit' ? 'text-green-600' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant={mode === 'edit' ? 'ghost' : 'outline'}
            onClick={onCancel}
          >
            <X className={`w-4 h-4 ${mode === 'edit' ? 'text-muted-foreground' : ''}`} />
          </Button>
        </div>
      </>
    );
  }

  // Card layout - renders as stacked form
  return (
    <div className="space-y-2 md:space-y-3">
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">
          {FORM_LABELS.ITEM_NAME}
        </label>
        <Input
          placeholder={FORM_LABELS.ENTER_ITEM_NAME}
          value={itemName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, !!canSubmit)}
          className="text-sm md:text-base"
          autoFocus={mode === 'add'}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">
          {FORM_LABELS.PRICE}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            placeholder={FORM_LABELS.PRICE_PLACEHOLDER}
            value={itemPrice}
            onChange={(e) => onPriceChange(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, !!canSubmit)}
            className="text-sm md:text-base text-right pl-8"
            step="0.01"
            min="0"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={onSave}>
          <Check className="w-4 h-4 mr-2" />
          {mode === 'add' ? UI_TEXT.ADD_ITEM : UI_TEXT.SAVE}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          {UI_TEXT.CANCEL}
        </Button>
      </div>
    </div>
  );
}
