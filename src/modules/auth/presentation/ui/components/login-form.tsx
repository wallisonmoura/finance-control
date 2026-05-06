'use client';

import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/modules/auth/presentation/ui/services/auth-api.service';
import { Card } from '@/shared/presentation/ui/components/card';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { Input } from '@/shared/presentation/ui/components/input';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Button } from '@/shared/presentation/ui/components/button';

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage(null);

    const result = await signIn({
      email,
      password,
    });

    setIsLoading(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <Card className='w-full max-w-sm'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <PageTitle
          title='Entrar'
          description='Acesse sua conta para continuar.'
        />

        <Input
          id='email'
          name='email'
          label='E-mail'
          type='email'
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder='seu@email.com'
          autoComplete='email'
          required
        />

        <Input
          id='password'
          name='password'
          label='Senha'
          type='password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder='Sua senha'
          autoComplete='current-password'
          required
        />

        {errorMessage && <FormErrorMessage message={errorMessage} />}

        <Button type='submit' disabled={isLoading} className='w-full'>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </Card>
  );
}
