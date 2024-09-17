import AdaptableCard from "@/components/shared/AdaptableCard";
import RichTextEditor from "@/components/shared/RichTextEditor";
import Input from "@/components/ui/Input";
import { FormItem } from "@/components/ui/Form";
import { Field, FormikErrors, FormikTouched, FieldProps } from "formik";

type FormFieldsName = {
  name: string;
  productCode: string;
  description: string;
};

type BasicInformationFields = {
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
};

const BasicInformationFields = (props: BasicInformationFields) => {
  const { touched, errors } = props;

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Información del Producto</h5>
      <p className="mb-6">Parte de información Básica</p>
      <FormItem
        label="Nombre del Producto"
        invalid={(errors.name && touched.name) as boolean}
        errorMessage={errors.name}
      >
        <Field
          type="text"
          autoComplete="off"
          name="name"
          placeholder="Nombre"
          component={Input}
        />
      </FormItem>

      <FormItem
        label="Description"
        labelClass="!justify-start"
        invalid={(errors.description && touched.description) as boolean}
        errorMessage={errors.description}
      >
        <Field name="description">
          {({ field, form }: FieldProps) => (
            <RichTextEditor
              value={field.value}
              onChange={(val) => form.setFieldValue(field.name, val)}
            />
          )}
        </Field>
      </FormItem>

      <FormItem
        label="Cantidad del Producto Disponible"
        invalid={(errors.stock && touched.stock) as boolean}
        errorMessage={errors.stock}
      >
        <Field
          type="text"
          autoComplete="off"
          name="stock"
          placeholder="Cantidad Disponible"
          component={Input}
        />
      </FormItem>
    </AdaptableCard>
  );
};

export default BasicInformationFields;
