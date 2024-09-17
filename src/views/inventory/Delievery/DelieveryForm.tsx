import { forwardRef, useEffect, useState } from 'react'
import { FormContainer } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import hooks from '@/components/ui/hooks'
import StickyFooter from '@/components/shared/StickyFooter'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Form, Formik, FormikProps } from 'formik'
import BasicInformationFields from './BasicInformationFields'
import cloneDeep from 'lodash/cloneDeep'
import { HiOutlineTrash } from 'react-icons/hi'
import { AiOutlineSave } from 'react-icons/ai'
import * as Yup from 'yup'/* 
import { apiDelieveryBasic } from '@/services/DelieveryCreateService' */

type FormikRef = FormikProps<any>
export type DelieveryData = {
    messagerPricingList: string;
  };


export type SetSubmitting = (isSubmitting: boolean) => void

export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>

type OnDelete = (callback: OnDeleteCallback) => void

  export type FormModel = Omit<DelieveryData, 'tags'> & {
    tags: { label: string; value: string }[] | string[]
}
  type DelieveryForm = {
    initialData?: DelieveryData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void
}

const DelieverySchema = Yup.object().shape({
    messagerPricingList: Yup.string().required('La Lista de Precios es requerida'),
});

const DelieveryForm = forwardRef<FormikRef, DelieveryForm>((props, ref) => {
    const {
        type,
        initialData = {
            messagerPricingList: 'This is an example Delievery for testing purposes.',
        },
        onFormSubmit,
    } = props

    return (
        <>
            <Formik
                innerRef={ref}
                initialValues={{
                    ...initialData
                }}
                validationSchema={DelieverySchema}
                onSubmit={async (values: FormModel, { setSubmitting }) => {
                    onFormSubmit?.(values, setSubmitting)                     
                }}
            >
                {({ values, touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
                                    <BasicInformationFields
                                        touched={touched}
                                        errors={errors}
                                    />
                                </div>
                            </div>
                            <StickyFooter
                                className="-mx-8 px-8 flex items-center justify-between py-4"
                                stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            >
                                <div></div>
                                <div className="md:flex items-center">
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        loading={isSubmitting}
                                        icon={<AiOutlineSave />}
                                        type="submit"
                                    >
                                        Guardar
                                    </Button>
                                </div>
                            </StickyFooter>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </>
    )
})

DelieveryForm.displayName = 'DelieveryForm'

export default DelieveryForm;