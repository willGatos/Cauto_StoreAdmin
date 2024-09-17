import React from 'react';
import { Field, FieldProps } from 'formik';
import { useCategories } from './hook/useCategories'; // Importar el hook que creaste
import { FormItem, Select } from '@/components/ui';

interface CategorySelectorProps {
    errors: any;
    touched: any;
    values: any;
    setFieldValue: (field: string, value: any) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
    errors,
    touched,
    values,
    setFieldValue,
}) => {
    const { categories, loading, error } = useCategories();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const handleCategoryChange = (option: any) => {
        setFieldValue('category', option?.value);

        // Limpiar la selección de subcategoría si cambia la categoría
        setFieldValue('subcategory', '');
    };

    const handleSubcategoryChange = (option: any) => {
        setFieldValue('subcategory', option?.value);
    };

    const getSubcategories = (parentId: number | null) => {
        const category = categories.find(c => c.id === parentId);
        return category?.subcategories || [];
    };

    const currentSubcategories = getSubcategories(values.category);

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
                <FormItem
                    label="Category"
                    invalid={(errors.category && touched.category) as boolean}
                    errorMessage={errors.category}
                >
                    <Field name="category">
                        {({ field, form }: FieldProps) => (
                            <Select
                                field={field}
                                form={form}
                                options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                                value={categories.find(category => category.id === values.category)}
                                onChange={handleCategoryChange}
                            />
                        )}
                    </Field>
                </FormItem>
            </div>
            <div className="col-span-1">
                <FormItem
                    label="Subcategoría"
                    invalid={(errors.subcategory && touched.subcategory) as boolean}
                    errorMessage={errors.subcategory}
                >
                    <Field name="subcategory">
                        {({ field, form }: FieldProps) => (
                            <Select
                                field={field}
                                form={form}
                                options={currentSubcategories.map(cat => ({ value: cat.id, label: cat.name }))}
                                value={currentSubcategories.find(subcat => subcat.id === values.subcategory)}
                                onChange={handleSubcategoryChange}
                            />
                        )}
                    </Field>
                </FormItem>
            </div>
        </div>
    );
};

export default CategorySelector;
