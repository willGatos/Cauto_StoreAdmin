import { Button } from "@/components/ui";
import supabase from "@/services/Supabase/BaseClient";
import { useState, useEffect } from "react";
import HandleFeedback from "@/components/ui/FeedBack";
import { useAppSelector } from "@/store";

type Currency = {
  id: number;
  name: string;
  exchange_rate: number;
  is_automatic: boolean;
};

type AttributeValue = {
  id: number;
  type: number;
  value: string;
};

type ProductVariation = {
  id: number;
  product_id: number;
  name: string;
  price: number;
  stock: number;
  pictures: string[];
  currency_id: number;
  attribute_values: AttributeValue[];
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  shop_id: number;
  cost: number;
  discount: number;
  state: string;
  owner_id: number;
  gender: string | null;
  commission: number;
  type: "simple" | "variable";
  origin: "manufactured" | "imported";
  commission_type: "percentage" | "fixed";
  reference_currency: number;
  tax: number;
  product_variations: ProductVariation[];
  currency: Currency;
};

// Mapa de tipos de atributos
const attributeTypes = {
  1: "Color",
  2: "Talla",
};

export default function ProductsVariations() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const { loading, error, success, handleLoading, handleError, handleSuccess } =
    HandleFeedback();
  const { productsSelected } = useAppSelector((state) => state.products);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      // Paso 1: Obtener el producto principal con su moneda
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(
          "*,currency: currency(*), product_variations(*,attribute_values(value, types: attributes(name)))"
        );
      console.log(productData);
      // Paso 2: Ponerlo en el Estado
      setProducts(productData);
    };
    fetchProducts();
  }, []);

  if (!products) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="fixed bottom-5 bg left-0 right-0 ml-auto mr-auto text-center">
        <Button
          disabled={isDisabled}
          type="button"
          variant="solid"
          className="w-56"
          size="md"
          onClick={() => {
            handleSuccess("Éxito al Cargar Productos");
          }}
        >
          Realizar Orden con {productsSelected.length} Productos
        </Button>
      </div>
      {products.map((product) => (
        <div key={product.id}>
          <h1 className="text-3xl font-bold mb-6">{product.name}</h1>
          <p
            className="text-gray-600 mb-8"
            dangerouslySetInnerHTML={{ __html: product.description }}
          ></p>
          {product.product_variations.map((variation) => (
            <section key={variation.id} className="mb-12 border-b pb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">{variation.name}</h2>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {variation.price.toFixed(2)} {product.currency.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Stock: {variation.stock}
                </p>
                <div className="flex flex-wrap mt-2">
                  {variation.attribute_values.map((attr) => (
                    <span
                      key={attr.id}
                      className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                    >
                      {attr.value}
                    </span>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4">
                  {variation.pictures.map((picture, index) => (
                    <div key={index} className="flex-shrink-0">
                      <img
                        src={picture}
                        alt={`${variation.name} - Imagen ${index + 1}`}
                        width={600}
                        height={600}
                        className="rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      ))}
    </div>
  );
}
