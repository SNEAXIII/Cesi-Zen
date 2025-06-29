'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createArticle as createArticleService } from '@/app/services/article';
import { getAllCategories } from '@/app/services/category';
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
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Category = {
  id: number;
  label: string;
};

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        toast.error(`Erreur lors du chargement des catégories: ${errorMessage}`);
        console.error('Erreur chargement catégories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    toast.error(`Erreur: ${errorMessage}`);
  };

  const handleSuccess = () => {
    toast.success('Votre article a été créé avec succès !');
    router.push('/articles');
    router.refresh();
  };

  const onSubmit = async (data: ArticleFormValues) => {
    if (!session) {
      toast.error('Vous devez être connecté pour créer un article');
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
    <div className='container w-full py-6'>
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

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <div className="flex justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
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
