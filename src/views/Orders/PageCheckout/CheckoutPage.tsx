import { ProductVariation } from "@/@types/products";
import NcInputNumber from "@/components/shared/FormNumericInput";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import Prices from "@/components/ui/Prices";
import { useAppSelector } from "@/store";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ContactInfo from "./ContactInfo";
import ShippingAddress from "./ShippingAddress";
import HandleFeedback from "@/components/ui/FeedBack";
import supabase from "@/services/Supabase/BaseClient";
import { Checkbox, Input } from "@/components/ui";
import UploadWidget from "@/views/inventory/Product/ProductForm/components/Images";
import { setProductsSelected, useAppDispatch } from "@/store";
import FetchButton from "@/components/email";
import handleEmail from "@/components/email";

const CheckoutPage = () => {
  const [tabActive, setTabActive] = useState<
    "ContactInfo" | "ShippingAddress" | "PaymentMethod"
  >("ContactInfo");

  const { handleError } = HandleFeedback();
  const { shopId, id, sellersShops } = useAppSelector(
    (state) => state.auth.user
  );
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
    quantity: 0,
  });

  const [order, setOrder] = useState({
    subtotal: 0,
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
      (productsSelected?.reduce((acc, curr) => {
        // For each product, multiply its price by the quantity ordered
        const quantity =
          orderItems.find((oi) => oi.variation_id === curr.id)?.quantity || 0;
        return acc + curr.price * quantity;
      }, 0) || 0) + +personalizedOrder.price;

    const offersTotalCost = offersSelected.reduce((total, offer) => {
      return total + offer.price;
    }, 0);
    setOrder({
      subtotal: ps,
      shipping: +delivery.shipping_cost,
      total: ps + +delivery.shipping_cost + offersTotalCost,
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

  const onSubmit = async () => {
    // TODO: Y ahora si la hay. La idea ser'ia que se analizara el modelo antiguo y en base a ese, se mirara si hacer un cambio o no
    // Adem'as de eso, esta creando la location sin que sea necesario en el caso de que sea igual, y si es diferente a la original
    // , lo esta haciendo mal.

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

        console.log(offersSelected);
        const allVariations = offersSelected.reduce((acc, os) => {
          return acc.concat(os.variations);
        }, []);

        console.log(allVariations);
        const oiArray2 = createOrderItemsArray(allVariations, orderData.id);
        console.log(oiArray2);
        oiArray = [...oiArray2, ...oiArray];

        const { error: OIError } = await supabase
          .from("order_items")
          .insert(oiArray)
          .select("*");

        const { data: dP } = await supabase
          .from("shops")
          .select("owner: owner_id(email)")
          .eq(
            "id",
            sellersShops[0]
            // Debe tomar el Id desde alguno de los productos de la tienda o algo relacionado con eso.
            // Como esta ahora lo toma del Id del vendedor, pero ese vendedor tendr'a su propia tienda
            // El problema es que son variaciones de los productos lo que se esta trayendo.
            // Adem'as de eso, pueden pedir 2 productos de 2 tiendas diferentes.
            // Tienes que traer las ofertas de las 2 Tiendas
          )
          .single();
        console.log(dP.owner.email);

        hasPersonalizedOrder &&
          (await supabase.from("personalized_orders").upsert({
            order_id: orderData.id,
            custom_description: personalizedOrder.custom_description,
            images: personalizedOrder.images,
            price: personalizedOrder.price,
            quantity: personalizedOrder.quantity,
          }));
        // TODO:
        handleEmail(0, email);
        handleEmail(0, dP.owner.email);

        // La idea sería enviar un correo al del de la tienda el cual debe estar con
        // handleEmail(0, (await data).data.profiles.email);
      } else {
        handleError("Tienes un campo en CONTACTO sin llenar.");
      }
    } catch (error) {
      handleError(error);
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
                <h3 className="text-base font-semibold">
                  {name} {/* <Link to="/product-detail"></Link> */}
                </h3>
                {/* <div className="mt-1.5 sm:mt-2.5 flex text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7.01 18.0001L3 13.9901C1.66 12.6501 1.66 11.32 3 9.98004L9.68 3.30005L17.03 10.6501C17.4 11.0201 17.4 11.6201 17.03 11.9901L11.01 18.0101C9.69 19.3301 8.35 19.3301 7.01 18.0001Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.35 1.94995L9.69 3.28992"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.07 11.92L17.19 11.26"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 22H16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.85 15C18.85 15 17 17.01 17 18.24C17 19.26 17.83 20.09 18.85 20.09C19.87 20.09 20.7 19.26 20.7 18.24C20.7 17.01 18.85 15 18.85 15Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <span>{`Black`}</span>
                  </div>
                  <span className="mx-4 border-l border-slate-200 dark:border-slate-700 "></span>
                  <div className="flex items-center space-x-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 9V3H15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 15V21H9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 3L13.5 10.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.5 13.5L3 21"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <span>{`2XL`}</span>
                  </div>
                </div> */}

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

        {/* <div id="PaymentMethod" className="scroll-mt-24">
          <PaymentMethod
            isActive={tabActive === "PaymentMethod"}
            onOpenActive={() => {
              setTabActive("PaymentMethod");
              handleScrollToEl("PaymentMethod");
            }}
            onCloseActive={() => setTabActive("PaymentMethod")}
          />
        </div> */}
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
            <div className="mt-5 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center">
              <p className="block relative pl-5">
                <svg
                  className="w-4 h-4 absolute -left-1 top-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8V13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.9945 16H12.0035"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Aprender Más{` `}
                {/* <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="##"
                  className="text-slate-900 dark:text-slate-200 underline font-medium"
                >
                  Impuestos
                </a> */}
                <span>
                  {` `}and{` `}
                </span>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="##"
                  className="text-slate-900 dark:text-slate-200 underline font-medium"
                >
                  Mensajería
                </a>
                {` `} Información
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
