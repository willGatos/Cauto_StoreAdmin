import { Button } from "@/components/ui";
import supabase from "@/services/Supabase/BaseClient";
import { useState, useEffect } from "react";
import HandleFeedback from "@/components/ui/FeedBack";
import { useAppSelector, useAppDispatch, setProductsSelected } from "@/store";
import { ProductVariation } from "@/@types/products";
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
  const [products, setProducts] = useState<Product[] | null>(null);
  const { loading, error, success, handleLoading, handleError, handleSuccess } =
    HandleFeedback();
  const dispatch = useAppDispatch();

  const { productsSelected } = useAppSelector((state) => state.products);
  const [isDisabled, setIsDisabled] = useState(true);

  const addOrUpdateItem = (item: ProductVariation) => {
    const existingItem = productsSelected.find((i) => i.id === item.id);
    console.log("asd", existingItem);
    if (existingItem) {
      const a = productsSelected.filter((item2) => item.id !== item2.id);
      console.log("asdas", a);
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
          className=""
          size="md"
          onClick={() => {
            handleSuccess("Éxito al Cargar Productos");
          }}
        >
          Realizar Orden con {productsSelected.length} Productos
        </Button>
      </div>
      {products.map((product) => (
        <section key={product.id}>
          <h1 className="text-3xl font-bold mb-6">{product.name}</h1>
          <p
            className="text-gray-600 mb-8"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          <div className="overflow-x-auto">
            <div className={"flex space-x-6 pb-4"}>
              {product.product_variations.map((variation) => {
                const psfinded = productsSelected.find(
                  (PS) => PS.id === variation.id
                );
                return (
                  <div
                    key={variation.id}
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
                      {variation.attribute_values.map((attr) => (
                        <span
                          key={attr.id}
                          className="bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mb-1"
                        >
                          {attr.value}
                        </span>
                      ))}
                    </div>
                    <div className="my-10"></div>
                    <div className="absolute bottom-5">
                      <Button
                        style={{width: "200px"}}
                        type="button"
                        variant={psfinded ? "solid" : "default"}
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
