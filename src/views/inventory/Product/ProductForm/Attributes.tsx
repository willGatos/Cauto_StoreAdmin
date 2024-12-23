import AdaptableCard from "@/components/shared/AdaptableCard";
import { Select } from "@/components/ui";
import { FormItem } from "@/components/ui/Form";
import type { InputProps } from "@/components/ui/Input";
import Input from "@/components/ui/Input";
import { supabaseService } from "@/services/Supabase/AttributeService";
import {
  Field,
  FieldInputProps,
  FieldProps,
  FormikErrors,
  FormikTouched,
} from "formik";
import { useEffect, useState, type ComponentType } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Supply } from "../../Supply/List/Data/types";
import { ProductData, transformArrayToObjectArray } from "./ProductForm";
import { Attribute, Product } from "@/@types/products";

// Nuevos tipos
type ProductType = "manufactured" | "imported";
type ProductStatus = "new" | "out_of_stock" | "in_stock" | "discontinued";

type SuppliesProps = {
  touched: FormikTouched<Attribute>;
  errors: FormikErrors<Attribute>;
  values: ProductData;
  attributes: Attribute[];
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

const Attributes = (props: SuppliesProps) => {
  const { values, touched, errors, attributes } = props;

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Sistema de Precios</h5>
      <p className="mb-6">Configuración de Precios</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="Insumos"
            invalid={(errors.attributes && touched.attributes) as boolean}
            errorMessage={errors.attributes}
          >
            <Field name={`attributes`}>
              {({ field, form }: FieldProps) => (
                <Select
                  isMulti
                  name="attributes"
                  placeholder="Seleccione insumos"
                  defaultValue={values.attributes
                    .map((supply) => attributes.find((s) => s.value === supply))
                    .filter(Boolean)}
                  options={attributes}
                  value={values.attributes
                    .map((supply) => attributes.find((s) => s.value === supply))
                    .filter(Boolean)}
                  onChange={(option) => {
                    console.log(
                      field.name,
                      option.map((op) => op.id)
                    );
                    form.setFieldValue(
                      field.name,
                      option.map((op) => op.id)
                    );
                  }}
                />
              )}
            </Field>
          </FormItem>
        </div>
      </div>
    </AdaptableCard>
  );
};

export default Attributes;
