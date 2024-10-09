import { useState, useEffect } from "react";
import Loading from "@/components/shared/Loading";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import DelieveryForm from "./DeliveryForm";
import isEmpty from "lodash/isEmpty";
import { apiGetDelievery, apiPostDelievery } from "@/services/SalesService";
import supabase from "@/services/Supabase/BaseClient";
import { useAppSelector } from "@/store";

const DelieveryWrapper = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [delieveyData, setDelieveyData] = useState({ description: "" });
  const { shopId } = useAppSelector((state) => state.auth.user);
  const handleFormSubmit = async (values: string) => {
    console.log("SUBMIUT", values, shopId)
    const success = await supabase.from("delivery_cost").upsert(values);
    if (success) {
      popNotification("Guardada");
    }
  };

  const popNotification = (keyword: string) => {
    toast.push(
      <Notification
        title={`Successfuly ${keyword}`}
        type="success"
        duration={2500}
      >
        Mensajería Exitosamente {keyword}
      </Notification>,
      {
        placement: "top-center",
      }
    );
    // navigate('/app/sales/product-list')
  };

  useEffect(() => {
    setIsLoading(false);
    supabase
      .from("delivery_cost")
      .select("description")
      .eq("shop_id", shopId)
      .then(({ data }) => setDelieveyData(data[0]));
    // fetchData()
  }, []);

  return (
    <>
      <Loading loading={isLoading}>
        <>
          <DelieveryForm
            type="edit"
            initialData={delieveyData}
            onFormSubmit={handleFormSubmit}
          />
        </>
      </Loading>
    </>
  );
};

export default DelieveryWrapper;
