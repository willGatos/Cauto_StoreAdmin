import Notification from "@/components/ui/Notification";
import toast from "@/components/ui/toast";
import { injectReducer } from "@/store";
import { useNavigate } from "react-router-dom";
import reducer, {
    deleteProduct,
    updateProduct,
    useAppSelector
} from "./store";

import ProductForm, {
    FormModel,
    OnDeleteCallback,
    SetSubmitting,
} from "@/views/inventory/Product/ProductForm";

injectReducer("salesProductEdit", reducer);

const ProductEdit = () => {
  const navigate = useNavigate();

  const productData = useAppSelector(
    (state) => state.salesProductEdit.data.productData
  );
  const loading = useAppSelector(
    (state) => state.salesProductEdit.data.loading
  );

  const handleFormSubmit = async (
    values: FormModel,
    setSubmitting: SetSubmitting
  ) => {
    setSubmitting(true);
    const success = await updateProduct(values, { id: productData._id });
    setSubmitting(false);
    console.log("SSSS", success);
    if (success) {
      popNotification("updated");
    }
  };

  const handleDiscard = () => {
    navigate("/app/sales/product-list");
  };

  const handleDelete = async (setDialogOpen: OnDeleteCallback) => {
    setDialogOpen(false);
    const success = await deleteProduct({ id: productData._id });
    if (success) {
      popNotification("deleted");
    }
  };

  const popNotification = (keyword: string) => {
    toast.push(
      <Notification
        title={`Successfuly ${keyword}`}
        type="success"
        duration={2500}
      >
        Producto Exitosamente {keyword}
      </Notification>,
      {
        placement: "top-center",
      }
    );
    navigate("/app/sales/product-list");
  };


  return (
    <ProductForm
      type="edit"
      onFormSubmit={handleFormSubmit}
      onDiscard={handleDiscard}
      onDelete={handleDelete}
    />
  );
};

export default ProductEdit;
