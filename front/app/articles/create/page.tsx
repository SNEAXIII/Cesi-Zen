'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createArticle as createArticleService } from '@/app/services/article'; // Renommage ici
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CategorySelector } from '@/components/category-selector';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

const formSchema = z.object({
  title: z.string().min(5, {
    message: 'Le titre doit contenir au moins 5 caractères.',
  }),
  content: z.string().min(10, {
    message: 'Le contenu doit contenir au moins 10 caractères.',
  }),
  category: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({
      required_error: 'Veuillez sélectionner une catégorie',
      invalid_type_error: 'L\'ID de la catégorie doit être un nombre',
    }).positive({
      message: 'Veuillez sélectionner une catégorie valide',
    })
  ),
});

type ArticleFormValues = {
  title: string;
  content: string;
  category: number;
};

export default function CreateArticlePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      content: '',
      category: 0,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditorChange = (content: string) => {
    form.setValue('content', content, { shouldValidate: true });
  };

  const handleApiError = (error: unknown) => {
    console.error('Erreur:', error);
    alert(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`);
  };

  const handleSuccess = () => {
    alert('Votre article a été créé avec succès !');
    router.push('/articles');
    router.refresh();
  };

  const onSubmit = async (data: ArticleFormValues) => {
    if (!session) {
      alert('Vous devez être connecté pour créer un article');
      return;
    }
    console.log(data);

    try {
      setIsSubmitting(true);
      await createArticleService(data, session?.accessToken); // Appel de la fonction importée
      handleSuccess();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container max-w-4xl py-6'>
      <Card>
        <CardHeader>
          <CardTitle>Créer un nouvel article</CardTitle>
          <CardDescription>
            Remplissez le formulaire ci-dessous pour publier un nouvel article.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6'
            >
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de l'article</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez le titre de l'article"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu de l'article</FormLabel>
                    <FormControl>
                      <div className='rounded-md border p-2'>
                        <SimpleEditor
                          content={field.value}
                          onUpdate={handleEditorChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CategorySelector<ArticleFormValues>
                control={form.control}
                name="category"
                label="Catégorie"
              />
              <div className='flex justify-end gap-4 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/articles')}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type='submit'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publication en cours...' : "Publier l'article"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
