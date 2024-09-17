

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import type { MouseEvent } from 'react'

const CreateLink = ({setIsOpen, dialogIsOpen=false, subscriptionLink={_id:"", expDate: ""}}) => {

    const openDialog = () => {
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }

    const onDialogOk = () => {
        setIsOpen(false)
    }

    return (
        <div>
            <Button variant="solid" onClick={() => openDialog()}>
                Open Dialog
            </Button>
            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">Dialog Title</h5>
                <p>
                {subscriptionLink._id}
                </p>
                <p>
                {Date.parse(subscriptionLink.expDate)}
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={onDialogClose}
                    >
                        Cancel
                    </Button>
                    <Button variant="solid" onClick={onDialogOk}>
                        Okay
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default CreateLink
