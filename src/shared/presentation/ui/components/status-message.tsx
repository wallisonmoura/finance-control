import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/presentation/ui/primitives/alert';

type StatusMessageProps = {
  title?: string;
  message: string | null;
  tone?: 'default' | 'success' | 'error';
};

export function StatusMessage({
  title,
  message,
  tone = 'default',
}: StatusMessageProps) {
  if (!message) {
    return null;
  }

  if (tone === 'error') {
    return (
      <Alert variant='destructive'>
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert
      className={
        tone === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : undefined
      }
    >
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription
        className={tone === 'success' ? 'text-emerald-800' : undefined}
      >
        {message}
      </AlertDescription>
    </Alert>
  );
}
