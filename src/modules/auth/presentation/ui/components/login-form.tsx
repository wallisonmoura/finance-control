'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { signIn } from '@/modules/auth/presentation/ui/services/auth-api.service';
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
    <div className='min-h-screen bg-white lg:h-dvh lg:min-h-0 lg:overflow-hidden'>
      <div className='grid min-h-screen w-full bg-white lg:h-full lg:min-h-0 lg:grid-cols-2'>
        <aside className='relative hidden h-full overflow-hidden bg-primary lg:block'>
          <Image
            src='/images/auth-bg.png'
            alt=''
            fill
            priority
            sizes='50vw'
            className='object-fill'
          />
        </aside>

        <section className='relative flex min-h-screen flex-col bg-white px-6 py-8 lg:h-dvh lg:min-h-0 lg:px-16 lg:py-0'>
          <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center lg:h-full lg:flex-none lg:py-12 lg:pb-20'>
            <div className='mb-8 flex justify-center lg:hidden'>
              <Image
                src='/images/logo-finance-control-dark.png'
                alt='Finance Control'
                width={180}
                height={120}
                priority
                className='h-auto w-36 object-contain'
              />
            </div>

            <div className='text-center'>
              <p className='text-sm font-semibold text-[var(--fc-secondary)]'>
                Bem-vindo de volta!
              </p>
              <h2 className='mt-3 text-3xl font-bold tracking-normal text-slate-950'>
                Faça seu login
              </h2>
              <p className='mt-3 text-sm text-slate-500'>
                Entre para continuar
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleLoginSubmit)}
              className='mt-8 space-y-5'
              noValidate
            >
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-sm text-slate-950'>
                  E-mail
                </Label>

                <div className='relative'>
                  <Mail
                    aria-hidden='true'
                    className='pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400'
                  />

                  <Input
                    id='email'
                    type='email'
                    placeholder='seu@email.com'
                    autoComplete='email'
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className='h-12 rounded-lg border-slate-300 bg-white pl-4 pr-11 text-slate-950 shadow-sm'
                    {...register('email')}
                  />
                </div>

                {errors.email?.message ? (
                  <p
                    id='email-error'
                    className='text-sm font-medium text-[var(--fc-danger)]'
                  >
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password' className='text-sm text-slate-950'>
                  Senha
                </Label>

                <div className='relative'>
                  <LockKeyhole
                    aria-hidden='true'
                    className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400'
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
                    className='h-12 rounded-lg border-slate-300 bg-white px-11 text-slate-950 shadow-sm'
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
                    className='absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--fc-secondary)]'
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
                    className='text-sm font-medium text-[var(--fc-danger)]'
                  >
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className='flex justify-end'>
                <button
                  type='button'
                  className='cursor-default text-sm font-medium text-[var(--fc-secondary)]'
                >
                  Esqueceu sua senha?
                </button>
              </div>

              <Button
                type='submit'
                disabled={isSubmitting}
                className='h-12 w-full gap-2 text-base font-semibold'
              >
                <UserRound aria-hidden='true' className='size-4' />
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className='flex items-center gap-4 text-xs text-slate-500'>
                <div className='h-px flex-1 bg-slate-200' />
                <span>ou continue com</span>
                <div className='h-px flex-1 bg-slate-200' />
              </div>

              <button
                type='button'
                className='flex h-12 w-full cursor-default items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm'
              >
                <span className='text-lg font-bold text-[var(--fc-secondary)]'>
                  G
                </span>
                Entrar com Google
              </button>
            </form>

            <div className='mt-8 text-center text-sm text-slate-500'>
              Ainda não tem uma conta?{' '}
              <button
                type='button'
                className='cursor-default font-semibold text-[var(--fc-secondary)]'
              >
                Criar conta
              </button>
            </div>
          </div>

          <footer className='mx-auto mt-8 hidden w-full max-w-md items-center justify-center gap-5 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex lg:absolute lg:bottom-8 lg:left-16 lg:right-16 lg:mx-0 lg:mt-0 lg:max-w-none lg:pt-5'>
            <span>Privacidade</span>
            <span aria-hidden='true'>•</span>
            <span>Termos de Uso</span>
            <span aria-hidden='true'>•</span>
            <span>Suporte</span>
          </footer>
        </section>
      </div>
    </div>
  );
}
