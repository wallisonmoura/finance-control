'use client';

import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { signIn } from '@/modules/auth/presentation/ui/services/auth-api.service';
import { Card } from '@/shared/presentation/ui/components/card';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { Button } from '@/shared/presentation/ui/components/button';
import { Label } from '@/shared/presentation/ui/primitives/label';
import { Input } from '@/shared/presentation/ui/primitives/input';

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    const result = await signIn({
      email,
      password,
    });

    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <Card className='w-full border-slate-700 bg-white p-6 shadow-2xl shadow-slate-950/30 sm:p-8'>
      <form onSubmit={handleSubmit} className='space-y-5'>
        <PageTitle
          title='Entrar'
          description='Acesse sua conta para continuar.'
        />

        <div className='space-y-1.5'>
          <Label htmlFor='email' className='text-slate-900'>
            E-mail
          </Label>

          <div className='relative'>
            <Mail
              aria-hidden='true'
              className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400'
            />

            <Input
              id='email'
              name='email'
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='seu@email.com'
              autoComplete='email'
              required
              className='h-11 bg-white pl-10 text-black'
            />
          </div>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='password' className='text-slate-900'>
            Senha
          </Label>

          <div className='relative'>
            <LockKeyhole
              aria-hidden='true'
              className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400'
            />

            <Input
              id='password'
              name='password'
              type={isPasswordVisible ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder='Sua senha'
              autoComplete='current-password'
              required
              className='h-11 bg-white px-10 text-black'
            />

            <button
              type='button'
              onClick={() => setIsPasswordVisible((current) => !current)}
              aria-label={
                isPasswordVisible ? 'Ocultar caracteres' : 'Mostrar caracteres'
              }
              className='absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300'
            >
              {isPasswordVisible ? (
                <EyeOff aria-hidden='true' className='size-4' />
              ) : (
                <Eye aria-hidden='true' className='size-4' />
              )}
            </button>
          </div>
        </div>

        <Button type='submit' disabled={isLoading} className='w-full'>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </Card>
  );
}
