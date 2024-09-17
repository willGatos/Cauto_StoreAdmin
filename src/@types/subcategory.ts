// @/@types/subcategory.ts
export interface CreateSubcategoryDto {
    name: string;
    categoryId: string;
}

export interface UpdateSubcategoryDto {
    _id: string;
    name?: string;
    categoryId?: string;
}

export interface Subcategory {
    id: string;
    name: string;
    categoryId: string;
    createdAt: string;
    updatedAt: string;
}
