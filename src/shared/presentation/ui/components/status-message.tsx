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
      role='status'
      aria-live='polite'
      className={
        tone === 'success'
          ? 'border-accent/30 bg-success-light text-foreground'
          : undefined
      }
    >
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription
        className={tone === 'success' ? 'text-muted-foreground' : undefined}
      >
        {message}
      </AlertDescription>
    </Alert>
  );
}
