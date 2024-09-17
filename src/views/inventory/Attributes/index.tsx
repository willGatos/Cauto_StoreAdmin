import AttributesForm from "./Form";
import AttributesTables from "./Tables";

import CreateCategoryElement from "./components/Category/Create";
import GetElements from "./components/GetElements";
import CreateSubcategoryElement from "./components/Subcategory/Create";
import CreateAtributeElement from "./components/Variation/Create";

export default function Attributes(){

    const handleAttributeChange = (id, newValue) => {
        setProductAttributes((prevAttributes) =>
          prevAttributes.map((attr) =>
            attr.id === id ? { ...attr, value: newValue } : attr
          )
        );
    };

    
    return(
        <div>
            {/* <div>
                <CreateCategoryElement />
                <CreateSubcategoryElement/>
                <CreateAtributeElement/>
            </div>
                <AttributesForm/> */}
                <br/>
                <GetElements/>
                <AttributesTables/>
        </div>
        );
}