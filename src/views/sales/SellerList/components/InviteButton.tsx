import { useAppSelector } from '@/store'
import useAuth from '@/utils/hooks/useAuth'
import NotificationMessage from '@/views/crm/CrmDashboard/components/NotificationMessage'
function InviteButton() {
    const user = useAppSelector((state) => state.auth.user)
    const { createInvitation } = useAuth()

    console.log(user)

    return (
        <NotificationMessage
            buttonText="Copiar Link Para Vendedores"
            notifcationText="Link de Inscripción Copiado en el Portapales"
            action={() => {
                createInvitation(user.shopId, user.id).then((e) => {
                    navigator.clipboard.writeText(
                        'http://localhost:5173/s/sign-up/' + e?.invitationId?.id
                    )
                    console.log(e?.invitationId?.id)
                })
            }}
        />
    )
}

export default InviteButton
