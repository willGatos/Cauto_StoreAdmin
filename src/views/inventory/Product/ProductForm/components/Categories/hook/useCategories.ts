import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/Supabase/AttributeService'; // Asegúrate de importar tu servicio de Supabase
import { Category } from '@/@types/category';

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabaseService.getCategories();
                if (error) throw error;

                // Estructurar las categorías con subcategorías
                const categoriesWithSubcategories = buildCategoryTree(data);
                setCategories(categoriesWithSubcategories);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
};

// Función para construir la estructura de categorías con subcategorías
const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap: Record<number, Category> = {};
    const roots: Category[] = [];

    // Crear un mapa de categorías
    categories.forEach(category => {
        categoryMap[category.id] = { ...category, subcategories: [] };
    });

    // Construir la estructura de árbol
    categories.forEach(category => {
        if (category.parent_id) {
            const parent = categoryMap[category.parent_id];
            if (parent) {
                parent.subcategories?.push(categoryMap[category.id]);
            }
        } else {
            roots.push(categoryMap[category.id]);
        }
    });

    return roots;
};
