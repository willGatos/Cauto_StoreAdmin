import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { FormContainer } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Notification from "@/components/ui/Notification";
import toast from "@/components/ui/toast";
import Upload from "@/components/ui/Upload";
import supabase from "@/services/Supabase/BaseClient";
import type { FieldInputProps, FieldProps, FormikProps } from "formik";
import { Field, Form, Formik } from "formik";
import {
  HiCheck,
  HiOutlineBriefcase,
  HiOutlineMail,
  HiOutlineUser,
  HiOutlineUserCircle,
} from "react-icons/hi";
import type { ControlProps, OptionProps } from "react-select";
import { components } from "react-select";
import * as Yup from "yup";
import FormDesription from "./FormDesription";
import FormRow from "./FormRow";
import UploadWidget from "@/views/inventory/Product/ProductForm/components/Images";
import { useState } from "react";

export type ProfileFormModel = {
  name: string;
  email: string;
  logo: string;
  identifier: string;
  address: string;
  municipality_id: string;
  province_id: string;
  funds: number;
  phone_number: string;
  main_description: string;
  secondary_description: string;
};

type ProfileProps = {
  data?: ProfileFormModel;
};

type LanguageOption = {
  value: string;
  label: string;
  imgPath: string;
};

const { Control } = components;

const validationSchema = Yup.object().shape({
  name: Yup.string().nullable(),
  email: Yup.string().email("Email Inválido").required("Email Requerido"),
  logo: Yup.string().nullable(),
  identifier: Yup.string().required("Identificador Requerido"),
  address: Yup.string().nullable(),
  municipality_id: Yup.number().nullable(),
  province_id: Yup.number().nullable(),
  funds: Yup.number().required("Fondos Disponibles Requeridos"),
  phone_number: Yup.string().required("Número de Teléfono Requerido"),
  main_description: Yup.string().max(28, "Máximo 28 Caracteres").nullable(),
  secondary_description: Yup.string()
    .max(28, "Máximo 28 Caracteres")
    .nullable(),
});

const CustomSelectOption = ({
  innerProps,
  label,
  data,
  isSelected,
}: OptionProps<LanguageOption>) => {
  return (
    <div
      className={`flex items-center justify-between p-2 ${
        isSelected
          ? "bg-gray-100 dark:bg-gray-500"
          : "hover:bg-gray-50 dark:hover:bg-gray-600"
      }`}
      {...innerProps}
    >
      <div className="flex items-center">
        <Avatar shape="circle" size={20} src={data.imgPath} />
        <span className="ml-2 rtl:mr-2">{label}</span>
      </div>
      {isSelected && <HiCheck className="text-emerald-500 text-xl" />}
    </div>
  );
};

const CustomControl = ({
  children,
  ...props
}: ControlProps<LanguageOption>) => {
  const selected = props.getValue()[0];
  return (
    <Control {...props}>
      {selected && (
        <Avatar
          className="ltr:ml-4 rtl:mr-4"
          shape="circle"
          size={18}
          src={selected.imgPath}
        />
      )}
      {children}
    </Control>
  );
};

const Profile = ({
  data = {
    name: "",
    email: "",
    logo: "",
    identifier: "",
    address: "",
    municipality_id: "",
    province_id: "",
    funds: 0,
    phone_number: "",
    main_description: "",
    secondary_description: "",
  },
}: ProfileProps) => {
  const onSetFormFile = (
    form: FormikProps<ProfileFormModel>,
    field: FieldInputProps<ProfileFormModel>,
    file: File[]
  ) => {
    form.setFieldValue(field.name, URL.createObjectURL(file[0]));
  };

  const onFormSubmit = async (
    values: ProfileFormModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    console.log("values", values);
    const updateData = {
      name: values.name,
      email: values.email,
      logo: localImage,
      identifier: values.identifier,
      address: values.address,
      /*  municipality_id: values.municipality_id,
      province_id: values.province_id, */
      funds: values.funds,
      phone_number: values.phone_number,
      main_description: values.main_description,
      secondary_description: values.secondary_description,
    };
    await supabase.from("shops").update(updateData).eq("id", values.id);
    toast.push(<Notification title={"Profile updated"} type="success" />, {
      placement: "top-center",
    });
    setSubmitting(false);
  };

  const [localImage, setLocalImage] = useState("");
  const [error, updateError] = useState();

  const handleImageUpload = async (error, result, widget) => {
    if (error) {
      updateError(error);
      widget.close({
        quiet: true,
      });
      return;
    }
    setLocalImage(result);
  };
  return (
    <Formik
      enableReinitialize
      initialValues={data}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true);
        onFormSubmit(values, setSubmitting);
      }}
    >
      {({ values, touched, errors, isSubmitting, resetForm }) => {
        const validatorProps = { touched, errors };
        return (
          <Form>
            <FormContainer>
              <FormDesription
                title="General"
                desc="Información básica, como nombre y dirección, que se mostrará públicamente"
              />
              <FormRow name="logo" label="Logo" {...validatorProps}>
                <Field name="logo">
                  {({ field, form }: FieldProps) => {
                    const logoProps = field.value ? { src: field.value } : {};
                    return (
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
                            <div onClick={handleOnClick}>
                              <Avatar
                                className="border-2 border-white dark:border-gray-800 shadow-lg"
                                size={60}
                                shape="circle"
                                src={localImage}
                                icon={<HiOutlineUser />}
                              />
                            </div>
                          );
                        }}
                      </UploadWidget>
                    );
                  }}
                </Field>
              </FormRow>
              <FormRow
                name="name"
                label="Nombre de la Tienda"
                {...validatorProps}
              >
                <Field
                  type="text"
                  autoComplete="off"
                  name="name"
                  placeholder="Nombre de la Tienda"
                  component={Input}
                  prefix={<HiOutlineUserCircle className="text-xl" />}
                />
              </FormRow>
              <FormRow
                name="identifier"
                label="Identificador"
                {...validatorProps}
              >
                <Field
                  type="text"
                  autoComplete="off"
                  name="identifier"
                  placeholder="Identificador"
                  component={Input}
                />
              </FormRow>
              <FormRow
                name="email"
                label="Email"
                {...validatorProps}
                border={false}
              >
                <Field
                  type="email"
                  autoComplete="off"
                  name="email"
                  placeholder="Email"
                  component={Input}
                  prefix={<HiOutlineMail className="text-xl" />}
                />
              </FormRow>
              <FormRow
                name="phone_number"
                label="Teléfono Móvil"
                {...validatorProps}
              >
                <Field
                  type="text"
                  autoComplete="off"
                  name="phone_number"
                  placeholder="Teléfono"
                  component={Input}
                />
              </FormRow>
              <FormRow name="address" label="Dirección" {...validatorProps}>
                <Field
                  type="text"
                  autoComplete="off"
                  name="address"
                  placeholder="Dirección"
                  component={Input}
                />
              </FormRow>
              <FormRow
                name="main_description"
                label="Descripción Principal"
                {...validatorProps}
                border={false}
              >
                <Field
                  type="text"
                  autoComplete="off"
                  name="main_description"
                  placeholder="Descripción Principal"
                  component={Input}
                  prefix={<HiOutlineBriefcase className="text-xl" />}
                />
              </FormRow>
              <FormRow
                name="secondary_description"
                label="Descripción Secundaria"
                {...validatorProps}
                border={false}
              >
                <Field
                  type="text"
                  autoComplete="off"
                  name="secondary_description"
                  placeholder="Descripción Secundaria"
                  component={Input}
                  prefix={<HiOutlineBriefcase className="text-xl" />}
                />
              </FormRow>

              <div className="mt-4 ltr:text-right">
                {/* <Button
                  className="ltr:mr-2 rtl:ml-2"
                  type="button"
                  onClick={() => resetForm()}
                >
                  Resetear
                </Button> */}
                <Button variant="solid" loading={isSubmitting} type="submit">
                  {isSubmitting ? "Actualizando" : "Actualizar"}
                </Button>
              </div>
            </FormContainer>
          </Form>
        );
      }}
    </Formik>
  );
};

export default Profile;

{
  /*             <FormRow name="lang" label="Language" {...validatorProps}>
                <Field name="lang">
                  {({ field, form }: FieldProps) => (
                    <Select<LanguageOption>
                      field={field}
                      form={form}
                      options={langOptions}
                      components={{
                        Option: CustomSelectOption,
                        Control: CustomControl,
                      }}
                      value={langOptions.filter(
                        (option) => option.value === values?.lang
                      )}
                      onChange={(option) =>
                        form.setFieldValue(field.name, option?.value)
                      }
                    />
                  )}
                </Field>
              </FormRow>
              <FormRow name="timeZone" label="Time Zone" {...validatorProps}>
                <Field
                  readOnly
                  type="text"
                  autoComplete="off"
                  name="timeZone"
                  placeholder="Time Zone"
                  component={Input}
                  prefix={<HiOutlineGlobeAlt className="text-xl" />}
                />
              </FormRow>
              <FormRow
                name="syncData"
                label="Sync Data"
                {...validatorProps}
                border={false}
              >
                <Field name="syncData" component={Switcher} />
              </FormRow>
 */
}
