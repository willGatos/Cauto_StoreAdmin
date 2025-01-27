import { ProductVariation } from "@/@types/products";
import handleEmail from "@/components/email";
import { Checkbox, Input } from "@/components/ui";
import Button from "@/components/ui/Button";
import HandleFeedback from "@/components/ui/FeedBack";
import Label from "@/components/ui/Label";
import Prices from "@/components/ui/Prices";
import supabase from "@/services/Supabase/BaseClient";
import { setProductsSelected, useAppDispatch, useAppSelector } from "@/store";
import UploadWidget from "@/views/inventory/Product/ProductForm/components/Images";
import { useEffect, useState } from "react";
import ContactInfo from "./ContactInfo";
import ShippingAddress from "./ShippingAddress";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const [tabActive, setTabActive] = useState<
    "ContactInfo" | "ShippingAddress" | "PaymentMethod"
  >("ContactInfo");

  const { handleError } = HandleFeedback();
  const {
    shopId,
    id,
    name: sellerName,
    sellersShops,
  } = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [orderItems, setOrderItems] = useState([
    {
      variation_id: 0,
      client_id: 0,
      price: 0,
      quantity: 0,
    },
  ]);
  const [clientId, setClientId] = useState(0);
  const [hasPersonalizedOrder, setHasPersonalizedOrder] = useState(false);
  const [personalizedOrder, setPersonalizedOrders] = useState({
    order_id: 0,
    custom_description: 0,
    images: [],
    price: 0,
    quantity: 1,
  });

  const [order, setOrder] = useState({
    subtotal: 0,
    personalizedOrder: 0,
    shipping: 0,
    total: 0,
  });

  const [delivery, setDelivery] = useState({
    municipality: "",
    province: "",
    address: "",
    shipping_cost: 0,
  });
  const { productsSelected, offersSelected } = useAppSelector(
    (state) => state.products
  );
  useEffect(() => {
    const newOrderItems = productsSelected.map((product) => ({
      variation_id: product.id,
      client_id: 0, // Asumiendo que el client_id se maneja de otra manera
      price: product.price,
      quantity: 1, // Asumiendo una cantidad inicial de 1
    }));
    setOrderItems(newOrderItems);
  }, []);

  useEffect(() => {
    console.log(offersSelected);
    const ps =
      productsSelected?.reduce((acc, curr) => {
        // For each product, multiply its price by the quantity ordered
        const quantity =
          orderItems.find((oi) => oi.variation_id === curr.id)?.quantity || 0;
        return acc + curr.price * quantity;
      }, 0) || 0;

    const offersTotalCost = offersSelected.reduce((total, offer) => {
      return total + offer.price;
    }, 0);
    setOrder({
      subtotal: ps,
      shipping: +delivery.shipping_cost,
      personalizedOrder: personalizedOrder.price * personalizedOrder.quantity,

      total:
        ps +
        +delivery.shipping_cost +
        offersTotalCost +
        +personalizedOrder.price * personalizedOrder.quantity,
    });
  }, [
    personalizedOrder.quantity,
    personalizedOrder.price,
    productsSelected,
    delivery.shipping_cost,
    orderItems,
  ]);
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phone: "",
    email: "",
    hasDelivery: false,
  });
  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id);
    setTimeout(() => {
      element?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };
  const handleImageUpload = async (error, result, widget) => {
    if (error) {
      widget.close({
        quiet: true,
      });
      return;
    }
    setPersonalizedOrders((po) => ({ ...po, images: [...po.images, result] }));
  };

  const createOrderItemsArray = (allVariations: any[], orderId: number) => {
    return allVariations.map((variation) => ({
      order_id: orderId,
      variation_id: variation.id,
      price: variation.offer_price,
      quantity: variation.required_quantity || 1,
    }));
  };

  const { handleSuccess } = HandleFeedback();
  const onSubmit = async () => {
    try {
      const hasNewClient = clientId === 0;
      let clientIdForAPI = clientId;

      // Validación básica de campos obligatorios
      const { name, lastName, phone, email } = formData;
      if (
        !name?.trim() ||
        !lastName?.trim() ||
        !phone?.trim() ||
        !email?.trim()
      ) {
        handleError("Todos los campos en CONTACTO son obligatorios");
        return;
      }

      // Validar tienda asociada
      if (!sellersShops?.length) {
        handleError("El vendedor no tiene tienda asociada");
        return;
      }
      const shopId = sellersShops[0];

      let locationId = null;
      const hasDel = formData.hasDelivery;

      // 1. Manejo de ubicación para delivery
      if (hasDel) {
        if (!delivery?.address?.trim() || !delivery?.municipality) {
          handleError("Faltan datos de entrega");
          return;
        }

        if (hasNewClient) {
          // Lógica para nuevo cliente (igual que antes)
          const { data: locationData, error: locationError } = await supabase
            .from("locations")
            .upsert({
              description: delivery.address,
              municipality_id: delivery.municipality,
            })
            .select("id")
            .single();

          if (locationError || !locationData) {
            throw new Error(
              "Error creando ubicación: " + locationError?.message
            );
          }
          locationId = locationData.id;
        } else {
          // Verificar cliente existente
          const { data: existingClient, error: fetchError } = await supabase
            .from("clients")
            .select("location_id")
            .eq("id", clientId)
            .single();

          if (fetchError)
            throw new Error("Error obteniendo cliente: " + fetchError.message);

          if (!existingClient.location_id) {
            // Cliente sin ubicación: crear nueva
            const { data: locationData, error: locationError } = await supabase
              .from("locations")
              .upsert({
                description: delivery.address,
                municipality_id: delivery.municipality,
              })
              .select("id")
              .single();

            if (locationError || !locationData) {
              throw new Error(
                "Error creando ubicación: " + locationError?.message
              );
            }

            // Actualizar cliente con nueva ubicación
            const { error: updateError } = await supabase
              .from("clients")
              .update({ location_id: locationData.id })
              .eq("id", clientId);

            if (updateError)
              throw new Error(
                "Error actualizando cliente: " + updateError.message
              );
            locationId = locationData.id;
          } else {
            // Cliente CON ubicación existente: comparar detalles
            const { data: currentLocation, error: locError } = await supabase
              .from("locations")
              .select("description, municipality_id")
              .eq("id", existingClient.location_id)
              .single();

            if (locError)
              throw new Error(
                "Error obteniendo ubicación: " + locError.message
              );

            // Comparar dirección Y municipio
            const isSameLocation =
              currentLocation.description === delivery.address.trim() &&
              currentLocation.municipality_id === delivery.municipality;

            if (!isSameLocation) {
              // Crear nueva ubicación para el cambio
              const { data: newLocation, error: locationError } = await supabase
                .from("locations")
                .upsert({
                  description: delivery.address,
                  municipality_id: delivery.municipality,
                })
                .select("id")
                .single();

              if (locationError || !newLocation) {
                throw new Error(
                  "Error actualizando ubicación: " + locationError?.message
                );
              }

              // Actualizar cliente con nueva ubicación
              const { error: updateError } = await supabase
                .from("clients")
                .update({ location_id: newLocation.id })
                .eq("id", clientId);

              if (updateError)
                throw new Error(
                  "Error actualizando cliente: " + updateError.message
                );
              locationId = newLocation.id;
            } else {
              // Usar ubicación existente si es la misma
              locationId = existingClient.location_id;
            }
          }
        }
      }

      // 2. Crear/Actualizar cliente
      if (hasNewClient) {
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .upsert({
            name,
            lastname: lastName,
            phone,
            email,
            location_id: locationId,
          })
          .select("id")
          .single();

        if (clientError || !clientData) {
          throw new Error("Error creando cliente: " + clientError?.message);
        }
        clientIdForAPI = clientData.id;

        // Vincular cliente con vendedor
        const { error: linkError } = await supabase
          .from("clients_sellers")
          .upsert({ seller_id: id, client_id: clientIdForAPI });

        if (linkError)
          throw new Error("Error vinculando cliente: " + linkError.message);
      } else {
        // Actualizar solo datos básicos (la ubicación ya se manejó antes si era necesario)
        const { data: clientData, error: updateError } = await supabase
          .from("clients")
          .update({ name, lastname: lastName, phone, email })
          .eq("id", clientId)
          .select("id")
          .single();

        if (updateError || !clientData) {
          throw new Error(
            "Error actualizando cliente: " + updateError?.message
          );
        }
      }

      // 3. Crear orden
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .upsert({
          status: 1,
          total: order.total,
          shop_id: shopId,
          client_id: clientIdForAPI,
          seller_id: id,
          shipping_cost: hasDel ? delivery.shipping_cost : 0,
          amount_paid: order.total / 2,
        })
        .select("id")
        .single();

      if (orderError || !orderData) {
        throw new Error("Error creando orden: " + orderError?.message);
      }

      // 4. Items de la orden
      const oiArray = [
        ...createOrderItemsArray(
          offersSelected.reduce((acc, os) => acc.concat(os.variations), []),
          orderData.id
        ),
        ...orderItems.map((oi) => ({
          order_id: orderData.id,
          variation_id: oi.variation_id,
          price: oi.price,
          quantity: oi.quantity,
        })),
      ];

      if (oiArray.length === 0) {
        throw new Error("La orden debe tener al menos un item");
      }

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(oiArray);

      if (itemsError)
        throw new Error("Error insertando items: " + itemsError.message);

      // 5. Orden personalizada
      if (hasPersonalizedOrder) {
        if (
          !personalizedOrder?.custom_description ||
          !personalizedOrder?.price
        ) {
          handleError("Faltan datos en la orden personalizada");
          return;
        }

        const { error: customError } = await supabase
          .from("personalized_orders")
          .upsert({
            order_id: orderData.id,
            custom_description: personalizedOrder.custom_description,
            images: personalizedOrder.images,
            price: personalizedOrder.price,
            quantity: personalizedOrder.quantity,
          });

        if (customError)
          throw new Error(
            "Error en orden personalizada: " + customError.message
          );
      }

      // 6. Notificaciones
      const { data: shopData } = await supabase
        .from("shops")
        .select("owner:owner_id(email)")
        .eq("id", shopId)
        .single();

      // Enviar emails con manejo de errores robusto
      const sendWithRetry = async (fn, retries = 2) => {
        for (let i = 0; i < retries; i++) {
          try {
            await fn();
            return;
          } catch (error) {
            if (i === retries - 1) throw error;
          }
        }
      };

      try {
        await sendWithRetry(() => handleEmail(1, email));
      } catch (error) {
        console.error("Error enviando email al cliente:", error);
      }

      if (shopData?.owner?.email) {
        try {
          await sendWithRetry(() =>
            handleEmail(
              6,
              shopData.owner.email,
              orderData.id,
              `${name} ${lastName}`,
              sellerName
            )
          );
        } catch (error) {
          handleError("No se pudo notificar al dueño. Contactar manualmente.");
        }
      }

      // Éxito
      dispatch(
        setProductsSelected({ productsSelected: [], offersSelected: [] })
      );
      navigate("/app/sales/sellerCatalog");
      handleSuccess("Orden creada correctamente");
    } catch (error) {
      console.error("Error completo:", error);
      handleError(error.message || "Error desconocido");
    }
  };
  const dispatch = useAppDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPersonalizedOrders((prevOrders) => ({ ...prevOrders, [name]: value }));
  };
  const renderProduct = (item: ProductVariation, index: number) => {
    const { pictures, price, name } = item;
    const equalOnOrderItems = orderItems.find(
      (oi) => oi.variation_id == item.id
    );
    const handleQuantityChange = (variationId, newQuantity) => {
      setOrderItems((prevItems) =>
        prevItems.map((item) =>
          item.variation_id === variationId
            ? { ...item, quantity: parseInt(newQuantity, 10) }
            : item
        )
      );
    };

    return (
      <div key={index} className="relative flex py-7 first:pt-0 last:pb-0">
        <div className="relative h-36 w-24 sm:w-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <img
            src={pictures[0]}
            alt={name}
            className="h-full w-full object-contain object-center"
          />
        </div>

        <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between">
              <div className="flex-[1.5] ">
                <h3 className="text-base font-semibold">{name}</h3>
                <div className=" flex justify-between w-full sm:hidden relative">
                  <Prices
                    contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium h-full"
                    price={price}
                  />
                </div>
              </div>

              <div className="hidden flex-1 sm:flex justify-end">
                <Prices price={price} className="mt-0.5" />
              </div>
            </div>
          </div>

          <div className="flex mt-auto pt-4 items-end justify-between text-sm">
            <div className="sm:block relative">
              <Label>Cant. a Comprar</Label>

              <Input
                value={equalOnOrderItems?.quantity}
                onChange={(e) =>
                  handleQuantityChange(
                    equalOnOrderItems.variation_id,
                    e.target.value
                  )
                }
                className="mt-1.5"
                name="quantity"
                type="number"
                min="0"
              />
            </div>

            {item.offerPrice && (
              <a
                href="##"
                className="relative z-10 flex items-center mt-3 font-medium text-primary-6000 hover:text-primary-500 text-sm "
              >
                <span
                  onClick={() => {
                    dispatch(
                      setProductsSelected({
                        ...productsSelected,
                        productsSelected: productsSelected.filter(
                          (item2) => item.id !== item2.id
                        ),
                      })
                    );
                  }}
                >
                  Remover
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProductOffers = (item, index: number) => {
    const { pictures, offer_price, name, required_quantity } = item;
    console.log(item.price, offer_price);
    const equalOnOrderItems = orderItems.find(
      (oi) => oi.variation_id == item.id
    );
    const handleQuantityChange = (variationId, newQuantity) => {
      setOrderItems((prevItems) =>
        prevItems.map((item) =>
          item.variation_id === variationId
            ? { ...item, quantity: parseInt(newQuantity, 10) }
            : item
        )
      );
    };

    return (
      <div key={index} className="relative flex py-7 first:pt-0 last:pb-0">
        <div className="relative h-36 w-24 sm:w-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <img
            src={pictures[0]}
            alt={name}
            className="h-full w-full object-contain object-center"
          />
        </div>

        <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between">
              <div className="flex-[1.5] ">
                <h3 className="text-base font-semibold">{name}</h3>

                <div className=" flex justify-between w-full sm:hidden relative">
                  <Prices
                    contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium h-full"
                    price={offer_price}
                  />
                </div>
              </div>

              <div className="hidden flex-1 sm:flex justify-end">
                <Prices price={offer_price} className="mt-0.5" />
              </div>
            </div>
          </div>

          <div className="flex mt-auto pt-4 items-end justify-between text-sm">
            <div className="sm:block relative">
              <Label>Cant. a Comprar</Label>

              <Input
                value={item?.required_quantity}
                onChange={(e) =>
                  handleQuantityChange(
                    equalOnOrderItems.variation_id,
                    e.target.value
                  )
                }
                className="mt-1.5"
                name="quantity"
                type="number"
                min="0"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLeft = () => {
    return (
      <div className="space-y-8">
        <div id="ContactInfo" className="scroll-mt-24">
          <ContactInfo
            isActive={tabActive === "ContactInfo"}
            onOpenActive={() => {
              setTabActive("ContactInfo");
              handleScrollToEl("ContactInfo");
            }}
            onCloseActive={() => {
              formData.hasDelivery && setTabActive("ShippingAddress");
              handleScrollToEl("ShippingAddress");
            }}
            formSubmit={formData}
            setFormSubmit={setFormData}
            setFormDev={setDelivery}
            setClientId={setClientId}
          />
        </div>

        <div id="ShippingAddress" className="scroll-mt-24">
          <ShippingAddress
            isActive={tabActive === "ShippingAddress"}
            onOpenActive={() => {
              setTabActive("ShippingAddress");
              handleScrollToEl("ShippingAddress");
            }}
            onCloseActive={() => {
              setTabActive("ShippingAddress");
            }}
            formData={formData}
            delivery={delivery}
            setFormSubmit={setDelivery}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="nc-CheckoutPage">
      <main className="container py-16 lg:pb-28 lg:pt-20 ">
        <div className="mb-16">
          <h3 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold ">
            Revision de Productos
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1">{renderLeft()}</div>

          <div className="flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 my-10 lg:my-0 lg:mx-10 xl:lg:mx-14 2xl:mx-16 "></div>

          <div className="w-full lg:w-[36%] ">
            <h3 className="text-lg font-semibold">Resumen de Ordenes</h3>
            <div className="mt-8 divide-y divide-slate-200/70 dark:divide-slate-700 ">
              {offersSelected.length > 0 && <h3>Ofertas</h3>}
              {offersSelected.map((os) => (
                <div>
                  <h4>{os.name}</h4>
                  {os.variations.map(renderProductOffers)}
                </div>
              ))}
            </div>
            <div className="mt-8 divide-y divide-slate-200/70 dark:divide-slate-700 ">
              {productsSelected.map(renderProduct)}
            </div>

            <div className="mt-10 pt-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-slate-700 ">
              <div className="flex justify-center text-center mb-5">
                <Checkbox
                  checked={hasPersonalizedOrder}
                  onChange={(value: boolean) => setHasPersonalizedOrder(value)}
                  className="!text-sm"
                  name="hasDelivery"
                />
                <Label className="text-sm">Agregar Orden Personalizada</Label>
              </div>
              {hasPersonalizedOrder && (
                <div>
                  <div>
                    <Label className="text-sm">
                      Descripción de Orden Personalizada
                    </Label>
                    <Input
                      value={personalizedOrder.custom_description}
                      onChange={handleChange}
                      className="mt-1.5"
                      name="custom_description"
                      textArea
                    />
                  </div>
                  <div className="flex gap-5">
                    <div>
                      <Label className="text-sm">Cantidad</Label>
                      <Input
                        onChange={handleChange}
                        className="mt-1.5"
                        name="quantity"
                        value={personalizedOrder.quantity}
                        type="number"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Precio a Pagar</Label>
                      <Input
                        onChange={handleChange}
                        className="mt-1.5"
                        name="price"
                        value={personalizedOrder.price}
                        type="number"
                      />
                    </div>
                  </div>
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
                        <Button
                          type="button"
                          className="mt-2"
                          onClick={handleOnClick}
                        >
                          Agregar Imagen
                        </Button>
                      );
                    }}
                  </UploadWidget>
                  <div>
                    {personalizedOrder.images.map((image) => (
                      <img src={image} key={image} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-between py-2.5">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  ${order.subtotal}
                </span>
              </div>
              <div className="flex justify-between  py-2.5">
                <span>Orden por Ofertas Total</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {" "}
                  {offersSelected.reduce((total, offer) => {
                    return total + offer.price;
                  }, 0)}
                </span>
              </div>
              {formData.hasDelivery && (
                <div className="flex justify-between py-2.5">
                  <span>Costo de Mensajería</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {order.shipping}
                  </span>
                </div>
              )}
              {hasPersonalizedOrder && (
                <div className="flex justify-between py-2.5">
                  <span>Costo de Personalización</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {personalizedOrder.price * personalizedOrder.quantity}
                  </span>
                </div>
              )}

              {
                // <div className="flex justify-between py-2.5">
                //   <span>Impuestos Estimados</span>
                //   <span className="font-semibold text-slate-900 dark:text-slate-200">
                //     $24.90
                //   </span>
                // </div>
              }

              <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-200 text-base pt-4">
                <span>Orden Total</span>
                <span> {order.total}</span>
              </div>
            </div>
            <Button
              //href="/account-my-order"
              className="mt-8 w-full"
              variant="solid"
              onClick={onSubmit}
              type="submit"
            >
              Confirmar Orden
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
