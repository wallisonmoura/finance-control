'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole, Mail, UserPlus, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { signUp } from '@/modules/auth/presentation/ui/services/auth-api.service';
import { Button } from '@/shared/presentation/ui/components/button';
import { Label } from '@/shared/presentation/ui/primitives/label';
import { Input } from '@/shared/presentation/ui/primitives/input';

const registerFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Nome é obrigatório'),
    email: z.string().trim().pipe(z.email('Informe um e-mail válido.')),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function handleRegisterSubmit(values: RegisterFormValues) {
    const result = await signUp({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (result.error) {
      toast.error(result.error);
      return;
    }

    router.replace('/');
    router.refresh();
  }

  return (
    <div className='min-h-screen bg-card lg:h-dvh lg:min-h-0 lg:overflow-hidden'>
      <div className='grid min-h-screen w-full bg-card lg:h-full lg:min-h-0 lg:grid-cols-2'>
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

        <section className='relative flex min-h-screen flex-col bg-card px-6 py-8 lg:h-dvh lg:min-h-0 lg:px-16 lg:py-0'>
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
              <p className='text-sm font-semibold text-accent'>
                Bem-vindo(a) ao Finance Control!
              </p>
              <h2 className='mt-3 text-3xl font-bold tracking-normal text-foreground'>
                Crie sua conta
              </h2>
              <p className='mt-3 text-sm text-muted-foreground'>
                Comece a organizar suas finanças hoje mesmo
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleRegisterSubmit)}
              className='mt-8 space-y-5'
              noValidate
            >
              <div className='space-y-2'>
                <Label htmlFor='name' className='text-sm text-foreground'>
                  Nome completo
                </Label>

                <div className='relative'>
                  <UserRound
                    aria-hidden='true'
                    className='pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
                  />

                  <Input
                    id='name'
                    type='text'
                    placeholder='Seu nome'
                    autoComplete='name'
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className='h-12 rounded-lg border-input bg-card pl-4 pr-11 text-foreground shadow-sm'
                    {...register('name')}
                  />
                </div>

                {errors.name?.message ? (
                  <p
                    id='name-error'
                    className='text-sm font-medium text-destructive'
                  >
                    {errors.name.message}
                  </p>
                ) : null}
              </div>

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
                    placeholder='Mínimo de 8 caracteres'
                    autoComplete='new-password'
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

              <div className='space-y-2'>
                <Label
                  htmlFor='confirmPassword'
                  className='text-sm text-foreground'
                >
                  Confirmar senha
                </Label>

                <div className='relative'>
                  <LockKeyhole
                    aria-hidden='true'
                    className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
                  />

                  <Input
                    id='confirmPassword'
                    type={isConfirmPasswordVisible ? 'text' : 'password'}
                    placeholder='Repita sua senha'
                    autoComplete='new-password'
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={
                      errors.confirmPassword
                        ? 'confirmPassword-error'
                        : undefined
                    }
                    className='h-12 rounded-lg border-input bg-card px-11 text-foreground shadow-sm'
                    {...register('confirmPassword')}
                  />

                  <button
                    type='button'
                    onClick={() =>
                      setIsConfirmPasswordVisible((current) => !current)
                    }
                    aria-label={
                      isConfirmPasswordVisible
                        ? 'Ocultar caracteres'
                        : 'Mostrar caracteres'
                    }
                    className='absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeOff aria-hidden='true' className='size-4' />
                    ) : (
                      <Eye aria-hidden='true' className='size-4' />
                    )}
                  </button>
                </div>

                {errors.confirmPassword?.message ? (
                  <p
                    id='confirmPassword-error'
                    className='text-sm font-medium text-destructive'
                  >
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>

              <Button
                type='submit'
                disabled={isSubmitting}
                className='h-12 w-full gap-2 text-base font-semibold'
              >
                <UserPlus aria-hidden='true' className='size-4' />
                {isSubmitting ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <div className='mt-8 text-center text-sm text-muted-foreground'>
              Já tem uma conta?{' '}
              <Link href='/login' className='font-semibold text-accent'>
                Fazer login
              </Link>
            </div>
          </div>

          <footer className='mx-auto mt-8 hidden w-full max-w-md items-center justify-center gap-5 border-t border-border pt-6 text-xs text-muted-foreground sm:flex lg:absolute lg:bottom-8 lg:left-16 lg:right-16 lg:mx-0 lg:mt-0 lg:max-w-none lg:pt-5'>
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
