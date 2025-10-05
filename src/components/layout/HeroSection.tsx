import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  hasBillData: boolean;
  onLoadMock: () => void;
  onStartOver: () => void;
}

export function HeroSection({ hasBillData, onLoadMock, onStartOver }: Props) {
  return (
    <div className="text-center mb-12 space-y-4">
      <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
        Split Your Bill Instantly
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Upload a photo of your receipt and let AI do the math. Fair splitting with tax and tip included.
      </p>
      <div className="flex gap-2 justify-center mt-2">
        <Button variant="outline" size="sm" onClick={onLoadMock}>
          Load Test Data
        </Button>
        {hasBillData && (
          <Button variant="outline" size="sm" onClick={onStartOver}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        )}
      </div>
    </div>
  );
}
