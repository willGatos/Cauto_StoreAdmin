import ApiService from '../ApiService';
import type {
    CreateCategoryDto,
    UpdateCategoryDto,
    Category,
} from '@/@types/category';

// Crear una nueva categoría
export async function apiCreateCategory(data: CreateCategoryDto) {
    return ApiService.fetchData<Category>({
        url: 'category',
        method: 'post',
        data,
    });
}

// Obtener todas las categorías
export async function apiGetAllCategories() {
    return ApiService.fetchData<Category[]>({
        url: 'category',
        method: 'get',
    });
}

// Obtener una categoría por ID
export async function apiGetCategoryById(id: string) {
    return ApiService.fetchData<Category>({
        url: `category/${id}`,
        method: 'get',
    });
}

// Actualizar una categoría por ID
export async function apiUpdateCategory(data) {
    return ApiService.fetchData<Category>({
        url: `category/${data._id}`,
        method: 'patch',
        data,
    });
}

// Eliminar una categoría por ID
export async function apiDeleteCategory(id: string) {
    return ApiService.fetchData<void>({
        url: `category/${id}`,
        method: 'delete',
    });
}
