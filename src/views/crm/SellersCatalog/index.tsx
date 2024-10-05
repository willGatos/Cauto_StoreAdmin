import { ProductVariation } from "@/@types/products";
import { Button } from "@/components/ui";
import HandleFeedback from "@/components/ui/FeedBack";
import supabase from "@/services/Supabase/BaseClient";
import { setProductsSelected, useAppDispatch, useAppSelector } from "@/store";
import { useEffect, useState } from "react";
type Currency = {
  id: number;
  name: string;
  exchange_rate: number;
  is_automatic: boolean;
};

type AttributeValue = {
  id: number;
  types: number;
  value: string;
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
  // State to store fetched products
  const [products, setProducts] = useState<Product[] | null>(null);

  // Feedback handling utilities
  const { handleSuccess } = HandleFeedback();
  const dispatch = useAppDispatch();

  // Get selected products from redux state
  const { productsSelected } = useAppSelector((state) => state.products);
  
  // Flag to control button disablement
  const [isDisabled, setIsDisabled] = useState(true);

  // Effect to update isDisabled based on productsSelected length
  useEffect(() => {
    // If there's only one or no product selected, disable the button
    if (productsSelected.length <= 1) {
      setIsDisabled(productsSelected.length > 0 ? false : true);
    }
  }, [productsSelected]);

  // Effect to fetch products when component mounts
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

  // Function to add or update a product variation
  const addOrUpdateItem = (item: ProductVariation) => {
    // Find if the item already exists in productsSelected
    const existingItem = productsSelected.find((i) => i.id === item.id);
    if (existingItem) {
      // Dispatch action to update redux state

      dispatch(
        setProductsSelected({
          ...productsSelected,
          productsSelected: productsSelected.filter(
            (item2) => item.id !== item2.id
          ),
        })
      );
      handleSuccess("Éxito sacar el Producto");
    } else {
      dispatch(
        setProductsSelected({
          productsSelected: [...productsSelected, item],
        })
      );
      handleSuccess("Éxito introducir el Producto");
    }
  };

  if (!products) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="fixed bottom-5 bg left-0 right-0 ml-auto mr-auto text-center">
        <a href={isDisabled ? "#" : "checkout"}>
          <Button
            disabled={isDisabled}
            type="button"
            variant="solid"
            className=""
            size="md"
            onClick={() => {
              handleSuccess("Éxito al Cargar Productos");
            }}
          >
            Realizar Orden con {productsSelected.length} Productos
          </Button>
        </a>
      </div>
      {products.map((product, key) => (
        <section key={key}>
          <h1 className="text-3xl font-bold mb-6">{product.name}</h1>
          <p
            className="text-gray-600 mb-8"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          <div className="overflow-x-auto">
            <div className={"flex space-x-6 pb-4"}>
              {product.product_variations.map((variation, key2) => {
                const psfinded = productsSelected.find(
                  (PS) => PS.id === variation.id
                );
                return (
                  <div
                    key={key2}
                    className="flex-shrink-0 w-64 border rounded-lg p-4 shadow-md relative"
                  >
                    <div className="mb-4">
                      <img
                        src={variation.pictures[0]}
                        alt={variation.name}
                        width={250}
                        height={250}
                        className="rounded-lg"
                      />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {variation.name}
                    </h3>
                    <p className="text-xl font-bold text-blue-600 mb-2">
                      {variation.price.toFixed(2)} {product.currency.name}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Stock: {variation.stock}
                    </p>
                    <div className="flex overflow-scroll w-52 my-2 py-2">
                      {variation.attribute_values.map((attr, key3) => (
                        <span
                          key={key3}
                          className="bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mb-1"
                        >
                          {attr.value}
                        </span>
                      ))}
                    </div>
                    <div className="my-10"></div>
                    <div className="absolute bottom-5">
                      <Button
                        style={{ width: "200px" }}
                        type="button"
                        variant={psfinded ? "twoTone" : "solid"}
                        size="md"
                        onClick={() => {
                          addOrUpdateItem(variation);
                        }}
                      >
                        {psfinded ? (
                          <>Sacar Producto </>
                        ) : (
                          <>Agregar Producto </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
