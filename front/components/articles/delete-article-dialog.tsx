'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteArticleDialogProps {
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteArticleDialog({ onConfirm, isDeleting }: DeleteArticleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
    }
  };

  return (
    <>
      <Button
        variant='ghost'
        size='icon'
        className='h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50'
        onClick={() => setIsOpen(true)}
        disabled={isDeleting}
      >
        <Trash2 className='h-3.5 w-3.5' />
        <span className='sr-only'>Supprimer l'article</span>
      </Button>

      <AlertDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Voulez-vous vraiment supprimer cet article ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
