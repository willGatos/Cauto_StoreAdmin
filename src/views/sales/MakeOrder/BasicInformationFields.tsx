import AdaptableCard from '@/components/shared/AdaptableCard'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { FormItem } from '@/components/ui/Form'
import { Field, FormikErrors, FormikTouched, FieldProps } from 'formik'

type FormFieldsName = {
    messagerPricingList: string
}

type BasicInformationFields = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
}

const BasicInformationFields = (props: BasicInformationFields) => {
    const { touched, errors } = props

    return (
        <AdaptableCard divider className="mb-4">
            <h5>Información del Producto</h5>
            <p className="mb-6">Parte de información Básica</p>
            
            <FormItem
                label="Lista de Precios de Mensajería"
                labelClass="!justify-start"
                invalid={(errors.messagerPricingList && touched.messagerPricingList) as boolean}
                errorMessage={errors.messagerPricingList}
            >
                <Field name="messagerPricingList">
                    {({ field, form }: FieldProps) => (
                        <RichTextEditor
                            value={field.value}
                            onChange={(val) => form.setFieldValue(field.name, val)}
                        />
                    )}
                </Field>
            </FormItem>
        </AdaptableCard>
    )
}

export default BasicInformationFields
