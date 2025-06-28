'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

type ArticleFormData = {
  title: string;
  content: string;
  categories: string[];
  coverImage: File | null;
};

export default function CreateArticlePage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    categories: [],
    coverImage: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        content: editor.getHTML()
      }));
    },
  });

  // Mettre à jour le contenu de l'éditeur si nécessaire
  useEffect(() => {
    if (editor && !editor.isDestroyed && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content);
    }
  }, [editor, formData.content]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedCategories: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCategories.push(options[i].value);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      categories: selectedCategories
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        coverImage: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError('Vous devez être connecté pour créer un article');
      return;
    }

    console.log('Données du formulaire:', {
      ...formData,
      contentPreview: formData.content.substring(0, 100) + '...', // Affiche les 100 premiers caractères
      coverImage: formData.coverImage ? formData.coverImage.name : 'Aucune image'
    });

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('categories', JSON.stringify(formData.categories));
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'article');
      }

      setSuccess('Article créé avec succès !');
      router.push('/articles');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Créer un nouvel article</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre de l'article *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Entrez le titre de l'article"
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Contenu de l'article *
          </label>
          <div className="mt-1 border rounded-md p-2 min-h-[300px]">
            {editor && (
              <div className="border-b mb-2 pb-2">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = window.prompt('URL de l\'image:');
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  Image
                </button>
              </div>
            )}
            <EditorContent editor={editor} className="min-h-[200px] focus:outline-none" />
          </div>
        </div>
        
        <div>
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
            Catégories
          </label>
          <select
            id="categories"
            name="categories"
            multiple
            value={formData.categories}
            onChange={handleCategoryChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="technologie">Technologie</option>
            <option value="sante">Santé</option>
            <option value="education">Éducation</option>
            <option value="actualite">Actualité</option>
            <option value="divertissement">Divertissement</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">Maintenez la touche Ctrl (ou Cmd) pour en sélectionner plusieurs</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Image de couverture
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              id="coverImage"
              name="coverImage"
              onChange={handleImageChange}
              accept="image/*"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          {formData.coverImage && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Fichier sélectionné : {formData.coverImage.name}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/articles')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publication en cours...' : 'Publier l\'article'}
          </button>
        </div>
      </form>
    </div>
  );
}
