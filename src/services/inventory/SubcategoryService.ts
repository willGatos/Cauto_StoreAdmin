import ApiService from '../ApiService';
import type {
    CreateSubcategoryDto,
    UpdateSubcategoryDto,
    Subcategory,
} from '@/@types/subcategory';

// Crear una nueva subcategoría
export async function apiCreateSubcategory( data: CreateSubcategoryDto ) {
    return ApiService.fetchData<Subcategory>({
        url: 'subcategory',
        method: 'post',
        data,
    });
}

// Obtener todas las subcategorías
export async function apiGetAllSubcategories() {
    return ApiService.fetchData<Subcategory[]>({
        url: 'subcategory',
        method: 'get',
    });
}

// Obtener una subcategoría por ID
export async function apiGetSubcategoryById(id: string) {
    return ApiService.fetchData<Subcategory>({
        url: `subcategory/${id}`,
        method: 'get',
    });
}

// Actualizar una subcategoría por ID
export async function apiUpdateSubcategory(data) {
    console.log(data)
    return ApiService.fetchData<Subcategory>({
        url: `subcategory/${data._id}`,
        method: 'patch',
        data,
    });
}

// Eliminar una subcategoría por ID
export async function apiDeleteSubcategory(id: string) {
    return ApiService.fetchData<void>({
        url: `subcategory/${id}`,
        method: 'delete',
    });
}
