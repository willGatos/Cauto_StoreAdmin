import FormDialog from "./index";
import { apiCreateAttribute } from "@/services/inventory/AttributeService";

export default function CreateAtributeElement (){
    return (
        <FormDialog
            apiService={apiCreateAttribute}
            defaultValue={{name: '', value: []}}
            ButtonText='Crear Variacion'
        />
    )
}
