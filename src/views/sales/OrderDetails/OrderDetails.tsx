import { useState, useEffect } from "react";
import classNames from "classnames";
import Tag from "@/components/ui/Tag";
import Loading from "@/components/shared/Loading";
import Container from "@/components/shared/Container";
import DoubleSidedImage from "@/components/shared/DoubleSidedImage";
import OrderProducts from "./components/OrderProducts";
import PaymentSummary from "./components/PaymentSummary";
import ShippingInfo from "./components/ShippingInfo";
import Activity from "./components/Activity";
import CustomerInfo from "./components/CustomerInfo";
import { HiOutlineCalendar } from "react-icons/hi";
import { apiGetSalesOrderDetails } from "@/services/SalesService";
import { useLocation } from "react-router-dom";
import isEmpty from "lodash/isEmpty";
import dayjs from "dayjs";
import supabase from "@/services/Supabase/BaseClient";
import { Button, Select } from "@/components/ui";
import {
  deliveryStatusColor,
  orderStatusColor,
} from "../SalesDashboard/components/LatestOrder";
import Label from "@/components/ui/Label";
import handleEmail from "@/components/email";
import PersonalizationDetails from "./components/PersonalizationDetails";

type SalesOrderDetailsResponse = {
  id?: string;
  progressStatus?: number;
  deliveryStatus?: number;
  dateTime?: number;
  paymentSummary?: {
    subTotal: number;
    tax: number;
    personalization: number;
    deliveryFees: number;
    total: number;
  };
  shipping?: {
    deliveryFees: number;
    estimatedMin: number;
    estimatedMax: number;
    shippingLogo: string;
    shippingVendor: string;
  };
  product?: {
    id: string;
    name: string;
    productCode: string;
    img: string;
    price: number;
    quantity: number;
    total: number;
    details: Record<string, string[]>;
  }[];
  activity?: {
    date: number;
    events: {
      time: number;
      action: string;
      recipient?: string;
    }[];
  }[];
  personalization: {
    description: string;
    price: string;
    quantity: string;
    images: string[];
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
    img: string;
    previousOrder: number;
    shippingAddress: {
      line1: string;
      line2: string;
      line3: string;
      line4: string;
    };
    billingAddress: {
      line1: string;
      line2: string;
      line3: string;
      line4: string;
    };
  };
};
const initialState: SalesOrderDetailsResponse = {
  id: "",
  personalization: {
    description: "",
    images: [],
    price: "0",
    quantity: "0",
  },
  progressStatus: 0,
  deliveryStatus: 0,
  dateTime: 0,
  paymentSummary: {
    subTotal: 0,
    personalization: 0,
    tax: 0,
    deliveryFees: 0,
    total: 0,
  },
  shipping: {
    deliveryFees: 0,
    estimatedMin: 0,
    estimatedMax: 0,
    shippingLogo: "",
    shippingVendor: "",
  },
  product: [],
  activity: [],
  customer: {
    name: "",
    email: "",
    phone: "",
    img: "",
    previousOrder: 0,
    shippingAddress: {
      line1: "",
      line2: "",
      line3: "",
      line4: "",
    },
    billingAddress: {
      line1: "",
      line2: "",
      line3: "",
      line4: "",
    },
  },
};

type deliveryStatus = {
  label: string;
  class: string;
};

const paymentStatus: Record<number, deliveryStatus> = {
  0: {
    label: "Paid",
    class:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100",
  },
  1: {
    label: "Unpaid",
    class: "text-red-500 bg-red-100 dark:text-red-100 dark:bg-red-500/20",
  },
  2: {
    label: "Unpaid",
    class: "text-red-500 bg-red-100 dark:text-red-100 dark:bg-red-500/20",
  },
};

export const getOrderDetails = async (
  orderId: string
): Promise<SalesOrderDetailsResponse> => {
  // Fetch order details
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
            id,
            total,
            status,
            delivery_state,
            created_at,
            shipping_cost,
            personalized_orders(*),
            clients (*, locations(*))
        `
    )
    .eq("id", orderId)
    .single();

  if (orderError) throw orderError;

  // Fetch order items
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select(
      `
            quantity,
            price,
            product_variations (
                id,
                name,
                pictures,
                products (name, images),
                currency(name),
                attribute_values(type(name),value)
            )
        `
    )
    .eq("order_id", orderId);
  const personalization = order.personalized_orders[0];
  if (itemsError) throw itemsError;
  console.log("SIMPLE", personalization?.custom_description);
  // Map the data to the required format
  const orderDetails: SalesOrderDetailsResponse = {
    id: order.id.toString(),
    progressStatus: order.status, //order.status,
    deliveryStatus: order.delivery_state, // Assuming 1 is paid, adjust as needed
    dateTime: order.created_at,
    paymentSummary: {
      subTotal: parseFloat(order.total) - parseFloat(order.shipping_cost),
      tax: 0, // Not available in the current schema
      personalization: personalization ? personalization.price : 0,
      deliveryFees: parseFloat(order.shipping_cost),
      total: parseFloat(order.total),
    },
    shipping: {
      deliveryFees: parseFloat(order.shipping_cost),
      estimatedMin: 0, // Not available in the current schema
      estimatedMax: 0, // Not available in the current schema
      shippingLogo: "", // Not available in the current schema
      shippingVendor: "", // Not available in the current schema
    },
    product: orderItems.map((item) => ({
      id: item.product_variations?.id.toString(),
      name: item.product_variations?.name,
      productCode: "",
      images: item.product_variations?.pictures,
      price: parseFloat(item?.price),
      quantity: item?.quantity,
      total: parseFloat(item?.price) * item?.quantity,
      currency: item.product_variations?.currency.name,
      attributesValues: item.product_variations?.attribute_values.map((av) => ({
        name: av.type.name,
        value: av.value,
      })),
      details: {}, // Not available in the current schema
    })),
    activity: [], // Not available in the current schema
    personalization: {
      description: personalization?.custom_description,
      images: personalization?.images,
      price: personalization?.price,
      quantity: personalization?.quantity,
    },
    customer: order.clients
      ? {
          name: order.clients.name,
          email: order.clients.email,
          phone: order.clients.phone,
          img: "", // Not available in the current schema
          previousOrder: 0, // Not available in the current schema
          shippingAddress: {
            line1: order.clients?.locations
              ? order.clients?.locations?.description +
                " " +
                order.clients?.locations?.municipalities?.name
              : "",
          },
        }
      : undefined,
  };

  return orderDetails;
};

const OrderDetails = () => {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalesOrderDetailsResponse>(initialState);
  const [stateOfProduct, setStateOfProduct] = useState(0);
  const [stateOfProduct2, setStateOfProduct2] = useState(0);
  const [options, setOptions] = useState([]);
  const [options2, setOptions2] = useState([]);

  useEffect(() => {}, []);
  useEffect(() => {
    fetchData();
    const formattedOptions = Object.values(orderStatusColor).map((option) => ({
      value: option.value,
      label: option.label,
    }));
    const formattedOptions2 = Object.values(deliveryStatusColor).map(
      (option) => ({
        value: option.value,
        label: option.label,
      })
    );
    setOptions(formattedOptions);
    setOptions2(formattedOptions2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    const id = location.pathname.substring(
      location.pathname.lastIndexOf("/") + 1
    );
    if (id) {
      setLoading(true);
      const response = await getOrderDetails(id);
      if (response) {
        setLoading(false);
        setData(response);
        console.log(response.progressStatus, response.deliveryStatus);
        setStateOfProduct(response.progressStatus);
        setStateOfProduct2(response.deliveryStatus);
      }
    }
  };

  const handleSelectChange = (option: any) => {
    console.log(option?.value);
    setStateOfProduct(option?.value);
    // supabase.from("orders").update({ status: option?.value }).eq("id", data.id);
  };
  const handleSelect2Change = (option: any) => {
    console.log(option?.value);
    setStateOfProduct2(option?.value);
  };

  const changeState = () => {
    // Tienes que hacer las llamadas de email para los Correos

    // Los Correos enviarlos a los Cliente con el Estado Correspondiente,
    if (stateOfProduct != data.progressStatus)
      handleEmail(data.progressStatus, data.customer.email);

    if (stateOfProduct2 != data.deliveryStatus)
      handleEmail(data.deliveryStatus, data.customer.email).then(() =>
        supabase
          .from("orders")
          .update({
            status: stateOfProduct,
            delivery_state: stateOfProduct2,
          })
          .eq("id", data.id)
          .select("status, delivery_state")
          .single()
      );
    // Cambiar los estados en la base de datos - deliveryState - State
  };
  return (
    <Container className="h-full">
      <Loading loading={false}>
        {!isEmpty(data) && (
          <>
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <h3>
                  <span>Orden</span>
                  <span className="ltr:ml-2 rtl:mr-2">#{data.id}</span>
                </h3>
                <Tag
                  className={classNames(
                    "border-0 rounded-md ltr:ml-2 rtl:mr-2",
                    deliveryStatusColor[data.deliveryStatus || 0].class
                  )}
                >
                  {deliveryStatusColor[data.deliveryStatus || 0].label}
                </Tag>
                <Tag
                  className={classNames(
                    "border-0 rounded-md ltr:ml-2 rtl:mr-2",
                    orderStatusColor[data.progressStatus || 0].class
                  )}
                  
                >
                  {orderStatusColor[data.progressStatus || 0].label}
                </Tag>
              </div>
              <span className="flex items-center">
                <HiOutlineCalendar className="text-lg" />
                <span className="ltr:ml-1 rtl:mr-1">
                  {dayjs(data.dateTime || 0).format("ddd DD-MMM-YYYY, hh:mm A")}
                </span>
              </span>
            </div>
            <div className="xl:flex gap-4">
              <div className="w-full">
                <OrderProducts data={data.product} />
                <div className="xl:grid grid-cols-2 gap-4">
                  {/* <ShippingInfo data={data.shipping} /> */}
                  <PaymentSummary data={data.paymentSummary} />
                </div>
                {/* <Activity data={data.activity} /> */}
              </div>
              <div className="xl:max-w-[360px] w-full">
                <CustomerInfo data={data.customer} />
              </div>
              <div className="xl:max-w-[360px] w-full">
                <PersonalizationDetails data={data.personalization} />
              </div>
            </div>
            <div className="gap-4">
              <div className="mt-5">
                <Label>Estado del Pedido</Label>
                <Select
                  options={options}
                  value={options.find((o) => o.value == stateOfProduct)}
                  onChange={handleSelectChange}
                />
              </div>
              <div className="mt-5">
                <Label>Estado de la Mensajería</Label>
                <Select
                  options={options2}
                  value={options2.find((o2) => o2.value == stateOfProduct2)}
                  onChange={handleSelect2Change}
                />
              </div>
              <div>
                <Button
                  disabled={
                    !(
                      stateOfProduct != data.progressStatus ||
                      stateOfProduct2 != data.deliveryStatus
                    )
                  }
                  className="mt-5"
                  variant="solid"
                  onClick={changeState}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </>
        )}
      </Loading>
      {!loading && isEmpty(data) && (
        <div className="h-full flex flex-col items-center justify-center">
          <DoubleSidedImage
            src="/img/others/img-2.png"
            darkModeSrc="/img/others/img-2-dark.png"
            alt="No order found!"
          />
          <h3 className="mt-8">Ninguna Orden Encontrada</h3>
        </div>
      )}
    </Container>
  );
};

export default OrderDetails;
