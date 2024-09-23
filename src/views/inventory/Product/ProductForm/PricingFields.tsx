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
  standard_price: number;
  discount: number;
  commission: number;
  commission_type: "percentage" | "fixed";
  reference_currency: string;
  status: ProductStatus;
  origin: string;
};

type PricingFieldsProps = {
  touched: FormikTouched<ProductPricing>;
  errors: FormikErrors<ProductPricing>;
  values: ProductPricing;
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
  const { values, touched, errors} = props;
  const [prefix, setPrefix] = useState(
    values.commission_type === "percentage" ? "%" : "$"
  );

  const typeOfCommision = [
    { value: "percentage", label: "Porcentaje" },
    { value: "fixed", label: "Fijo" },
  ]

  const productTypes = [
    { value: "simple", label: "Simple" },
    { value: "variable", label: "Variable" },
  ]

  const [currencies, setCurrencies] = useState([
    { value: "CUP", label: "CUP" },
    { value: "USD", label: "USD" },
    { value: "EURO", label: "EURO" },
  ]);

  useEffect(() => {
    const currenciesFetch = async () => {
      const currencies = await supabaseService.getCurrencies().then((data) => {
        return transformArrayToObjectArray(data);
      });
      setCurrencies(currencies);
      return [];
    };
    currenciesFetch();
  }, []);

  const productOrigin = [
    { value: "manufactured", label: "Manufacturado" },
    { value: "imported", label: "Importado" },
  ];

  useEffect(() => {
    console.log(values.commission_type);
    setPrefix(values.commission_type === "percentage" ? "%" : "$");
  }, [values.commission_type]);
  
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
            <Field name={`type`}>
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  options={productTypes}
                  value={productTypes.find(
                    (type) => type.value === values.type
                  )}
                  onChange={(option) => {
                    console.log(field.name, field.value);
                    form.setFieldValue(field.name, option?.value);
                  }}
                />
              )}
            </Field>
          </FormItem>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="Tipo de Producto"
            invalid={(errors.origin && touched.origin) as boolean}
            errorMessage={errors.origin}
          >
            <Field name={`origin`}>
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  options={productOrigin}
                  value={productOrigin.find(
                    (origin) => origin.value === values.origin
                  )}
                  onChange={(option) => {
                    console.log(field.name, field.value);
                    form.setFieldValue(field.name, option?.value);
                  }}
                />
              )}
            </Field>
          </FormItem>
        </div>
        <div className="col-span-1">
          <FormItem
            label="Moneda de Referencia"
            invalid={
              (errors.reference_currency && touched.reference_currency) as boolean
            }
            errorMessage={errors.reference_currency}
          >
            <Field name={`reference_currency`}>
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  options={currencies}
                  value={currencies.find(
                    (currency) => currency.value === values.reference_currency
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
      {values.origin === "imported" && (
        <div className="col-span-1">
          <FormItem
            label="Costo del Producto"
            invalid={(errors.cost && touched.cost) as boolean}
            errorMessage={errors.cost}
          >
            <Field name={`cost`}>
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
            invalid={(errors.standard_price && touched.standard_price) as boolean}
            errorMessage={errors.standard_price}
          >
            <Field name={`standard_price`}>
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
            <Field name={`discount`}>
              {({ field, form }: FieldProps) => (
                <NumericFormatInput
                  form={form}
                  field={field}
                  placeholder="(Si desea que aparezca)"
                  customInput={PriceInput as ComponentType}
                  onValueChange={(e) => {
                    setPrefix(
                      values.commission_type === "percentage" ? "%" : "$"
                    );
                    form.setFieldValue(field.name, e.value);
                  }}
                />
              )}
            </Field>
          </FormItem>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="Tipo de Comisión"
            invalid={
              (errors.commission_type && touched.commission_type) as boolean
            }
            errorMessage={errors.commission_type}
          >
            <Field name={`commission_type`}>
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  options={typeOfCommision}
                  value={typeOfCommision.find(
                    (type) => type.value === values.commission_type
                  )}
                  onChange={(option) => {
                    form.setFieldValue(field.name, option.value);
                    setPrefix(
                      values.commission_type === "percentage" ? "%" : "$"
                    );
                    // Resetear el valor de la comisión cuando cambia el tipo
                  }}
                />
              )}
            </Field>
          </FormItem>
        </div>
        <div className="col-span-1">
          <FormItem
            label="Comisión"
            invalid={(errors.commission && touched.commission) as boolean}
            errorMessage={errors.commission}
          >
            <Field name={`commission`}>
              {({ field, form }: FieldProps) => (
                <NumericFormatInput
                  form={form}
                  field={field}
                  value={values.commission}
                  placeholder="Comisión"
                  customInput={Input as ComponentType}
                  onValueChange={(e) => form.setFieldValue(field.name, e.value)}
                  prefix={prefix}
                />
              )}
            </Field>
          </FormItem>
        </div>
      </div>
    </AdaptableCard>
  );
};

export default PricingFields;
