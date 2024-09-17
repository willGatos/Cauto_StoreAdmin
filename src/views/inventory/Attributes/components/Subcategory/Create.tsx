import FormDialog from "./index";
import { apiCreateSubcategory } from "@/services/inventory/SubcategoryService";

export default function CreateSubcategoryElement (){
    return (
        <FormDialog
            apiService={apiCreateSubcategory}
            defaultValue={{name: ''}}
        />
    )
}
