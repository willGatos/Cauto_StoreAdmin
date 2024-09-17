export interface Supply {
    id?: number;
    name: string;
    type: 'fixed' | 'variable';
    product_id?: number;
    shop_id: number;
  }
  
  export interface SupplyVariation {
    id?: number;
    cost: number;
    currency_id: number;
    description: string;
    measure: string;
    created_at?: string;
    supply_id?: number
  }

  
 export interface SuppliesFormProps {
    initialValues?: Supply
    onSubmit: (values: Supply) => void
    isSubmitting: boolean
  }

 export interface ProductVariationRelation {
    id: number;
    required_supplies: number;
  }