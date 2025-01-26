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
    // TODO: Y ahora si la hay. La idea ser'ia que se analizara el modelo antiguo y en base a ese, se mirara si hacer un cambio o no
    // Adem'as de eso, esta creando la location sin que sea necesario en el caso de que sea igual, y si es diferente a la original
    // lo esta haciendo mal.

    try {
      const hasNewClient = clientId == 0;
      let clientIdForAPI = clientId;

      console.log("s", delivery);
      const { name, lastName, phone, email } = formData;
      const hasDel = formData.hasDelivery;
      let locationId = null; // Falta tomarlo del fetch en Contact
      if (name && lastName && phone && email) {
        if (hasDel) {
          const { data } = await supabase
            .from("locations")
            .upsert({
              description: delivery.address,
              municipality_id: delivery.municipality,
            })
            .select("id")
            .single();
          locationId = data.id;
        }

        if (hasNewClient) {
          const { data } = await supabase
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
          clientIdForAPI = data.id;

          await supabase
            .from("clients_sellers")
            .upsert({ seller_id: id, client_id: clientIdForAPI });
        } else {
          const { data } = await supabase
            .from("clients")
            .update({
              name,
              lastname: lastName,
              phone,
              email,
              location_id: locationId,
            })
            .eq("id", clientId)
            .select("id")

            .single();
          clientIdForAPI = data.id;
        }

        const { data: orderData, error: Oerror } = await supabase
          .from("orders")
          .upsert({
            status: 2,
            total: order.total,
            shop_id: sellersShops[0],
            client_id: clientIdForAPI,
            seller_id: id,
            shipping_cost: hasDel ? delivery.shipping_cost : 0,
            amount_paid: order.total / 2,
          })
          .select("id")
          .single();
        let oiArray = orderItems.map((oi) => ({
          order_id: orderData.id,
          variation_id: oi.variation_id,
          price: oi.price,
          quantity: oi.quantity,
        }));

        const allVariations = offersSelected.reduce((acc, os) => {
          return acc.concat(os.variations);
        }, []);

        const oiArray2 = createOrderItemsArray(allVariations, orderData.id);
        oiArray = [...oiArray2, ...oiArray];

        const { error: OIError } = await supabase
          .from("order_items")
          .insert(oiArray)
          .select("*");

        const { data: dP } = await supabase
          .from("shops")
          .select("owner: owner_id(email)")
          .eq("id", sellersShops[0])
          .single();

        hasPersonalizedOrder &&
          (await supabase.from("personalized_orders").upsert({
            order_id: orderData.id,
            custom_description: personalizedOrder.custom_description,
            images: personalizedOrder.images,
            price: personalizedOrder.price,
            quantity: personalizedOrder.quantity,
          }));

        try {
          handleEmail(0, email);
        } catch (error) {
          console.error("Error al enviar correo:", error);
        }
        try {
          handleEmail(
            3,
            dP.owner.email,
            orderData.id,
            name + " " + lastName,
            sellerName
          );
        } catch {
          try {
            handleEmail(
              3,
              dP.owner.email,
              orderData.id,
              name + " " + lastName,
              sellerName
            );
          } catch {
            handleError(
              "Notificación no Enviada. Escribale por WhatsApp al Dueño de la Tienda de su nueva Orden."
            );
          }
        }
        dispatch(
          setProductsSelected({
            productsSelected: [],
            offersSelected: [],
          })
        );
        navigate("/app/sales/sellerCatalog");
      } else {
        handleError("Tienes un campo en CONTACTO sin llenar.");
      }
    } catch (error) {
      handleError(error);
    }
    handleSuccess("Éxito en Creación de Orden");
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
