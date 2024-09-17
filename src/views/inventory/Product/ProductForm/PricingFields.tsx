import AdaptableCard from "@/components/shared/AdaptableCard";
import { FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import {
  Field,
  FormikErrors,
  FormikTouched,
  FieldProps,
  FieldInputProps,
} from "formik";
import { useEffect, useState, type ComponentType } from "react";
import type { InputProps } from "@/components/ui/Input";
import { Select } from "@/components/ui";
import supabase from "@/services/Supabase/BaseClient";
import { supabaseService } from "@/services/Supabase/AttributeService";
import { transformArrayToObjectArray } from "./ProductForm";

// Nuevos tipos
type ProductType = "manufactured" | "imported";
type ProductStatus = "new" | "out_of_stock" | "in_stock" | "discontinued";

type ProductPricing = {
  type: ProductType;
  cost?: number;
  standardPrice: number;
  discount: number;
  commission: number;
  commissionType: "percentage" | "fixed";
  referenceCurrency: string;
  status: ProductStatus;
};

type PricingFieldsProps = {
  touched: FormikTouched<ProductPricing>;
  errors: FormikErrors<ProductPricing>;
  values: ProductPricing;
  fieldName: string;
};

const PriceInput = (props: InputProps) => {
  return <Input {...props} value={props.field.value} prefix="$" />;
};

const NumericFormatInput = ({
  onValueChange,
  ...rest
}: Omit<NumericFormatProps, "form"> & {
  form: any;
  field: FieldInputProps<unknown>;
}) => {
  return (
    <NumericFormat
      customInput={Input as ComponentType}
      type="text"
      autoComplete="off"
      onValueChange={onValueChange}
      {...rest}
    />
  );
};

const PricingFields = (props: PricingFieldsProps) => {
  const { values, touched, errors, fieldName = "" } = props;

  const [currencies, setCurrencies] = useState([
    { value: "CUP", label: "CUP" },
    { value: "USD", label: "USD" },
    { value: "EURO", label: "EURO" },
  ]);

  useEffect(()=>{
    const currenciesFetch = async () => {
        const currencies = await supabaseService.getCurrencies().then((data) => {
            console.log(data)
         return transformArrayToObjectArray(data);
        });
        console.log('CURRENCY',currencies);
        return [];
      };
      currenciesFetch()
  },[])





  const productTypes = [
    { value: "manufactured", label: "Manufacturado" },
    { value: "imported", label: "Importado" },
  ];

  const statusOptions = [
    { value: "new", label: "Nuevo" },
    { value: "out_of_stock", label: "Agotado" },
    { value: "in_stock", label: "En existencia" },
    { value: "discontinued", label: "Descontinuado" },
  ];

  const getCommissionPrefix = (commissionType: string) => {
    return commissionType === "percentage" ? "%" : "$";
  };

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Sistema de Precios</h5>
      <p className="mb-6">Configuración de Precios</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="Tipo de Producto"
            invalid={(errors.type && touched.type) as boolean}
            errorMessage={errors.type}
          >
            <Field name={`${fieldName}.type`}>
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  options={productTypes}
                  value={productTypes.find(
                    (type) => type.value === values.type
                  )}
                  onChange={(option) =>
                    form.setFieldValue(field.name, option?.value)
                  }
                />
              )}
            </Field>
          </FormItem>
        </div>
        <div className="col-span-1">
          <FormItem
            label="Moneda de Referencia"
            invalid={
              (errors.referenceCurrency && touched.referenceCurrency) as boolean
            }
            errorMessage={errors.referenceCurrency}
          >
            <Field name={`${fieldName}.referenceCurrency`}>
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  options={currencies}
                  value={currencies.find(
                    (currency) => currency.value === values.referenceCurrency
                  )}
                  onChange={(option) =>
                    form.setFieldValue(field.name, option?.value)
                  }
                />
              )}
            </Field>
          </FormItem>
        </div>
      </div>
      {values.type === "imported" && (
        <div className="col-span-1">
          <FormItem
            label="Costo del Producto"
            invalid={(errors.cost && touched.cost) as boolean}
            errorMessage={errors.cost}
          >
            <Field name={`${fieldName}.cost`}>
              {({ field, form }: FieldProps) => (
                <NumericFormatInput
                  form={form}
                  field={field}
                  placeholder="Costo del producto importado"
                  customInput={PriceInput as ComponentType}
                  onValueChange={(e) => form.setFieldValue(field.name, e.value)}
                />
              )}
            </Field>
          </FormItem>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="Precio Estándar"
            invalid={(errors.standardPrice && touched.standardPrice) as boolean}
            errorMessage={errors.standardPrice}
          >
            <Field name={`${fieldName}.standardPrice`}>
              {({ field, form }: FieldProps) => (
                <NumericFormatInput
                  form={form}
                  field={field}
                  placeholder="Precio estándar"
                  customInput={PriceInput as ComponentType}
                  onValueChange={(e) => form.setFieldValue(field.name, e.value)}
                />
              )}
            </Field>
          </FormItem>
        </div>
        <div className="col-span-1">
          <FormItem
            label="Descuento"
            invalid={(errors.discount && touched.discount) as boolean}
            errorMessage={errors.discount}
          >
            <Field name={`${fieldName}.discount`}>
              {({ field, form }: FieldProps) => (
                <NumericFormatInput
                  form={form}
                  field={field}
                  placeholder="(Si desea que aparezca)"
                  customInput={PriceInput as ComponentType}
                  onValueChange={(e) => form.setFieldValue(field.name, e.value)}
                />
              )}
            </Field>
          </FormItem>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="Comisión"
            invalid={(errors.commission && touched.commission) as boolean}
            errorMessage={errors.commission}
          >
            <Field name={`${fieldName}.commission`}>
              {({ field, form }: FieldProps) => (
                <NumericFormatInput
                  form={form}
                  field={field}
                  placeholder="Comisión"
                  customInput={Input as ComponentType}
                  onValueChange={(e) => form.setFieldValue(field.name, e.value)}
                  prefix={getCommissionPrefix(values.commissionType)}
                />
              )}
            </Field>
          </FormItem>
        </div>
        <div className="col-span-1">
          <FormItem
            label="Tipo de Comisión"
            invalid={
              (errors.commissionType && touched.commissionType) as boolean
            }
            errorMessage={errors.commissionType}
          >
            <Field name={`${fieldName}.commissionType`}>
              {({ field, form }: FieldProps) => (
                <Select
                  options={[
                    { value: "percentage", label: "Porcentaje" },
                    { value: "fixed", label: "Fijo" },
                  ]}
                  onChange={(option) => {
                    form.setFieldValue(field.name, option?.value);
                    console.log(option?.value, option?.label);
                    // Resetear el valor de la comisión cuando cambia el tipo
                    form.setFieldValue(`${fieldName}.commission`, "");
                  }}
                />
              )}
            </Field>
          </FormItem>
        </div>
      </div>
      <div className="col-span-1">
        <FormItem
          label="Estado del Producto"
          invalid={(errors.status && touched.status) as boolean}
          errorMessage={errors.status}
        >
          <Field name={`${fieldName}.status`}>
            {({ field, form }: FieldProps) => (
              <Select
                field={field}
                form={form}
                options={statusOptions}
                value={statusOptions.find(
                  (status) => status.value === values.status
                )}
                onChange={(option) =>
                  form.setFieldValue(field.name, option?.value)
                }
              />
            )}
          </Field>
        </FormItem>
      </div>
    </AdaptableCard>
  );
};

export default PricingFields;
