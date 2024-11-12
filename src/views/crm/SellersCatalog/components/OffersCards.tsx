import { Button } from "@/components/ui";
import HandleFeedback from "@/components/ui/FeedBack";
import supabase from "@/services/Supabase/BaseClient";
import { setProductsSelected, useAppDispatch, useAppSelector } from "@/store";
import { useState, useEffect } from "react";

type ProductVariation = {
  id: number;
  name: string;
  offer_price: number;
  required_quantity: number;
};

export type Offer = {
  id: number;
  name: string;
  price: number;
  image: string;
  variations: ProductVariation[];
};

// Datos de prueba
const mockOffers: Offer[] = [
  {
    id: 1,
    name: "Oferta de Verano",
    price: 99.99,
    image: "/placeholder.svg?height=300&width=300",
    variations: [
      {
        id: 1,
        name: "Camiseta Blanca S",
        offer_price: 15.99,
        required_quantity: 2,
      },
      {
        id: 2,
        name: "Camiseta Azul M",
        offer_price: 15.99,
        required_quantity: 2,
      },
      {
        id: 3,
        name: "Shorts Rojos 32",
        offer_price: 24.99,
        required_quantity: 1,
      },
      {
        id: 4,
        name: "Shorts Verdes 34",
        offer_price: 24.99,
        required_quantity: 1,
      },
    ],
  },
  {
    id: 2,
    name: "Oferta de Invierno",
    price: 149.99,
    image: "/placeholder.svg?height=300&width=300",
    variations: [
      {
        id: 5,
        name: "Abrigo Negro M",
        offer_price: 79.99,
        required_quantity: 1,
      },
      {
        id: 6,
        name: "Abrigo Gris L",
        offer_price: 79.99,
        required_quantity: 1,
      },
      { id: 7, name: "Bufanda Roja", offer_price: 19.99, required_quantity: 2 },
    ],
  },
];

async function fetchOffers(shopId) {
  // Realizamos una consulta para obtener las ofertas con sus productos y variaciones
  const { data, error } = await supabase
    .from("offers")
    .select(
      `
        id,
        name,
        images,
        general_offer_price,
        offer_products (
          id,
          products: product_id(
            name
          ),
          offer_product_variations (
            id,
            offer_price,
            required_quantity,
            product_variations: product_variation_id(
                id,
              name,
              pictures
            )
          )
        )
      `
    )
    .eq("shop_id", shopId);

  if (error) {
    console.error("Error fetching offers:", error);
    return [];
  }

  // Transformamos los datos para que coincidan con la estructura esperada por nuestro componente React
  const transformedOffers = data.map((offer) => ({
    id: offer.id,
    name: offer.name,
    price: offer.general_offer_price,
    image: offer.images[0], // Asumimos que queremos la primera imagen
    variations: offer.offer_products.flatMap((product) =>
      product.offer_product_variations.map((variation) => ({
        id: variation.product_variations.id,
        name: `${product.products.name} - ${variation.product_variations.name}`,
        pictures: variation.product_variations.pictures,
        offer_price: variation.offer_price,
        required_quantity: variation.required_quantity,
      }))
    ),
  }));

  return transformedOffers;
}

// Uso de la función

export default function OfferDisplay() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const { shopId, authority } = useAppSelector((state) => state.auth.user);
  const { productsSelected, offersSelected } = useAppSelector(
    (state) => state.products
  );
  const dispatch = useAppDispatch();
  const { handleSuccess } = HandleFeedback();

  useEffect(() => {
    // Simula la carga de datos
    fetchOffers(shopId)
      .then((offers) => {
        // Aquí puedes actualizar el estado de tu componente React con estos datos
        setOffers(offers);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [authority]);

  // Function to add or update a product variation
  const addOrUpdateItem = (item) => {
    // Find if the item already exists in productsSelected
    const existingItem = offersSelected.find((i) => i.id === item.id);
    if (existingItem) {
      // Dispatch action to update redux state

      dispatch(
        setProductsSelected({
          productsSelected: productsSelected,
          offersSelected: offersSelected.filter(
            (item2) => item.id !== item2.id
          ),
        })
      );
      handleSuccess("Éxito sacar el Producto");
    } else {
      dispatch(
        setProductsSelected({
          productsSelected: productsSelected,
          offersSelected: [...offersSelected, item],
        })
      );
      handleSuccess("Éxito introducir el Producto");
    }
  };

  if (offers.length === 0) {
    return <div>Cargando ofertas...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {offers.map((offer) => {
        const psfinded = offersSelected.find((PS) => PS.id === offer.id);
        return (
          <section key={offer.id} className="mb-12 border-b pb-8">
            <div className="flex items-center mb-6">
              <img
                src={offer.image}
                alt={offer.name}
                width={100}
                height={100}
                className="rounded-lg object-cover mr-4"
              />
              <div>
                <h2 className="text-2xl font-bold">{offer.name}</h2>
                <p className="text-xl font-semibold text-blue-600">
                  ${offer.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-4">
                {offer.variations.map((variation, key) => (
                  <div
                    key={key}
                    className="flex-shrink-0 w-48 border rounded-lg p-4 shadow-md"
                  >
                    <h3 className="text-lg font-medium mb-2">
                      {variation.name}
                    </h3>
                    <p className="text-sm mb-1">
                      Precio: ${variation.offer_price.toFixed(2)}
                    </p>
                    <p className="text-sm font-semibold">
                      Cantidad requerida: {variation.required_quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Button
                style={{ width: "200px" }}
                type="button"
                variant={psfinded ? "twoTone" : "solid"}
                size="md"
                onClick={() => {
                  addOrUpdateItem(offer);
                }}
              >
                {psfinded ? <>Sacar Oferta </> : <>Agregar Oferta </>}
              </Button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
