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
  const [isLoading, setIsLoading] = useState(true);
  const [delieveyData, setDelieveyData] = useState({
    id: null,
    description: "",
    shop_id: 0,
    created_at: Date.now(),
  });
  const { shopId } = useAppSelector((state) => state.auth.user);
  const handleFormSubmit = async (values) => {
    values.shop_id = shopId;
    let success = null;

    if (values.id) {
      const id = values.id;
      const { description, shop_id, created_at } = delieveyData;

      success = await supabase
        .from("delivery_cost")
        .update({ description, shop_id, created_at })
        .eq('id' , id)
        .select("*");
    } else {
      success = await supabase.from("delivery_cost").upsert(values);
    }
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
    setIsLoading(true);
    supabase
      .from("delivery_cost")
      .select("*")
      .eq("shop_id", shopId)
      .then(({ data }) => {
        console.log(data[0]);
        setDelieveyData(data[0]);
      });
    setIsLoading(false);
    // fetchData()
  }, []);

  return (
    <>
      <Loading loading={isLoading}>
        {!isEmpty(delieveyData.description) && (
          <>
            <DelieveryForm
              type="edit"
              initialData={delieveyData}
              onFormSubmit={handleFormSubmit}
            />
          </>
        )}
      </Loading>
    </>
  );
};

export default DelieveryWrapper;
