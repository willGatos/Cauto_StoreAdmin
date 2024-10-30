import Label from "@/components/ui/Label";
import React, { FC, SetStateAction, useEffect, useRef, useState } from "react";
import ButtonPrimary from "@/components/ui/Button";
import ButtonSecondary from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox/Checkbox";
import Input from "@/components/ui/Input/Input";
import { Select } from "@/components/ui";
import { useAppSelector } from "@/store";
import supabase from "@/services/Supabase/BaseClient";

interface Props {
  isActive: boolean;
  onOpenActive: () => void;
  onCloseActive: () => void;
  setFormSubmit;
  formSubmit;
  setFormDev;
  state
}

const ContactInfo: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  formSubmit,
  setFormSubmit,
  setFormDev,
  state
}) => {
  const { id } = useAppSelector((state) => state.auth.user);

  const [clientsList, setClientsList] = useState([]);
  const [hasSelected, setHasSelected] = useState(true);
  useEffect(() => {
    // Funcion para manejar los Datos desde el servidor, incluyendo el label y el value
    // Incluyendo el ID del cliente

    async function fetchClientDeliveryData(manager_id) {
      const { data, error } = await supabase.rpc("get_manager_clients_data", {
        manager_id,
      });

      if (error) {
        console.error("Error fetching client delivery data:", error);
        return;
      }

      data.push({
        value: 0,
        label: "Cliente Nuevo",
        client_name: "",
        client_lastname: "",
        client_phone: "",
        client_email: "",
        client_has_delivery: false,
        delivery_municipality: 1,
        delivery_province: 1,
        delivery_address: "",
        delivery_shipping_cost: 0,
      });

      return data;
    }
    // Añadir un tipo de Cliente que sea "Cliente Nuevo" que tenga todos los datos en blanco

    // que deben traer a todos los Clientes de Ese Gestor

    fetchClientDeliveryData(id).then(setClientsList);
  }, []);

  //Cuando sean seleccionados deben reflejarse en el formulario
  function handleReceiverChange(deliveryData) {
    // Desbloqueando Formularios
    setHasSelected(false)

    // Definiendo que tipo de cliente se ha insertado.
    state = deliveryData.value;

    console.log(deliveryData);
    // Manejar los Cambios de Informaci'on cuando se selecciona un cliente
    setFormDev({
      municipality: deliveryData.delivery_municipality,
      province: deliveryData.delivery_province,
      address: deliveryData.delivery_address,
      shipping_cost: deliveryData.delivery_shipping_cost,
    });

    setFormSubmit({
      name: deliveryData.client_name,
      lastName: deliveryData.client_lastname,
      phone: deliveryData.client_phone,
      email: deliveryData.client_email,
      hasDelivery: deliveryData.client_has_delivery,
    });
  }
  const handleChange = (e) => {
    console.log("e", e.target.value, e.target.name);
    setFormSubmit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const onCheck = (value: boolean, e) => {
    console.log(value, e, formSubmit);

    setFormSubmit((prev) => ({ ...prev, hasDelivery: value }));
  };
  const renderAccount = () => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden z-0">
        <div className="flex flex-col sm:flex-row items-start p-6 ">
          <span className="hidden sm:block">
            <svg
              className="w-6 h-6 text-slate-700 dark:text-slate-400 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.12 12.78C12.05 12.77 11.96 12.77 11.88 12.78C10.12 12.72 8.71997 11.28 8.71997 9.50998C8.71997 7.69998 10.18 6.22998 12 6.22998C13.81 6.22998 15.28 7.69998 15.28 9.50998C15.27 11.28 13.88 12.72 12.12 12.78Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.74 19.3801C16.96 21.0101 14.6 22.0001 12 22.0001C9.40001 22.0001 7.04001 21.0101 5.26001 19.3801C5.36001 18.4401 5.96001 17.5201 7.03001 16.8001C9.77001 14.9801 14.25 14.9801 16.97 16.8001C18.04 17.5201 18.64 18.4401 18.74 19.3801Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="sm:ml-8">
            <h3 className=" text-slate-700 dark:text-slate-300 flex ">
              <span className="uppercase tracking-tight">
                INFORMACION DE CONTACTO
              </span>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-5 h-5 ml-3 text-slate-900 dark:text-slate-100 "
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
            className="bg-slate-50 dark:bg-slate-800 mt-5 sm:mt-0 sm:ml-auto !rounded-lgtext-sm font-medium py-2 px-4"
            onClick={() => onOpenActive()}
          >
            Cambiar
          </ButtonSecondary>
        </div>
        <div
          className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-4 sm:space-y-6 ${
            isActive ? "block" : "hidden"
          }`}
        >
          <div className="flex justify-between flex-wrap items-baseline">
            <h3 className="text-lg font-semibold">Información de Contacto</h3>
          </div>
          {/* ============ */}
          <div className="">
            <h5>Seleccione primero Un Cliente</h5>
            <Select
              //value={valueForSelect}
              placeholder="Seleccionar Cliente Previo"
              options={clientsList}
              onChange={handleReceiverChange}
              className="mb-16"
            />
          </div>
          <div className="max-w-lg flex gap-5">
            <div className="w-56">
              <Label className="text-sm">Nombre</Label>
              <Input
                disabled={hasSelected}
                value={formSubmit.name}
                onChange={handleChange}
                className="mt-1.5"
                name="name"
                defaultValue="Sam"
              />
            </div>
            <div className="w-56">
              <Label className="text-sm">Apellidos</Label>
              <Input
                disabled={hasSelected}
                value={formSubmit.lastName}
                onChange={handleChange}
                name="lastName"
                className="mt-1.5"
                defaultValue="Simpson"
              />
            </div>
          </div>
          <div className="max-w-lg">
            <Label className="text-sm">Teléfono de WhatsApp</Label>
            <Input
              disabled={hasSelected}
              value={formSubmit.phone}
              onChange={handleChange}
              className="mt-1.5"
              name="phone"
              defaultValue={"+53 "}
              type={"tel"}
            />
          </div>
          <div className="max-w-lg">
            <Label className="text-sm">Correo para Mantenerle al tanto</Label>
            <Input
              disabled={hasSelected}
              value={formSubmit.email}
              onChange={handleChange}
              className="mt-1.5"
              name="email"
              type={"email"}
            />
          </div>
          <div className="flex justify-center text-center">
            <Checkbox
              checked={formSubmit.hasDelivery}
              onChange={onCheck}
              className="!text-sm"
              name="hasDelivery"
            />
            <Label className="text-sm">Desea Mensajería</Label>
          </div>

          {/* ============ */}
          <div className="flex flex-col sm:flex-row pt-6">
            <ButtonPrimary
              className="sm:!px-7 shadow-none"
              onClick={() => onCloseActive()}
            >
              Guardar
              {formSubmit.hasDelivery ? " y seguir a Mensajería" : ""}
            </ButtonPrimary>
            <ButtonSecondary
              className="mt-3 sm:mt-0 sm:ml-3"
              onClick={() => onCloseActive()}
            >
              Cancel
            </ButtonSecondary>
          </div>
        </div>
      </div>
    );
  };

  return renderAccount();
};

export default ContactInfo;
