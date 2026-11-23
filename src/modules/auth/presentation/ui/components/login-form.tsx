'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { PASSWORD_RESET_SUCCESS_MESSAGE } from '@/modules/auth/constants/auth.constants';
import { signIn } from '@/modules/auth/presentation/ui/services/auth-api.service';
import { Button } from '@/shared/presentation/ui/components/button';
import { Label } from '@/shared/presentation/ui/primitives/label';
import { Input } from '@/shared/presentation/ui/primitives/input';

import { AuthPageShell } from './auth-page-shell';

type LoginFormProps = {
  redirectTo: string;
  // Set by the login page: after a password reset (?reset=success), or when a
  // login was signed out or expired (?session=expired).
  notice?: 'password-reset' | 'session-ended';
};

const loginFormSchema = z.object({
  email: z.string().trim().pipe(z.email('Informe um e-mail válido.')),
  password: z.string().min(1, 'Informe sua senha.'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm({ redirectTo, notice }: LoginFormProps) {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const noticeRef = useRef<HTMLParagraphElement>(null);

  // A notice already present on load is usually not read out; focusing it is.
  useEffect(() => {
    noticeRef.current?.focus();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function handleLoginSubmit(values: LoginFormValues) {
    const result = await signIn(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <AuthPageShell>
      <div className='text-center'>
        <p className='text-sm font-semibold text-income'>
          Bem-vindo de volta!
        </p>
        <h2 className='mt-3 text-3xl font-bold tracking-normal text-foreground'>
          Faça seu login
        </h2>
        <p className='mt-3 text-sm text-muted-foreground'>
          Entre para continuar
        </p>
      </div>

      {notice === 'password-reset' ? (
        <p
          ref={noticeRef}
          tabIndex={-1}
          role='status'
          className='mt-6 rounded-lg bg-success-light px-4 py-3 text-center text-sm font-medium text-success-light-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          {PASSWORD_RESET_SUCCESS_MESSAGE}
        </p>
      ) : null}

      {notice === 'session-ended' ? (
        <p
          ref={noticeRef}
          tabIndex={-1}
          role='status'
          className='mt-6 rounded-lg bg-muted px-4 py-3 text-center text-sm font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          Sua sessão terminou. Entre novamente.
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit(handleLoginSubmit)}
        className='mt-8 space-y-5'
        noValidate
      >
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-sm text-foreground'>
            E-mail
          </Label>

          <div className='relative'>
            <Mail
              aria-hidden='true'
              className='pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
            />

            <Input
              id='email'
              type='email'
              placeholder='seu@email.com'
              autoComplete='email'
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className='h-12 rounded-lg border-input bg-card pl-4 pr-11 text-foreground shadow-sm'
              {...register('email')}
            />
          </div>

          {errors.email?.message ? (
            <p
              id='email-error'
              className='text-sm font-medium text-destructive'
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password' className='text-sm text-foreground'>
            Senha
          </Label>

          <div className='relative'>
            <LockKeyhole
              aria-hidden='true'
              className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
            />

            <Input
              id='password'
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder='Sua senha'
              autoComplete='current-password'
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'password-error' : undefined
              }
              className='h-12 rounded-lg border-input bg-card px-11 text-foreground shadow-sm'
              {...register('password')}
            />

            <button
              type='button'
              onClick={() => setIsPasswordVisible((current) => !current)}
              aria-label={
                isPasswordVisible
                  ? 'Ocultar caracteres'
                  : 'Mostrar caracteres'
              }
              className='absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
            >
              {isPasswordVisible ? (
                <EyeOff aria-hidden='true' className='size-4' />
              ) : (
                <Eye aria-hidden='true' className='size-4' />
              )}
            </button>
          </div>

          {errors.password?.message ? (
            <p
              id='password-error'
              className='text-sm font-medium text-destructive'
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className='flex justify-end'>
          <Link
            href='/forgot-password'
            className='rounded-sm text-sm font-medium text-income hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            Esqueceu sua senha?
          </Link>
        </div>

        <Button
          type='submit'
          disabled={isSubmitting}
          className='h-12 w-full gap-2 text-base font-semibold'
        >
          <UserRound aria-hidden='true' className='size-4' />
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>

        {/* Hidden until Google sign-in exists: the button did nothing.
        Restore it together with the Google login (see the status doc).

        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
          <div className='h-px flex-1 bg-border' />
          <span>ou continue com</span>
          <div className='h-px flex-1 bg-border' />
        </div>

        <button
          type='button'
          className='flex h-12 w-full cursor-default items-center justify-center gap-3 rounded-lg border border-border bg-card text-sm font-medium text-foreground shadow-sm'
        >
          <span className='text-lg font-bold text-income'>
            G
          </span>
          Entrar com Google
        </button>
        */}
      </form>

      {/* Hidden until sign-up opens to everyone: the button did nothing.
      When it opens, turn it into a link to /register (see the status doc).

      <div className='mt-8 text-center text-sm text-muted-foreground'>
        Ainda não tem uma conta?{' '}
        <button
          type='button'
          className='cursor-default font-semibold text-income'
        >
          Criar conta
        </button>
      </div>
      */}
    </AuthPageShell>
  );
}
