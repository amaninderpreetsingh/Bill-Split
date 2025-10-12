import { useToast as useToastRN } from 'react-native-toast-notifications';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toastRN = useToastRN();

  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    const message = description ? `${title}\n${description}` : title;
    const type = variant === 'destructive' ? 'danger' : 'success';

    toastRN.show(message, {
      type,
      placement: 'top',
      duration: 4000,
      animationType: 'slide-in',
    });
  };

  return {
    toast,
  };
}
