import AdaptableCard from "@/components/shared/AdaptableCard";
import { FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import CreatableSelect from "react-select/creatable";
import { Field, FormikErrors, FormikTouched, FieldProps } from "formik";
import { Switcher } from "@/components/ui";
import { CategorySelect } from "./components/Categories/category-select";
import { Category, mockCategories } from "./components/Categories/mock";

type Options = {
  label: string;
  value: string;
}[];
type ProductType = "manufactured" | "imported";

type FormFieldsName = {
  type: ProductType;
  origin: string;
  brand: string;
  gender: string;
  status: string;
  isVisible: boolean;
};

type OrganizationFieldsProps = {
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
  values: {
    tags: Options;
    [key: string]: unknown;
  };
  categories;
  gender: Options;
  selectedIds;
  setSelectedIds;
};

const forGender = [
  { label: "Masculino", value: "masculino" },
  { label: "Femenino", value: "femenino" },
  { label: "Unisex", value: "unisex" },
];

const status = [
  { value: 0, label: "Agotado" },
  { value: 1, label: "En existencia" },
];

const productTypes = [
  { value: "simple", label: "Simple" },
  { value: "variable", label: "Variable" },
];
const productOrigin = [
  { value: "manufactured", label: "Manufacturado" },
  { value: "imported", label: "Importado" },
];

const OrganizationFields = (props: OrganizationFieldsProps) => {
  const {
    values = {
      brand: "",
      gender: "",
    },
    touched,
    errors,
    categories,
    selectedIds,
    setSelectedIds,
  } = props;

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Organización</h5>
      <p className="mb-6">Configurar como se organiza el producto</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="Variedad Según Modelo"
            invalid={(errors.type && touched.type) as boolean}
            errorMessage={errors.type}
          >
            <Field name={`type`}>
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  placeholder={
                    "Si tiene Color - Forma del mismo modelo o si es Simple"
                  }
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
        <div className="col-span-1">
          <FormItem
            label="Origen del Producto"
            invalid={(errors.origin && touched.origin) as boolean}
            errorMessage={errors.origin}
          >
            <Field name={`origin`}>
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  options={productOrigin}
                  placeholder="Importado o con Manufactura"
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="Estado en Inventario"
            invalid={(errors.status && touched.status) as boolean}
            errorMessage={errors.status}
          >
            <Field name="status">
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  options={status}
                  value={status.filter(
                    (status) => status.value === values.status
                  )}
                  onChange={(option) => {
                    form.setFieldValue(field.name, option?.value);
                  }}
                />
              )}
            </Field>
          </FormItem>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-4">Selector de Categorías</h1>
        <CategorySelect
          categories={categories}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onSelectionChange={(selectedCategories: Category[]) => {
            console.log("Categorías seleccionadas:", selectedCategories);
          }}
        />
      </div>
    </AdaptableCard>
  );
};

export default OrganizationFields;
