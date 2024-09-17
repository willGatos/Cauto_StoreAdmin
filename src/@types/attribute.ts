// @/@types/attribute.ts
export interface CreateAttributeDto {
    name: string;
    value: AttributeValue[]; // Array de valores
}

export interface UpdateAttributeDto {
    _id: string;
    name?: string; // Nombre opcional para actualizar
    value?: AttributeValue[]; // Array de valores opcional para actualizar
}

export interface Attribute {
    id: string;
    name: string;
    value: AttributeValue[]; // Array de valores
}

// @/@types/attributeValue.ts
export interface CreateAttributeValueDto {
    type: string;  // Tipo de atributo
    value: string[];  // Array de valores
}

export interface UpdateAttributeValueDto {
    type?: string;  // Tipo de atributo opcional para actualizar
    value?: string[];  // Array de valores opcional para actualizar
}

export interface AttributeValue {
    id: string;
    type: string;  // Tipo de atributo
    value: string[];  // Array de valores
}