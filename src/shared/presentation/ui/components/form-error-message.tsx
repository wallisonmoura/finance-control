import { StatusMessage } from './status-message';

type FormErrorMessageProps = {
  message: string | null;
};

export function FormErrorMessage({ message }: FormErrorMessageProps) {
  if (!message) {
    return null;
  }

  return <StatusMessage message={message} tone='error' />;
}
