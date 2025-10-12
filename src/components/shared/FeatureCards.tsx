import { Receipt, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FEATURES } from '@/utils/uiConstants';

export function FeatureCards() {
  return (
    <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
      <Card className="p-4 md:p-6 text-center space-y-2 md:space-y-3 hover:shadow-medium transition-all duration-300">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
          <Receipt className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </div>
        <h4 className="text-sm md:text-base font-semibold">{FEATURES.AI_POWERED.title}</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {FEATURES.AI_POWERED.description}
        </p>
      </Card>

      <Card className="p-4 md:p-6 text-center space-y-2 md:space-y-3 hover:shadow-medium transition-all duration-300">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
          <Users className="w-5 h-5 md:w-6 md:h-6 text-accent" />
        </div>
        <h4 className="text-sm md:text-base font-semibold">{FEATURES.FAIR_SPLITTING.title}</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {FEATURES.FAIR_SPLITTING.description}
        </p>
      </Card>

      <Card className="p-4 md:p-6 text-center space-y-2 md:space-y-3 hover:shadow-medium transition-all duration-300">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary-glow/10 flex items-center justify-center mx-auto">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h4 className="text-sm md:text-base font-semibold">{FEATURES.INSTANT_RESULTS.title}</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {FEATURES.INSTANT_RESULTS.description}
        </p>
      </Card>
    </div>
  );
}
