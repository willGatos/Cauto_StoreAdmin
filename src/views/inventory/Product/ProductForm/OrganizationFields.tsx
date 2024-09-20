import AdaptableCard from "@/components/shared/AdaptableCard";
import { FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import CreatableSelect from "react-select/creatable";
import { Field, FormikErrors, FormikTouched, FieldProps } from "formik";
import { Switcher } from "@/components/ui";

type Options = {
  label: string;
  value: string;
}[];

type FormFieldsName = {
  category: string;
  brand: string;
  gender: string;
  status: string;
  isVisible: boolean;
};

type OrganizationFieldsProps = {
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
  values: {
    category_id: string;
    tags: Options;
    [key: string]: unknown;
  };
  categories: Options;
  subcategories: Options;
  gender: Options;
};

const forGender = [
  { label: "Masculino", value: "masculino" },
  { label: "Femenino", value: "femenino" },
  { label: "Unisex", value: "unisex" },
];

const status =  [
  { value: 0, label: "Nuevo" },
  { value: 1, label: "Agotado" },
  { value: 2, label: "En existencia" },
  { value: 3, label: "Descontinuado" },
];

const OrganizationFields = (props: OrganizationFieldsProps) => {
  const {
    values = {
      category_id_id: "",
      brand: "",
      gender: "",
    },
    touched,
    errors,
    categories,
    setFieldValue,
  } = props;

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Organización</h5>
      <p className="mb-6">Configurar como se organiza el producto</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="Categoría"
            invalid={(errors.category_id && touched.category_id) as boolean}
            errorMessage={errors.category_id}
          >
            <Field name="category_id">
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  options={categories}
                  value={categories.filter(
                    (category_id) => category_id.value === values.category_id
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
        {/* <div className="col-span-1">
          <FormItem
            label="Subcategoría"
            invalid={
              (errors.subcategory && touched.subcategory) as boolean
            }
            errorMessage={errors.subcategory}
          >
            <Field name="subcategory">
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  options={subcategories}
                  value={subcategories.filter(
                    (subcategory) => subcategory.value === values.subcategory
                  )}
                  onChange={(option) =>
                    form.setFieldValue(field.name, option?.value)
                  }
                />
              )}
            </Field>
          </FormItem>
        </div> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="Género"
            invalid={(errors.gender && touched.gender) as boolean}
            errorMessage={errors.gender}
          >
            <Field name="gender">
              {({ field, form }: FieldProps) => (
                <Select
                  field={field}
                  form={form}
                  options={forGender}
                  value={forGender.filter(
                    (gender) => gender.value === values.gender
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
            label="Marca"
            invalid={(errors.brand && touched.brand) as boolean}
            errorMessage={errors.brand}
          >
            <Field
              type="text"
              autoComplete="off"
              name="brand"
              placeholder="Marca"
              component={Input}
            />
          </FormItem>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="¿Es Visible para todos?"
            className="flex justify-center items-center"
          >
            <div className="flex gap-5">
              <p>No</p>
              <Switcher
                name={`isVisible`}
                //onChange={()=> setFieldValue(`isVisible`, isVisible)}
              />
              <p>Si</p>
            </div>
          </FormItem>
        </div>
      </div>
    </AdaptableCard>
  );
};

export default OrganizationFields;
