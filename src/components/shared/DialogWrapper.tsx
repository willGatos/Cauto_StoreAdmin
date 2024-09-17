import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'

export default function DialogWrapper({
    ButtonText= "",
    setIsOpen,
    isOpen, 
    children,
  }) {

    const openDialog = () => setIsOpen(true)

    const onDialogClose = () => setIsOpen(false)

    
  return (
        <>  
            <Dialog
                isOpen={isOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
               {children}
            </Dialog>
            <Button variant="solid" onClick={() => openDialog()}>
                {ButtonText}
            </Button>
        </>
  )
}