'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, KeyRound, LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { resetPassword } from '@/modules/auth/presentation/ui/services/auth-api.service';
import { Button } from '@/shared/presentation/ui/components/button';
import { Input } from '@/shared/presentation/ui/primitives/input';
import { Label } from '@/shared/presentation/ui/primitives/label';

import { AuthPageShell } from './auth-page-shell';

const INVALID_LINK_MESSAGE = 'Este link expirou ou já foi usado.';

const resetPasswordFormSchema = z
  .object({
    newPassword: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

type ResetPasswordFormProps = {
  // From the e-mail link; null when the page was opened without one.
  token: string | null;
};

type PasswordFieldProps = {
  id: 'newPassword' | 'confirmPassword';
  label: string;
  placeholder: string;
  error?: string;
  autoFocus?: boolean;
  registration: ReturnType<ReturnType<typeof useForm<ResetPasswordFormValues>>['register']>;
};

function PasswordField({ id, label, placeholder, error, autoFocus, registration }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div className='space-y-2'>
      <Label htmlFor={id} className='text-sm text-foreground'>
        {label}
      </Label>

      <div className='relative'>
        <LockKeyhole
          aria-hidden='true'
          className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
        />

        <Input
          id={id}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete='new-password'
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className='h-12 rounded-lg border-input bg-card px-11 text-foreground shadow-sm'
          {...registration}
        />

        <button
          type='button'
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? 'Ocultar caracteres' : 'Mostrar caracteres'}
          className='absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
        >
          {isVisible ? <EyeOff aria-hidden='true' className='size-4' /> : <Eye aria-hidden='true' className='size-4' />}
        </button>
      </div>

      {error ? (
        <p id={errorId} className='text-sm font-medium text-destructive'>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function InvalidLink({ message }: { message: string }) {
  const messageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    messageRef.current?.focus();
  }, []);

  return (
    <div className='mt-8 space-y-6 text-center'>
      <p
        ref={messageRef}
        tabIndex={-1}
        role='alert'
        className='rounded-lg bg-destructive/10 px-4 py-4 text-sm font-medium text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        {message}
      </p>
      <Link href='/forgot-password' className='inline-block text-sm font-semibold text-income'>
        Pedir um novo link
      </Link>
    </div>
  );
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [invalidLinkMessage, setInvalidLinkMessage] = useState<string | null>(
    token ? null : INVALID_LINK_MESSAGE,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  async function handleResetPasswordSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      return;
    }

    const result = await resetPassword({ token, newPassword: values.newPassword });

    if (result.error) {
      if (result.invalidLink) {
        setInvalidLinkMessage(result.error);
        return;
      }

      toast.error(result.error);
      return;
    }

    router.push('/login?reset=success');
  }

  return (
    <AuthPageShell>
      <div className='text-center'>
        <h1 className='text-3xl font-bold tracking-normal text-foreground'>Criar nova senha</h1>
        <p className='mt-3 text-sm text-muted-foreground'>Escolha uma senha com pelo menos 8 caracteres.</p>
      </div>

      {invalidLinkMessage ? (
        <InvalidLink message={invalidLinkMessage} />
      ) : (
        <form onSubmit={handleSubmit(handleResetPasswordSubmit)} className='mt-8 space-y-5' noValidate>
          <PasswordField
            id='newPassword'
            label='Nova senha'
            placeholder='Mínimo de 8 caracteres'
            autoFocus
            error={errors.newPassword?.message}
            registration={register('newPassword')}
          />
          <PasswordField
            id='confirmPassword'
            label='Confirmar nova senha'
            placeholder='Repita a nova senha'
            error={errors.confirmPassword?.message}
            registration={register('confirmPassword')}
          />

          <Button type='submit' disabled={isSubmitting} className='h-12 w-full gap-2 text-base font-semibold'>
            <KeyRound aria-hidden='true' className='size-4' />
            {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
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
