import FormDialog from "../Form";
import { apiCreateCategory } from "@/services/inventory/CategoryService";

export default function CreateCategoryElement (){
    return (
        <FormDialog
            apiService={apiCreateCategory}
            defaultValue=""
        />
    )
}
