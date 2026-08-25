'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';

import { updateProfile } from '../services/auth-api.service';
import { AuthenticatedUser } from '../types/auth-ui.types';

const updateProfileFormSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;

type UpdateProfileFormProps = {
  user: AuthenticatedUser;
};

export function UpdateProfileForm({ user }: UpdateProfileFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: { name: user.name },
  });

  async function handleUpdateProfileSubmit(values: UpdateProfileFormValues) {
    const result = await updateProfile({ name: values.name });

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Nome atualizado com sucesso.');
    router.refresh();
  }

  return (
    <Card className='p-5 sm:p-6'>
      <form
        onSubmit={handleSubmit(handleUpdateProfileSubmit)}
        className='space-y-5'
        noValidate
      >
        <div className='space-y-1'>
          <h2 className='text-xl font-semibold text-foreground'>
            Dados da conta
          </h2>

          <p className='text-sm leading-6 text-muted-foreground'>
            Atualize seu nome de exibição.
          </p>
        </div>

        <Input
          id='account-name'
          label='Nome'
          type='text'
          autoComplete='name'
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'account-name-error' : undefined}
          {...register('name')}
        />

        <Input
          id='account-email'
          label='E-mail'
          type='email'
          value={user.email}
          disabled
        />

        {errors.name?.message && (
          <div id='account-name-error'>
            <FormErrorMessage message={errors.name.message} />
          </div>
        )}

        <Button
          type='submit'
          disabled={isSubmitting}
          variant='custom'
          className='h-11 w-full bg-primary px-6 text-primary-foreground hover:bg-primary/90 sm:w-auto'
        >
          <Save aria-hidden='true' className='size-4' />
          {isSubmitting ? 'Salvando...' : 'Salvar nome'}
        </Button>
      </form>
    </Card>
  );
}
