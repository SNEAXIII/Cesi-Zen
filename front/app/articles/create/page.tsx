'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { EditorToolbar } from '@/components/editor-toolbar';
import { CategorySelector } from '@/components/category-selector';

const formSchema = z.object({
  title: z.string().min(5, {
    message: 'Le titre doit contenir au moins 5 caractères.',
  }),
  content: z.string().min(10, {
    message: 'Le contenu doit contenir au moins 10 caractères.',
  }),
  category: z.string({
    required_error: 'Veuillez sélectionner une catégorie',
  }),
  coverImage: z.instanceof(File).optional(),
});

type ArticleFormValues = z.infer<typeof formSchema>;

export default function CreateArticlePage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditorUpdate = ({ editor }: { editor: any }) => {
    form.setValue('content', editor.getHTML());
  };

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: form.watch('content') || '',
    onUpdate: handleEditorUpdate,
  });

  // Mettre à jour le contenu de l'éditeur si nécessaire
  useEffect(() => {
    if (editor && !editor.isDestroyed && form.watch('content') !== editor.getHTML()) {
      editor.commands.setContent(form.watch('content') || '');
    }
  }, [editor, form]);

  const handleApiError = (error: unknown) => {
    console.error('Erreur:', error);
    alert(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`);
  };

  const handleSuccess = () => {
    alert('Votre article a été créé avec succès !');
    router.push('/articles');
    router.refresh();
  };

  const createArticle = async (data: ArticleFormValues) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('category', data.category);
    
    if (data.coverImage) {
      formData.append('coverImage', data.coverImage);
    }

    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la création de l\'article');
    }
  };

  const onSubmit = async (data: ArticleFormValues) => {
    if (!session) {
      alert('Vous devez être connecté pour créer un article');
      return;
    }

    setIsSubmitting(true);

    try {
      await createArticle(data);
      handleSuccess();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Créer un nouvel article</CardTitle>
          <CardDescription>
            Remplissez le formulaire ci-dessous pour publier un nouvel article.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de l'article</FormLabel>
                    <FormControl>
                      <Input placeholder="Entrez le titre de l'article" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu de l'article</FormLabel>
                    <FormControl>
                      <div className="rounded-md border p-2">
                        {editor && <EditorToolbar editor={editor} />}
                        <EditorContent editor={editor} className="min-h-[200px] px-2" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CategorySelector
                control={form.control}
                name="categories"
                label="Catégories"
              />

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Image de couverture</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file);
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/articles')}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Publication en cours...' : 'Publier l\'article'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
