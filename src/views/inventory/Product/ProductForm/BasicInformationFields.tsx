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
  values;
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
};

const BasicInformationFields = (props: BasicInformationFields) => {
  const { values,touched, errors } = props;

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
      <Field
        name="socialMediaLink"
        label="Enlace de Redes Sociales"
        placeholder="https://ejemplo.com"
        component={Input} // Asumiendo que tienes un componente Input
        type="url"
      />

      {/* Ejemplo de previsualización */}
      {values.socialMediaLink && (
        <div className="mt-2">
          <a
            href={values.socialMediaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Ver ejemplo ↗
          </a>
        </div>
      )}
    </AdaptableCard>
  );
};

export default BasicInformationFields;
