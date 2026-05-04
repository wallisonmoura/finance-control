type FormErrorMessageProps = {
  message: string | null;
};

export function FormErrorMessage({ message }: FormErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      role='alert'
      className='rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700'
    >
      {message}
    </p>
  );
}
