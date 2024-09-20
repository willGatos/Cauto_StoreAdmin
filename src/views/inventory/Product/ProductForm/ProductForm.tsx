import { forwardRef, useContext, useEffect, useState } from "react";
import { FormContainer } from "@/components/ui/Form";
import Button from "@/components/ui/Button";
import hooks from "@/components/ui/hooks";
import StickyFooter from "@/components/shared/StickyFooter";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Form, Formik, FormikProps, FormikHelpers } from "formik";
import BasicInformationFields from "./BasicInformationFields";
import PricingFields from "./PricingFields";
import OrganizationFields from "./OrganizationFields";
import ProductImages from "./ProductImages";
import cloneDeep from "lodash/cloneDeep";
import { HiOutlineTrash } from "react-icons/hi";
import { AiOutlineSave } from "react-icons/ai";
import * as Yup from "yup";
import { apiProductBasic } from "@/services/ProductCreateService";
import Attribute from "./components/Attribute";
import useSupplyManagement from "./components/Attibutes/hook/useSupplyManagement";
import supabase from "@/services/Supabase/BaseClient";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import UploadWidget from "./components/Images";

export type ProductVariation = {
  name: string;
  price: number;
  stock: number;
  pictures?: string[];
  currency_id?: number;
};

export const createProduct = async (productData: ProductData, variations: ProductVariation[]) => {
  try {
    // Primero, insertamos el producto principal
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert([
        {
          ...productData,
        },
      ])
      .select("*")
      .single();

    if (productError) throw productError;

    console.log(variations)
    const variationAttributes = variations.flatMap((variation) =>
      variation.attributes.map((attribute) => ({
        variation_id: variation.id, // Asegúrate de que cada variación tenga un ID después de la inserción
        attribute_id: attribute.id,
      }))
    );

    // Luego, insertamos las variaciones
    if (variations && variations.length > 0) {
      const variationsWithProductId = variations.map(
        (variation) => {
          delete variation.attributes;
          const currencyId =  variation.currency.id
          delete variation.currency;

          return ({
          ...variation,
          product_id: product.id,
          currency_id: currencyId,
        })}
      );

      const { error: variationsError } = await supabase
        .from("product_variations")
        .insert(variationsWithProductId);


      
        if (variationsError) throw variationsError;

        // Insertar relaciones en product_variation_attributes


        const { error: attributesError } = await supabase
        .from("product_variation_attributes")
        .insert(variationAttributes);

      if (variationsError) throw variationsError;
    }

    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const upsertProduct = async (
  productData: ProductData,
  productId?: number,
  variations?: ProductVariation[]
) => {
  try {
    let product;

    // Separamos las variaciones del objeto principal
    const { ...mainProductData } = productData;

    if (productId) {
      // Actualización
      const { data, error: updateError } = await supabase
        .from("products")
        .update(mainProductData)
        .eq("id", productId)
        .single();

      if (updateError) throw updateError;
      product = data;
    } else {
      // Creación
      const { data, error: insertError } = await supabase
        .from("products")
        .insert([mainProductData])
        .single();

      if (insertError) throw insertError;
      product = data;
    }

    // Manejar variaciones
    if (variations && variations.length > 0) {
      // Eliminar variaciones existentes si es una actualización
      if (productId) {
        const { error: deleteError } = await supabase
          .from("product_variations")
          .delete()
          .eq("product_id", productId);

        if (deleteError) throw deleteError;
      }

      // Insertar nuevas variaciones
      const variationsWithProductId = variations.map((variation) => ({
        ...variation,
        product_id: product.id,
      }));

      const { error: variationsError } = await supabase
        .from("product_variations")
        .insert(variationsWithProductId);

      if (variationsError) throw variationsError;
    }

    return product;
  } catch (error) {
    console.error("Error upserting product:", error);
    throw error;
  }
};

export const getProductById = async (productId: number) => {
  try {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError) throw productError;

    const { data: variations, error: variationsError } = await supabase
      .from("product_variations")
      .select("*")
      .eq("product_id", productId);

    if (variationsError) throw variationsError;

    return { ...product, variations };
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export type ProductData = {
  name: string;
  description: string | null;
  category_id: number | null;
  shop_id: number | null;
  cost: number;
  discount: number;
  state: "available" | "unavailable";
  gender: string | null;
  commission: number;
  type: "manufactured" | "imported" | null;
  origin: string | null;
  commission_type: "percentage" | "fixed";
  reference_currency: number | null;
  owner_id: string | null;
  standard_price: number;
  status: 0 | 1 | 2 | 3;
  variations?: ProductVariation[];
  images: string[];
};

export function transformArrayToObjectArray(array: any) {
  return array.map((item: any) => ({
    ...item,
    label: item.name,
    value: item.id,
  }));
}
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type FormikRef = FormikProps<any>;

export type SetSubmitting = (isSubmitting: boolean) => void;

export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>;

type OnDelete = (callback: OnDeleteCallback) => void;

export type FormModel = Omit<ProductData, "tags"> & {
  tags: { label: string; value: string }[] | string[];
};
type ProductForm = {
  initialData?: ProductData;
  type: "edit" | "new";
  onDiscard?: () => void;
  onDelete?: OnDelete;
  onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void;
};

const productSchema = Yup.object().shape({
  name: Yup.string().required("El nombre es requerido"),
  description: Yup.string().nullable(),
  category_id: Yup.number().nullable(),
  shop_id: Yup.number().nullable(),
  cost: Yup.number().min(0, "El costo no puede ser negativo"),
  discount: Yup.number()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor a 100%"),
  state: Yup.string().oneOf(["available", "unavailable"]),
  gender: Yup.string().nullable(),
  commission: Yup.number().min(0, "La comisión no puede ser negativa"),
  type: Yup.string().oneOf(["simple", "variable"]),
  origin: Yup.string().oneOf(["manufactured", "imported"]),
  commission_type: Yup.string().oneOf(["percentage", "fixed"]),
  reference_currency: Yup.number().nullable(),
  owner_id: Yup.string().nullable(),
  standard_price: Yup.number().min(
    0,
    "El precio estándar no puede ser negativo"
  ),
  status: Yup.number().oneOf([0, 1, 2, 3]),
  variations: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("El nombre de la variación es requerido"),
      price: Yup.number()
        .min(0, "El precio no puede ser negativo")
        .required("El precio es requerido"),
      stock: Yup.number()
        .min(0, "El stock no puede ser negativo")
        .required("El stock es requerido"),
      pictures: Yup.array().of(Yup.string()),
      currency_id: Yup.number().nullable(),
    })
  ),
});

const DeleteProductButton = ({ onDelete }: { onDelete: OnDelete }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const onConfirmDialogOpen = () => {
    setDialogOpen(true);
  };

  const onConfirmDialogClose = () => {
    setDialogOpen(false);
  };

  const handleConfirm = () => {
    onDelete?.(setDialogOpen);
  };

  return (
    <>
      <Button
        className="text-red-600"
        variant="plain"
        size="sm"
        icon={<HiOutlineTrash />}
        type="button"
        onClick={onConfirmDialogOpen}
      >
        Delete
      </Button>
      <ConfirmDialog
        isOpen={dialogOpen}
        type="danger"
        title="Delete product"
        confirmButtonColor="red-600"
        onClose={onConfirmDialogClose}
        onRequestClose={onConfirmDialogClose}
        onCancel={onConfirmDialogClose}
        onConfirm={handleConfirm}
      >
        <p>
          Are you sure you want to delete this product? All record related to
          this product will be deleted as well. This action cannot be undone.
        </p>
      </ConfirmDialog>
    </>
  );
};

const ProductForm = forwardRef<FormikRef, ProductForm>((props, ref) => {
  const [categories, setCategories] = useState([{ label: "", value: "" }]);
  const [subcategories, setSubcategories] = useState([
    { label: "", value: "" },
  ]);
  const [variations, setVariations] = useState<ProductVariation[]>([])

  const [localImages, setLocalImages] = useState([]);
  const user = useSelector((state) => state.auth.user);

  const [initialValues, setInitialValues] = useState<ProductData>({
    name: "",
    description: null,
    category_id: null,
    shop_id: user.shopId,
    images: [],
    cost: 0,
    discount: 0,
    state: "available",
    gender: null,
    commission: 0,
    type: null,
    origin: null,
    commission_type: "percentage",
    reference_currency: null,
    owner_id: null,
    standard_price: 0,
    status: 0,
  });

  const { id } = useParams;

  useEffect(() => {
    if (id) {
      getProductById(id).then(setInitialValues).catch();
    }
  }, [id]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase.from("categories").select("*");

        if (error) throw error;
        const categories = transformArrayToObjectArray(
          data.filter((category) => category.parent_id == null)
        );
        const subcategories: Array<{ label: string; value: string }> =
          transformArrayToObjectArray(
            data.filter((category) => category.parent_id !== null)
          );
        subcategories.push({
          label: "Crear Nueva Subcategoría",
          value: "newSub",
        });
        setCategories(categories);
        setSubcategories(subcategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
    return () => {};
  }, []);

  const {
    type,
    initialData = initialValues,
    onFormSubmit,
    onDiscard,
    onDelete,
  } = props;

  const handleSubmit = async (
    values: ProductData,
    { setSubmitting }: FormikHelpers<ProductData>
  ) => {
    try {
      values.owner_id = user.id;
      values.images = localImages;
      console.log("GGGG", values);
      const createdProduct = await createProduct(values, variations);
      // Manejar el éxito (por ejemplo, mostrar un mensaje, redirigir, etc.)
    } catch (error) {
      // Manejar el error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Formik
        innerRef={ref}
        initialValues={{
          ...initialData,
        }}
        validationSchema={productSchema}
        onSubmit={handleSubmit}
      >
        {({ values, touched, errors, isSubmitting, setFieldValue }) => (
          <Form>
            <FormContainer>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div></div>
                <div className="lg:col-span-2">
                  <BasicInformationFields touched={touched} errors={errors} />

                  <PricingFields
                    touched={touched}
                    errors={errors}
                    values={values}
                  />

                  <OrganizationFields
                    touched={touched}
                    errors={errors}
                    values={values}
                    categories={categories}
                    subcategories={subcategories}
                    setFieldValue={setFieldValue}
                  />

                  <Attribute
                    touched={touched}
                    errors={errors}
                    values={values}
                    variations={variations}
                    setVariations={setVariations}
                    setFieldValue={setFieldValue}
                  />
                </div>
                <div className="lg:col-span-1">
                  <ProductImages
                    localImages={localImages}
                    setLocalImages={setLocalImages}
                  />
                </div>
              </div>

              <StickyFooter
                className="-mx-8 px-8 flex items-center justify-between py-4"
                stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <div>
                  {type === "edit" && (
                    <DeleteProductButton onDelete={onDelete as OnDelete} />
                  )}
                </div>
                <div className="md:flex items-center">
                  <Button
                    size="sm"
                    className="ltr:mr-3 rtl:ml-3"
                    type="button"
                    onClick={() => onDiscard?.()}
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    variant="solid"
                    loading={isSubmitting}
                    icon={<AiOutlineSave />}
                    type="submit"
                  >
                    {id ? "Actualizar Producto" : "Crear Producto"}
                  </Button>
                </div>
              </StickyFooter>
            </FormContainer>
          </Form>
        )}
      </Formik>
    </>
  );
});

ProductForm.displayName = "ProductForm";

export default ProductForm;
