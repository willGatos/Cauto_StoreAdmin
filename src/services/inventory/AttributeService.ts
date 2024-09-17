import ApiService from '../ApiService';
import type {
    CreateAttributeValueDto,
    UpdateAttributeValueDto,
    AttributeValue,
} from '@/@types/attributeValue';

import type {
    CreateAttributeDto,
    UpdateAttributeDto,
    Attribute,
} from '@/@types/attribute';


// Crear un nuevo atributo-valor
export async function apiCreateAttributeValue(data: CreateAttributeValueDto) {
    return ApiService.fetchData<AttributeValue>({
        url: 'attribute-value',
        method: 'post',
        data,
    });
}

// Obtener todos los atributos-valores
export async function apiGetAllAttributeValues() {
    return ApiService.fetchData<AttributeValue[]>({
        url: 'attribute-value',
        method: 'get',
    });
}

// Actualizar un atributo-valor por ID
export async function apiUpdateAttributeValue(id: string, data: UpdateAttributeValueDto) {
    return ApiService.fetchData<AttributeValue>({
        url: `attribute-value/${id}`,
        method: 'patch',
        data,
    });
}

// Eliminar un atributo-valor por ID
export async function apiDeleteAttributeValue(id: string) {
    return ApiService.fetchData<void>({
        url: `attribute-value/${id}`,
        method: 'delete',
    });
}

// Crear un nuevo atributo
export async function apiCreateAttribute(data: CreateAttributeDto) {
    return ApiService.fetchData<Attribute>({
        url: 'attribute',
        method: 'post',
        data,
    });
}

// Obtener todos los atributos
export async function apiGetAllAttributes() {
    return ApiService.fetchData<Attribute[]>({
        url: 'attribute',
        method: 'get',
    });
}

// Actualizar un atributo por ID
export async function apiUpdateAttribute(data: UpdateAttributeDto, id: string) {
    return ApiService.fetchData<Attribute>({
        url: `attribute/${data._id}`,
        method: 'patch',
        data,
    });
}

// Eliminar un atributo por ID
export async function apiDeleteAttribute(id: string) {
    return ApiService.fetchData<void>({
        url: `attribute/${id}`,
        method: 'delete',
    });
}
