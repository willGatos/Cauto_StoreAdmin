import toast from '@/components/ui/toast'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'

const NotificationMessage = ({
    buttonText = 'suxces',
    notifcationText = 'TEXTO',
    action = () => {},
}) => {
    const openNotification = (
        type: 'success' | 'warning' | 'danger' | 'info'
    ) => {
        toast.push(
            <Notification
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                type={type}
            >
                {notifcationText}
            </Notification>
        )
        action()
    }

    return (
        <div>
            <Button
                variant="solid"
                color="indigo-600"
                className="mr-2 mb-2"
                onClick={() => openNotification('success')}
            >
                {buttonText}
            </Button>
        </div>
    )
}

export default NotificationMessage
