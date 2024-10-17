import { Product } from "@/@types/products";
import supabase from "@/services/Supabase/BaseClient";
import { useAppSelector } from "@/store";
import React from "react";
import MainTable from "./MainTable"; // Asegúrate de ajustar la ruta correcta
import SubTable from "./SubTable";

export const getProducts = async (id) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        "*,category: category_id(name),variations:product_variations(*,  currency: currency_id(*),attribute_values(value, types: attributes(name)))"
      )
      .eq("shop_id", id);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error;
  }
};

const MainComponent = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const { shopId } = useAppSelector((state) => state.auth.user);
  React.useEffect(() => {
    getProducts(shopId).then(setProducts);
  }, []);

  const renderSubComponent = ({ row }) => {
    const variations = row.original.variations || [];
    return <SubTable data={variations} />;
  };

  return (
    <MainTable
      data={products}
      renderRowSubComponent={renderSubComponent}
      getRowCanExpand={(row) =>
        row.original.variations && row.original.variations.length > 0
      }
    />
  );
};

export default MainComponent;
