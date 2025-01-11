import Button from "@/components/ui/Button";
import { HiDownload, HiPlusCircle } from "react-icons/hi";
import ProductTableSearch from "./ProductTableSearch";
import ProductFilter from "./ProductFilter";
import { Link } from "react-router-dom";

const ProductTableTools = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center">
      {/* <ProductTableSearch />
      <ProductFilter /> */}
      <Link
        className="block lg:inline-block md:mb-0 mb-4"
        to="/app/sales/product-new"
      >
        <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
          Añadir Producto
        </Button>
      </Link>
    </div>
  );
};

export default ProductTableTools;
