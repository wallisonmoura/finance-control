'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { requestPasswordReset } from '@/modules/auth/presentation/ui/services/auth-api.service';
import { Button } from '@/shared/presentation/ui/components/button';
import { Input } from '@/shared/presentation/ui/primitives/input';
import { Label } from '@/shared/presentation/ui/primitives/label';

import { AuthPageShell } from './auth-page-shell';

const forgotPasswordFormSchema = z.object({
  email: z.string().trim().pipe(z.email('Informe um e-mail válido.')),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export function ForgotPasswordForm() {
  // The server answers the same message for every e-mail.
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const sentMessageRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (sentMessage) {
      sentMessageRef.current?.focus();
    }
  }, [sentMessage]);

  async function handleForgotPasswordSubmit(values: ForgotPasswordFormValues) {
    const result = await requestPasswordReset({ email: values.email });

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSentMessage(result.data?.message ?? null);
  }

  return (
    <AuthPageShell>
      <div className='text-center'>
        <h1 className='text-3xl font-bold tracking-normal text-foreground'>Esqueceu sua senha?</h1>
        <p className='mt-3 text-sm text-muted-foreground'>
          Informe o e-mail da sua conta. Enviaremos um link pra criar uma nova senha.
        </p>
      </div>

      {sentMessage ? (
        <div
          ref={sentMessageRef}
          tabIndex={-1}
          role='status'
          className='mt-8 rounded-lg bg-success-light px-4 py-4 text-center text-sm font-medium text-success-light-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          {sentMessage}
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleForgotPasswordSubmit)} className='mt-8 space-y-5' noValidate>
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
                autoFocus
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className='h-12 rounded-lg border-input bg-card pl-4 pr-11 text-foreground shadow-sm'
                {...register('email')}
              />
            </div>

            {errors.email?.message ? (
              <p id='email-error' className='text-sm font-medium text-destructive'>
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <Button type='submit' disabled={isSubmitting} className='h-12 w-full gap-2 text-base font-semibold'>
            <Send aria-hidden='true' className='size-4' />
            {isSubmitting ? 'Enviando...' : 'Enviar link'}
          </Button>
        </form>
      )}

      <div className='mt-8 text-center text-sm text-muted-foreground'>
        <Link href='/login' className='font-semibold text-income'>
          Voltar para o login
        </Link>
      </div>
    </AuthPageShell>
  );
}
