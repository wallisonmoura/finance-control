'use client';

import { useEffect, useRef, useState } from 'react';

import {
  FinanceApiResponse,
  FinanceEntryUi,
} from '../types/finance-ui.types';

type UseFinanceEntryMutationFlowParams = {
  deleteEntry: (id: string) => Promise<FinanceApiResponse<void>>;
  refresh: () => Promise<void>;
};

export function useFinanceEntryMutationFlow({
  deleteEntry,
  refresh,
}: UseFinanceEntryMutationFlowParams) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [editingEntry, setEditingEntry] = useState<FinanceEntryUi | null>(
    null,
  );
  const [entryToDelete, setEntryToDelete] = useState<FinanceEntryUi | null>(
    null,
  );
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingEntry || !isFormOpen) {
      return;
    }

    formContainerRef.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
    formContainerRef.current
      ?.querySelector<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >('input, select, textarea')
      ?.focus({ preventScroll: true });
  }, [editingEntry, isFormOpen]);

  function openCreateForm() {
    setActionError(null);
    setEditingEntry(null);
    setIsFormOpen(true);
  }

  function cancelForm() {
    setActionError(null);
    setEditingEntry(null);
    setIsFormOpen(false);
  }

  async function handleSaved() {
    setActionError(null);
    setEditingEntry(null);
    setIsFormOpen(false);

    await refresh();
  }

  function handleEdit(entry: FinanceEntryUi) {
    setActionError(null);
    setEditingEntry(entry);
    setIsFormOpen(true);
  }

  function handleDelete(entry: FinanceEntryUi) {
    setActionError(null);
    setEntryToDelete(entry);
  }

  function cancelDelete() {
    setEntryToDelete(null);
  }

  async function confirmDelete() {
    if (!entryToDelete) {
      return;
    }

    setActionError(null);
    setDeletingEntryId(entryToDelete.id);

    const response = await deleteEntry(entryToDelete.id);

    setDeletingEntryId(null);
    setEntryToDelete(null);

    if (response.error) {
      setActionError(response.error);
      return;
    }

    if (editingEntry?.id === entryToDelete.id) {
      setEditingEntry(null);
      setIsFormOpen(false);
    }

    await refresh();
  }

  return {
    isFormOpen,
    formContainerRef,
    editingEntry,
    entryToDelete,
    deletingEntryId,
    actionError,
    openCreateForm,
    cancelForm,
    handleSaved,
    handleEdit,
    handleDelete,
    cancelDelete,
    confirmDelete,
  };
}
