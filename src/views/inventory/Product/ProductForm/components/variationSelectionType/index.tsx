import { useState } from "react";
import Radio from "@/components/ui/Radio";

const VariationSelectionType = ({ value, setValue }) => {

  const onChange = (val: string) => {
    setValue(val);
  };

  return (
    <div>
      <Radio.Group value={value} onChange={onChange}>
        <Radio value={"generate"}>Generador de Variaciones.</Radio>
        <Radio value={"select"}>Seleccionar En La Categoría.</Radio>
      </Radio.Group>
    </div>
  );
};

export default VariationSelectionType;
