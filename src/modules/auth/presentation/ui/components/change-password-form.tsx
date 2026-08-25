'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, KeyRound, LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Label } from '@/shared/presentation/ui/primitives/label';
import { Input as PrimitiveInput } from '@/shared/presentation/ui/primitives/input';
import { cn } from '@/shared/presentation/ui/lib/utils';

import { changePassword } from '../services/auth-api.service';

const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe sua senha atual'),
    newPassword: z
      .string()
      .min(8, 'A nova senha deve ter pelo menos 8 caracteres'),
    confirmNewPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmNewPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

type PasswordFieldConfig = {
  id: string;
  label: string;
  autoComplete: string;
  registerName: keyof ChangePasswordFormValues;
};

export function ChangePasswordForm() {
  const [visibleFields, setVisibleFields] = useState<
    Record<keyof ChangePasswordFormValues, boolean>
  >({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  function toggleVisibility(field: keyof ChangePasswordFormValues) {
    setVisibleFields((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  async function handleChangePasswordSubmit(
    values: ChangePasswordFormValues,
  ) {
    const result = await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Senha alterada com sucesso.');
    reset();
  }

  const fields: PasswordFieldConfig[] = [
    {
      id: 'account-current-password',
      label: 'Senha atual',
      autoComplete: 'current-password',
      registerName: 'currentPassword',
    },
    {
      id: 'account-new-password',
      label: 'Nova senha',
      autoComplete: 'new-password',
      registerName: 'newPassword',
    },
    {
      id: 'account-confirm-new-password',
      label: 'Confirmar nova senha',
      autoComplete: 'new-password',
      registerName: 'confirmNewPassword',
    },
  ];

  return (
    <Card className='p-5 sm:p-6'>
      <form
        onSubmit={handleSubmit(handleChangePasswordSubmit)}
        className='space-y-5'
        noValidate
      >
        <div className='space-y-1'>
          <h2 className='text-xl font-semibold text-foreground'>
            Trocar senha
          </h2>

          <p className='text-sm leading-6 text-muted-foreground'>
            Confirme sua senha atual para definir uma nova.
          </p>
        </div>

        {fields.map((field) => {
          const fieldError = errors[field.registerName];
          const isVisible = visibleFields[field.registerName];
          const errorId = fieldError ? `${field.id}-error` : undefined;

          return (
            <div key={field.id} className='space-y-1.5'>
              <Label htmlFor={field.id} className='text-foreground'>
                {field.label}
              </Label>

              <div className='relative'>
                <LockKeyhole
                  aria-hidden='true'
                  className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
                />

                <PrimitiveInput
                  id={field.id}
                  type={isVisible ? 'text' : 'password'}
                  autoComplete={field.autoComplete}
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={errorId}
                  className={cn(
                    'h-11 bg-card px-11 text-foreground transition-all duration-200 ease-out',
                  )}
                  {...register(field.registerName)}
                />

                <button
                  type='button'
                  onClick={() => toggleVisibility(field.registerName)}
                  aria-label={
                    isVisible ? 'Ocultar caracteres' : 'Mostrar caracteres'
                  }
                  className='absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  {isVisible ? (
                    <EyeOff aria-hidden='true' className='size-4' />
                  ) : (
                    <Eye aria-hidden='true' className='size-4' />
                  )}
                </button>
              </div>

              {fieldError?.message && (
                <div id={errorId}>
                  <FormErrorMessage message={fieldError.message} />
                </div>
              )}
            </div>
          );
        })}

        <Button
          type='submit'
          disabled={isSubmitting}
          variant='custom'
          className='h-11 w-full bg-primary px-6 text-primary-foreground hover:bg-primary/90 sm:w-auto'
        >
          <KeyRound aria-hidden='true' className='size-4' />
          {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
        </Button>
      </form>
    </Card>
  );
}
