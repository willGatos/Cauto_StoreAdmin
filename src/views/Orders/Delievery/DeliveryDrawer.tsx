
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { FormItem, Input } from '@/components/ui'
import { Field, Formik } from 'formik'
import MakeOrder from '.'
import { isEmpty } from 'lodash'

const OrderDrawer = ({selectedProductIds}) => {
    const [isOpen, setIsOpen] = useState(false)

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = () => {
        setIsOpen(false)
    }

    const Footer = (
        <div className="text-right w-full">
            <Button size="sm" className="mr-2" onClick={() => onDrawerClose()}>
                Cancel
            </Button>
            <Button size="sm" variant="solid" onClick={() => onDrawerClose()}>
                Confirm
            </Button>
        </div>
    )

    return (
        <div>
            <Button 
            className="block lg:inline-block md:mx-2 md:mb-0 mb-4"
            block variant="solid" size="sm" disabled={isEmpty(selectedProductIds)}
            onClick={() => openDrawer()}>
                Open Drawer
            </Button>
            <Drawer
                title="Drawer Title"
                isOpen={isOpen}
                footer={Footer}
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
               <MakeOrder/>
            </Drawer>
        </div>
    )
}

export default OrderDrawer

