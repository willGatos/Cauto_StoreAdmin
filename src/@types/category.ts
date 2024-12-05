// Types
export interface Category {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    parent_id: number | null;
    children?: Category[];
  }
  
export interface Attribute {
    id: number;
    name: string;
    created_at: string;
    values: AttributeValue[];
  }
  
export interface AttributeValue {
    id: number;
    type: number;
    value: string;
    created_at: string;
  }