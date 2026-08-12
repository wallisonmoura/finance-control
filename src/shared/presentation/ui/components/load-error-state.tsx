import { RotateCw } from 'lucide-react';

import { Button } from './button';
import { Card } from './card';
import { FormErrorMessage } from './form-error-message';

type LoadErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function LoadErrorState({ message, onRetry }: LoadErrorStateProps) {
  return (
    <Card>
      <div className='space-y-4'>
        <FormErrorMessage message={message} />

        <Button type='button' onClick={onRetry}>
          <RotateCw aria-hidden='true' className='size-4' />
          Tentar novamente
        </Button>
      </div>
    </Card>
  );
}
