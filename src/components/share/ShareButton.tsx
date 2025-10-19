import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ShareButton({
  onClick,
  variant = 'info',
  size = 'sm',
  className = '',
}: ShareButtonProps) {
  return (
    <Button variant={variant} size={size} onClick={onClick} className={className}>
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
}
