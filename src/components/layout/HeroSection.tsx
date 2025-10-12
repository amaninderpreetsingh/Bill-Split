import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UI_TEXT } from '@/utils/uiConstants';

interface Props {
  hasBillData: boolean;
  onLoadMock: () => void;
  onStartOver: () => void;
}

export function HeroSection({ hasBillData, onLoadMock, onStartOver }: Props) {
  return (
    <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4">
      <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
        {UI_TEXT.SPLIT_YOUR_BILL}
      </h2>
      <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
        {UI_TEXT.UPLOAD_RECEIPT_INSTRUCTION}
      </p>
      <div className="flex gap-2 justify-center mt-2">
        <Button variant="outline" size="sm" onClick={onLoadMock}>
          Load Test Data
        </Button>
        {hasBillData && (
          <Button variant="outline" size="sm" onClick={onStartOver}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {UI_TEXT.START_OVER}
          </Button>
        )}
      </div>
    </div>
  );
}
