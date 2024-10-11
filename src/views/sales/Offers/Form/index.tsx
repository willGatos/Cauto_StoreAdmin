import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronDown, ChevronRight } from "lucide-react";
import supabase from "@/services/Supabase/BaseClient";
import { supabaseService } from "@/services/Supabase/AttributeService";
import UploadWidget from "@/views/inventory/Product/ProductForm/components/Images";
import Prices from "@/components/ui/Prices";
import { useAppSelector } from "@/store";

interface Product {
  id: number;
  name: string;
  variations: ProductVariation[];
}

interface ProductVariation {
  id: number;
  name: string;
  offer_price: number;
  price: number;
}

interface Currency {
  id: number;
  name: string;
  exchange_rate: number;
}

interface Offer {
  id?: number;
  name: string;
  description: string;
  long_description: string;
  general_offer_price: number;
  startDate: string;
  endDate: string;
  shopId: number;
  products: OfferProduct[];
}

interface OfferProduct {
  id?: number;
  productId: number;
  variations: OfferProductVariation[];
}

interface OfferProductVariation {
  id?: number;
  variationId: number;
  offer_price: number;
  currencyId: number;
  required_quantity: number;
}

export default function OfferForm() {
  const [currency, setCurrency] = useState([]);

  const [error, updateError] = useState();
  const [localImages, setLocalImages] = useState([]);
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer>({
    name: "",
    description: "",
    long_description: "",
    general_offer_price: 0,
    startDate: "",
    endDate: "",
    shopId: 1,
    products: [],
  });
  const [expandedProducts, setExpandedProducts] = useState<
    Record<number, boolean>
  >({});
  const [selectedProducts, setSelectedProducts] = useState<
    Record<number, boolean>
  >({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchProducts();
    supabaseService.getCurrencies().then(setCurrency);
    if (id) {
      fetchOffer(parseInt(id));
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select(`
        id,
        name,
        variations:product_variations (
          id,
          name,
          price
        )
      `);
    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
  };

  const fetchOffer = async (offerId: number) => {
    const { data, error } = await supabase
      .from("offers")
      .select(
        `
        *,
        products:offer_products (
          id,
          product_id,
          variations:offer_product_variations (
            id,
            product_variation_id,
            offer_price,
            currency_id
          )
        )
      `
      )
      .eq("id", offerId)
      .single();

    if (error) {
      console.error("Error fetching offer:", error);
    } else if (data) {
      const formattedOffer: Offer = {
        ...data,
        startDate: data.start_date,
        endDate: data.end_date,
        shopId: data.shop_id,
        products: data.products.map((p: any) => ({
          id: p.id,
          productId: p.product_id,
          variations: p.variations.map((v: any) => ({
            id: v.id,
            variationId: v.product_variation_id,
            offer_price: v.offer_price,
            currencyId: v.currency_id,
          })),
        })),
      };
      console.log(formattedOffer);

      setOffer(formattedOffer);
      const selectedProductIds = formattedOffer.products.map(
        (p) => p.productId
      );
      setSelectedProducts(
        selectedProductIds.reduce(
          (acc: Record<number, boolean>, id: number) => {
            acc[id] = true;
            return acc;
          },
          {}
        )
      );
    }
    setLoading(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOffer((prev) => ({ ...prev, [name]: value }));
  };

  const toggleProductExpansion = (productId: number) => {
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleProductSelection = async (
    productId: number,
    isChecked: boolean
  ) => {
    setSelectedProducts((prev) => ({ ...prev, [productId]: isChecked }));
    if (isChecked) {
      setOffer((prev) => ({
        ...prev,
        products: [...prev.products, { productId, variations: [] }],
      }));
    } else {
      setOffer((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.productId !== productId),
      }));
    }
  };
  const { shopId } = useAppSelector((state) => state.auth.user);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [offersVariations, setOffersVariations] = useState([]);
  const handleVariationSelection = async (
    variationId: number,
    isChecked: boolean
  ) => {
    setSelectedVariations((prev) => ({ ...prev, [variationId]: isChecked }));
    console.log(selectedVariations, offersVariations);
    if (isChecked) {
      setOffersVariations((prev) => [
        ...prev,
        {
          variationId,
          offer_price: 0,
          currencyId: 1,
          required_quantity: 0,
        },
      ]);
    } else {
      setOffersVariations((prev) =>
        prev.filter((v) => v.variationId !== variationId)
      );
    }
  };
  const calculateTotalOfferPrice = () => {
    // Filter offersVariations to get only the selected variations
    const selectedVariations2 = Object.keys(selectedVariations)
      .filter((variationId) => selectedVariations[variationId])
      .map(Number);

    const selectedOffersVariations = offersVariations.filter((v) =>
      selectedVariations2.includes(v.variationId)
    );

    // Calculate the sum of offer prices
    const totalOfferPrice = selectedOffersVariations.reduce((acc, current) => {
      // For each selected variation, add its offer price to the accumulator
      return acc + current.offer_price;
    }, 0);

    // Return the total offer price
    return totalOfferPrice;
  };

  const handleUpdate = (variationId: number, target) => {
    console.log(offersVariations, { [target.name]: target.value });
    let price = null;
    setOffersVariations((prev) => {
      return prev.map((v) => {
        return v.variationId === variationId
          ? { ...v, [target.name]: parseFloat(target.value) || 0 }
          : v;
      });
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const offerData = {
      name: offer.name,
      description: offer.description,
      long_description: offer.long_description,
      general_offer_price: offer.general_offer_price,
      start_date: offer.startDate,
      end_date: offer.endDate,
      shop_id: shopId,
      images: localImages,
    };

    let offerId: number;

    if (id) {
      // Update existing offer
      const { data, error } = await supabase
        .from("offers")
        .update(offerData)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating offer:", error);
        setLoading(false);
        return;
      }
      offerId = parseInt(id);
    } else {
      // Create new offer
      const { data, error } = await supabase
        .from("offers")
        .insert(offerData)
        .select();

      if (error) {
        console.error("Error creating offer:", error);
        setLoading(false);
        return;
      }
      offerId = data![0].id;
    }

    // Evitando Repeticiones
    const { data: offersProducts } = await supabase
      .from("offer_products")
      .select("id")
      .eq("offer_id", offerId);

    // Eliminar variaciones existentes para todos los productos de la oferta
    const { data: deletedVariations, error: deleteVariationError } =
      await supabase
        .from("offer_product_variations")
        .delete()
        .in(
          "offer_product_id",
          offersProducts.map((p) => p.id)
        );

    // Insert new offer products and variations
    for (const product of offer.products) {
      const { data: offerProductData, error: offerProductError } =
        await supabase
          .from("offer_products")
          .insert({ offer_id: offerId, product_id: product.productId })
          .select();

      if (offerProductError) {
        console.error("Error inserting offer product:", offerProductError);
        continue;
      }

      const offerProductId = offerProductData![0].id;

      // Insertar nuevas variaciones
      const selectedVariations2 = Object.keys(selectedVariations)
        .filter((variationId) => selectedVariations[variationId])
        .map(Number);

      const variationsToInsert = offersVariations.filter((v) =>
        selectedVariations2.includes(v.variationId)
      );

      const { error: insertError } = await supabase
        .from("offer_product_variations")
        .insert(
          variationsToInsert.map((v) => ({
            product_variation_id: v.variationId,
            offer_price: v.offer_price,
            currency_id: v.currencyId,
            offer_product_id: offerProductId,
            required_quantity: v.required_quantity || 0,
          }))
        );

      if (insertError) {
        console.error("Error inserting offer product variations:", insertError);
      }
    }

    setLoading(false);
    // Redirect or show success message
  };

  const handleImageUpload = async (error, result, widget) => {
    console.log("VIDEO");
    console.log(result, error);

    if (error) {
      updateError(error);
      widget.close({
        quiet: true,
      });
      return;
    }
    setLocalImages((prevImages) => [...prevImages, result]);

    // Actualizar el estado con una imagen de carga
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col space-y-2">
        {" "}
        <div className="group relative rounded border p-2 flex">
          {localImages.map((e) => (
            <img
              className="rounded max-h-[140px] max-w-full"
              src={e}
              alt={""}
            />
          ))}
        </div>
      </div>

      <h5>Imagenes</h5>
      <UploadWidget
        onUpload={(error, result, widget) => {
          const img = result?.info?.secure_url;
          handleImageUpload(error, img, widget);
        }}
      >
        {({ open }) => {
          function handleOnClick(e) {
            e.preventDefault();
            open();
          }
          return (
            <label className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded cursor-pointer">
              <button onClick={handleOnClick}>
                <span className="text-4xl text-gray-500">+</span>
              </button>
            </label>
          );
        }}
      </UploadWidget>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Nombre de la oferta
        </label>
        <Input
          id="name"
          name="name"
          value={offer.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Descripción
        </label>
        <Input
          id="description"
          name="description"
          value={offer.description}
          onChange={handleInputChange}
          rows={3}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Descripción
        </label>
        <Input
          id="long_description"
          name="long_description"
          value={offer.long_description}
          onChange={handleInputChange}
          textArea={true}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Fecha de inicio
          </label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={offer.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700"
          >
            Fecha de fin
          </label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={offer.endDate}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Productos</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Seleccionar
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre del producto
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Expandir
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, pkey) => (
              <React.Fragment key={product.id}>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts[product.id] || false}
                      onChange={(e) =>
                        handleProductSelection(product.id, e.target.checked)
                      }
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => toggleProductExpansion(product.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {expandedProducts[product.id] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedProducts[product.id] && (
                  <tr>
                    <td colSpan={4}>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            />
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Seleccionar
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Variación
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Precio por Unidad{" "}
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Precio de oferta
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Cantidad Límite a Comprar
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Moneda
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {product.variations.map((variation, key) => {
                            const ov = offersVariations.find(
                              (ov) => ov.variationId == variation.id
                            );
                            console.log(
                              !selectedVariations[variation.id],
                              !selectedProducts[product.id]
                            );
                            return (
                              <tr key={variation.id}>
                                <td className="px-6 py-4 whitespace-nowrap" />
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedVariations[variation.id] || false
                                    }
                                    onChange={(e) =>
                                      handleVariationSelection(
                                        variation.id,
                                        e.target.checked
                                      )
                                    }
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {variation.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {variation.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="number"
                                    disabled={
                                      !selectedVariations[variation.id] &&
                                      !selectedProducts[product.id]
                                    }
                                    onChange={(e) =>
                                      handleUpdate(variation.id, e.target)
                                    }
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    value={ov?.offer_price}
                                    name="offer_price"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="number"
                                    name="required_quantity"
                                    disabled={
                                      !selectedVariations[variation.id] &&
                                      !selectedProducts[product.id]
                                    }
                                    onChange={(e) =>
                                      handleUpdate(variation.id, e.target)
                                    }
                                    value={ov?.required_quantity}
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <select
                                    disabled={
                                      !selectedVariations[variation.id] &&
                                      !selectedProducts[product.id]
                                    }
                                    //value={offer.products[pkey].variations[key].currencyId}
                                    onChange={(e) =>
                                      handleUpdate(variation.id, e.target)
                                    }
                                    value={ov?.currencyId}
                                    name="currencyId"
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  >
                                    {currency.map((currency) => (
                                      <option
                                        key={currency.id}
                                        value={currency.id}
                                      >
                                        {currency.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        type="button"
        onClick={() =>
          setOffer((prev) => ({
            ...prev,
            general_offer_price: calculateTotalOfferPrice(),
          }))
        }
      >
        Ver Precio Final
      </Button>
      <div className="flex">
        <Prices price={offer.general_offer_price} />
      </div>
      <Button type="submit" disabled={loading}>
        {id ? "Actualizar Oferta" : "Crear Oferta"}
      </Button>
    </form>
  );
}
