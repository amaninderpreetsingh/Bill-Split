import { Receipt } from 'lucide-react';
import { AuthButton } from '@/components/AuthButton';

export function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">SplitBill</h1>
          </div>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
