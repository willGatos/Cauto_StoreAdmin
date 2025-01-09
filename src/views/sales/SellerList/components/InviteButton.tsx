import { useAppSelector } from "@/store";
import useAuth from "@/utils/hooks/useAuth";
import Button from "@/components/ui/Button";
function InviteButton() {
  const user = useAppSelector((state) => state.auth.user);
  const { createInvitation } = useAuth();

  console.log(user);

  return (
    <Button
     // notifcationText="Link de Inscripción Copiado en el Portapales"
      onClick={() => {
        createInvitation(user.shopId, user.id).then((e) => {
          navigator.clipboard.writeText(
            "http://www.dexito.shop/s/sign-up/" + e?.invitationId?.id
          );
          console.log(e?.invitationId?.id);
        });
      }}
    >
      Copiar Link Para Vendedores
    </Button>
  );
}

export default InviteButton;
