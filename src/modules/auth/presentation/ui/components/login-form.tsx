'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { signIn } from '@/modules/auth/presentation/ui/services/auth-api.service';
import { Card } from '@/shared/presentation/ui/components/card';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { Button } from '@/shared/presentation/ui/components/button';
import { Label } from '@/shared/presentation/ui/primitives/label';
import { Input } from '@/shared/presentation/ui/primitives/input';

type LoginFormProps = {
  redirectTo: string;
};

const loginFormSchema = z.object({
  email: z.string().trim().pipe(z.email('Informe um e-mail válido.')),
  password: z.string().min(1, 'Informe sua senha.'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
    <Card className='w-full border-slate-700 bg-white p-6 shadow-2xl shadow-slate-950/30 sm:p-8'>
      <form
        onSubmit={handleSubmit(handleLoginSubmit)}
        className='space-y-5'
        noValidate
      >
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
              type='email'
              placeholder='seu@email.com'
              autoComplete='email'
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className='h-11 bg-white pl-10 text-black'
              {...register('email')}
            />
          </div>

          {errors.email?.message ? (
            <p id='email-error' className='text-sm font-medium text-red-600'>
              {errors.email.message}
            </p>
          ) : null}
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
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder='Sua senha'
              autoComplete='current-password'
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'password-error' : undefined
              }
              className='h-11 bg-white px-10 text-black'
              {...register('password')}
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

          {errors.password?.message ? (
            <p id='password-error' className='text-sm font-medium text-red-600'>
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <Button
          type='submit'
          disabled={isSubmitting}
          className='h-12 w-full text-base font-semibold'
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </Card>
  );
}
