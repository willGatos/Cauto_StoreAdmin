import Label from "@/components/ui/Label";
import React, { FC, useEffect, useState } from "react";
import ButtonPrimary from "@/components/ui/Button";
import ButtonSecondary from "@/components/ui/Button";
import Input from "@/components/ui/Input/Input";
import Radio from "@/components/ui/Radio/Radio";
import Select from "@/components/ui/Select/Select";
import { getDelivery } from "../Delievery/DeliveryWrapper";
import { useAppSelector } from "@/store";
import supabase from "@/services/Supabase/BaseClient";
import HandleFeedback from "@/components/ui/FeedBack";

interface Props {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
  delivery;
  formData;
  setFormSubmit;
}

const getProvinces = () => {
  return supabase.from("provinces").select("*, municipalities('*')");
};
const getMunicipality = () => {
  return supabase.from("municipalities").select("*").eq("province_id", 1);
};
const ShippingAddress: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  delivery,
  formData,
  setFormSubmit,
}) => {
  const arrayOfProvinces = [{ value: 1, label: "La Habana" }];
  const { shopId, sellersShops } = useAppSelector((state) => state.auth.user);
  const [delieveyData, setDelieveyData] = useState({
    id: null,
    description: "",
    shop_id: 0,
    created_at: Date.now(),
  });
  const [municipality, setMunicipality] = useState([]);
  const [province, setProvince] = useState([]);
  useEffect(() => {
    // getProvinces().then(console.log)
    getMunicipality().then(({ data }) => setMunicipality(data));
    getDelivery(sellersShops[0]).then(({ data }) => {
      console.log(data[0]);
      setDelieveyData(data[0]);
    });
  }, []);
  const handleChangeDeliver = (e) => {
    const { name, value } = e.target;
    console.log(delivery);
    setFormSubmit((prev) => ({ ...prev, [name]: value }));
  };
  const handleChange = (e) => {
    setFormSubmit((prev) => ({ ...prev, municipality: e.value }));
  };
  const handleChangePro = (e) => {
    console.log(e);
    setFormSubmit((prev) => ({ ...prev, province: e.value }));
  };

  const transformedLandV = municipality.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  //  onChange = { handleCategoryChange };

  const renderShippingAddress = () => {
    const { handleError } = HandleFeedback();

    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl ">
        <div className="p-6 flex flex-col sm:flex-row items-start">
          <span className="hidden sm:block">
            <svg
              className="w-6 h-6 text-slate-700 dark:text-slate-400 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.1401 15.0701V13.11C12.1401 10.59 14.1801 8.54004 16.7101 8.54004H18.6701"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.62012 8.55005H7.58014C10.1001 8.55005 12.1501 10.59 12.1501 13.12V13.7701V17.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.14008 6.75L5.34009 8.55L7.14008 10.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.8601 6.75L18.6601 8.55L16.8601 10.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <div className="sm:ml-8">
            <h3 className=" text-slate-700 dark:text-slate-300 flex ">
              <span className="uppercase">DIRECCIÓN DE ENVÍO</span>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-5 h-5 ml-3 text-slate-900 dark:text-slate-100"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </h3>
          </div>
          <ButtonSecondary
            className="bg-slate-50 dark:bg-slate-800 mt-5 sm:mt-0 sm:ml-auto !rounded-lgpy-2 px-4 text-sm font-medium"
            onClick={() => {
              formData.hasDelivery && onOpenActive();
              !formData.hasDelivery &&
                handleError("Si desea Mensajería debe habilitarla.");
            }}
          >
            Cambiar
          </ButtonSecondary>
        </div>
        <div
          className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-4 sm:space-y-6 ${
            isActive ? "block" : "hidden"
          }`}
        >
          {/* ============ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
            <div>
              <Label className="text-sm">Provincia</Label>
              <Select
                options={arrayOfProvinces}
                className="mt-1.5"
                value={arrayOfProvinces.find(
                  (prov) => prov.value === delivery.province
                )}
                onChange={handleChangePro}
              />
            </div>
            <div>
              <Label className="text-sm">Municipio</Label>
              <Select
                options={transformedLandV}
                value={transformedLandV.find(
                  (muni) => muni.value === delivery.municipality
                )}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">Dirección</Label>
            <Input
              textArea
              className="mt-1.5"
              name="address"
              value={delivery.address}
              onChange={handleChangeDeliver}
            />
          </div>

          <div>
            <p dangerouslySetInnerHTML={{ __html: delieveyData.description }} />
          </div>

          <div>
            <Label className="text-sm">Costo de Mensajería</Label>
            <Input
              className="mt-1.5"
              name="shipping_cost"
              value={delivery.shipping_cost}
              onChange={handleChangeDeliver}
              type="number"
            />
          </div>
          {/* ============ */}
          <div className="flex flex-col sm:flex-row pt-6">
            <ButtonPrimary
              className="sm:!px-7 shadow-none"
              onClick={() => {
                onCloseActive();
              }}
            >
              Guardar
            </ButtonPrimary>
            <ButtonSecondary
              className="mt-3 sm:mt-0 sm:ml-3"
              onClick={onCloseActive}
            >
              Cancelar
            </ButtonSecondary>
          </div>
        </div>
      </div>
    );
  };
  return renderShippingAddress();
};

export default ShippingAddress;
