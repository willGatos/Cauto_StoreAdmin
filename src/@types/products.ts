import { Category } from "./category";
import { Currency } from "./currency";  
import { SupplyVariation } from "./supply";

  // Types
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    created_at: string;
    shop_id: number;
    cost: number;
    discount: number;
    state: string;
    owner_id: number;
    gender: string;
    commission: number;
    type: 'simple' | 'variable';
    origin: 'manufactured' | 'imported';
    commission_type: 'percentage' | 'fixed';
    reference_currency: number;
    category: Category;
    currency: Currency;
    variations: ProductVariation[];
    
  }
  
export  interface ProductVariation {
    id: number;
    product_id: number;
    name: string;
    price: number;
    stock: number;
    created_at: string;
    thumbnail: string;
    pictures: string[];
    currency_id: number;
    currency?: Currency;
    product_variations?: ProductVariationRelation[];
    attributes?: AttributeValue[];
    supplies?: SupplyVariation[];
    offerPrice?: number
  }

  interface ProductVariationRelation {
    id: number;
    required_supplies: number;
  }
  

export interface AttributeValue {
    id: number;
    type: number;
    value: string;
    created_at: string;
    attribute: Attribute;
}
  
export interface Attribute {
    id: number;
    name: string;
    created_at: string;
  }