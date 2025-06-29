import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";

interface Category {
  id: number;
  name: string;
}

interface CategorySelectorProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  categories?: Category[];
}

// Default categories in case none are provided
const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Technologie' },
  { id: 2, name: 'Santé' },
  { id: 3, name: 'Éducation' },
  { id: 4, name: 'Actualité' },
  { id: 5, name: 'Divertissement' },
];

export function CategorySelector<T extends FieldValues>({ 
  control, 
  name, 
  label,
  categories = DEFAULT_CATEGORIES 
}: CategorySelectorProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value === "" ? undefined : Number(value));
            }}
            value={field.value?.toString() ?? ""}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
