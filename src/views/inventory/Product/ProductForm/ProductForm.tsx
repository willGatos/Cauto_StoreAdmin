import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StickyFooter from "@/components/shared/StickyFooter";
import Button from "@/components/ui/Button";
import { FormContainer } from "@/components/ui/Form";
import { supabaseService } from "@/services/Supabase/AttributeService";
import supabase from "@/services/Supabase/BaseClient";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import { forwardRef, useEffect, useRef, useState } from "react";
import { AiOutlineSave } from "react-icons/ai";
import { HiOutlineTrash } from "react-icons/hi";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { Supply } from "../../Supply/List/Data/types";
import BasicInformationFields from "./BasicInformationFields";
import Attribute from "./components/Attribute";
import OrganizationFields from "./OrganizationFields";
import PricingFields from "./PricingFields";
import ProductImages from "./ProductImages";
import Supplies from "./Supplies";

export type ProductVariation = {
  name: string;
  price: number;
  stock: number;
  pictures?: string[];
  currency_id?: number;
  supply_variations?: number[];
};

export const createProduct = async (
  productData: ProductData,
  variations: ProductVariation[]
) => {
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

    // Luego, insertamos las variaciones
    if (variations && variations.length > 0) {
      const variationsWithProductId = variations.map((variation) => ({
        name: variation.name,
        price: variation.price,
        stock: variation.stock,
        pictures: variation.pictures,
        product_id: product.id,
        currency_id: variation.currency_id,
      }));

      const { data: variationsIds, error: variationsError } = await supabase
        .from("product_variations")
        .insert(variationsWithProductId)
        .select("id, name");

      const variationAttributes = variations
        .flatMap((variation) => {
          return variation.attributes
            .map((attribute) => {
              return variationsIds.map((varWithIds) => ({
                product_variation_id: varWithIds.id,
                attribute_value_id: attribute.id,
              }));
            })
            .flat(); // Add .flat() here to flatten the nested array
        })
        .flat(); // And add another .flat() here to ensure complete flattening

      if (variationsError) throw variationsError;

      // Insertar relaciones en product_variation_attributes

      const { error: attributesError } = await supabase
        .from("product_variation_attributes")
        .insert(variationAttributes);

        const combinedPermutations = variations.flatMap((variation) => {
          return variationsIds.map((varId) => {
            return variation.supply_variations.map((supplyVariation) => ({
              product_variation_id: varId,
              supply_variation_id: supplyVariation,
              // Agrega cualquier otro campo que necesites de la variación o supply_variation
            }));
          });
        }).flat();
        console.log(combinedPermutations)
        const { error: combinedPermutations } = await supabase
        .from("supply_variation_product_variations")
        .insert(variationAttributes);
        //supply_variation_product_variations
      if (variationsError) throw variationsError;
    }

    return {};
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

/* export const upsertProduct = async (
  productData: ProductData,
  productId?: number,
  variations?: ProductVariation[]
) => {
  try {
    let product;
    delete productData.id
    // Actualización del producto principal
    const { data: updateProduct, error: updateError } = await supabase
      .from("products")
      .update(productData)
      .eq("id", productId)
      .single();

    if (updateError) throw updateError;
    product = updateProduct;

    // Manejar variaciones
    if (variations && variations.length > 0) {
      // Eliminar variaciones existentes si es una actualización
      const { error: deleteError } = await supabase
        .from("product_variations")
        .delete()
        .eq("product_id", productId);

      if (deleteError) throw deleteError;

      // Insertar nuevas variaciones
      const variationsWithProductId = variations.map((variation) => ({
        name: variation.name,
        price: variation.price,
        stock: variation.stock,
        pictures: variation.pictures,
        product_id: product.id,
        currency_id: variation.currency.id,
      }));

      const { error: variationsError } = await supabase
        .from("product_variations")
        .insert(variationsWithProductId);

      if (variationsError) throw variationsError;

      // Actualizar relaciones en product_variation_attributes
      const variationAttributes = variations
        .flatMap((variation) => {
          return variation.attributes
            .map((attribute) => {
              return variationsWithProductId.map((varWithIds) => ({
                product_variation_id: varWithIds.id,
                attribute_value_id: attribute.id,
              }));
            })
            .flat();
        })
        .flat();

      const { error: attributesError } = await supabase
        .from("product_variation_attributes")
        .upsert(variationAttributes, { onConflict: "product_variation_id" });

      if (attributesError) throw attributesError;
    }

    return product;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};
 */
export const upsertProduct = async (
  productData: ProductData,
  productId?: number,
  variations?: ProductVariation[]
) => {
  try {
    let product;
    if (productId) {
      const productVar = await supabase
        .from("product_variations")
        .select("id")
        .eq("product_id", productId);
      // Actualización del producto existente
      // Eliminar variaciones y atributos existentes
      await supabase
        .from("product_variation_attributes")
        .delete()
        .in(
          "product_variation_id",
          productVar.data.map((prod) => prod.id)
        );

      await supabase
        .from("product_variations")
        .delete()
        .eq("product_id", productId);

      delete productData.id;
      // Actualizar el producto principal
      const { data: updateProduct, error: updateError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", productId)
        .single();

      if (updateError) throw updateError;
      product = updateProduct;
      console.log(variations);

      console.log(variations.map((e) => e.currency));
      // Insertar nuevas variaciones
      if (variations && variations.length > 0) {
        const variationsWithProductId = variations.map((variation) => ({
          name: variation.name,
          price: variation.price,
          stock: variation.stock,
          pictures: variation.pictures,
          product_id: productId,
          currency_id: variation.currency_id,
        }));

        const { error: variationsError } = await supabase
          .from("product_variations")
          .insert(variationsWithProductId);

        if (variationsError) throw variationsError;

        // Insertar atributos de las variaciones
        const variationAttributes = variations.flatMap((variation) =>
          variation.attributes.map((attribute) => ({
            product_variation_id: variation.id,
            attribute_value_id: attribute.id,
          }))
        );
        console.log(variationAttributes);

        const { error: attributesError } = await supabase
          .from("product_variation_attributes")
          .insert(variationAttributes);

        if (attributesError) throw attributesError;
      }
    }
    return product;
  } catch (error) {
    console.error("Error updating/upserting product:", error);
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
    console.log("GOL", product);
    if (productError) throw productError;

    const { data: variations, error: variationsError } = await supabase
      .from("product_variations")
      .select(
        `
        *,
        product_variation_attributes (
          attribute_value_id (
            *
          ),
          product_variation_id(
          *,
          currency_id(*)
          )
        )
      `
      )
      .eq("product_id", productId);

    if (variationsError) throw variationsError;
    // Reestructurar las variaciones para que coincidan con el tipo ProductVariation
    const formattedVariations = variations.map((variation) => {
      const attributes = variation.product_variation_attributes.map(
        (attr) => attr.attribute_value_id
      );
      return {
        id: variation.id,
        product_id: variation.product_id,
        name: variation.name,
        price: variation.price,
        stock: variation.stock,
        created_at: variation.created_at,
        pictures: variation.pictures,
        currency_id: variation.currency_id,
        attributes: attributes,
        currency: variation.currency_id,
      };
    });

    return { ...product, variations: formattedVariations };
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
  supplies: string[];
  supply_variations: string[];
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

const ProductForm = forwardRef<FormikRef, ProductForm>((props) => {
  const [categories, setCategories] = useState([{ label: "", value: "" }]);
  const [subcategories, setSubcategories] = useState([
    { label: "", value: "" },
  ]);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const productId =
    location.pathname.substring(location.pathname.lastIndexOf("/") + 1) ===
    "product-new"
      ? false
      : location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
  const formRef = useRef<FormikRef>(null);

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
    supplies: [],
    supply_variations: [],
  });

  const [supplies, setSupplies] = useState<Supply[]>([]);

  useEffect(() => {
    supabaseService
      .getSupplies()
      .then((data) => setSupplies(transformArrayToObjectArray(data)));
  }, []);

  useEffect(() => {
    console.log("HOL", productId);
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
    if (productId) {
      getProductById(parseInt(productId))
        .then((prod) => {
          const formik = formRef.current;
          formik.setValues(prod);
          setVariations(prod.variations);
          delete prod.variations;
          setInitialValues(prod);
        })
        .catch((error) => {
          console.log(error);
          setError("No se encontró el producto");
        });
    }
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

      if (productId) {
        await upsertProduct(values, parseInt(productId), variations);
      } else {
        await createProduct(values, variations);
      }

      // Manejar el éxito (por ejemplo, mostrar un mensaje, redirigir, etc.)
      console.log("Formulario enviado exitosamente");
      setSubmitting(false);
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      setError("Ocurrió un error al enviar el formulario");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Formik
        innerRef={formRef}
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

                  <Supplies
                    touched={touched}
                    errors={errors}
                    values={values}
                    supplies={supplies}
                  />

                  {values.type !== "simple" && (
                    <Attribute
                      touched={touched}
                      errors={errors}
                      values={values}
                      supplies={supplies}
                      variations={variations}
                      setVariations={setVariations}
                      setFieldValue={setFieldValue}
                    />
                  )}
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
                    {productId ? "Actualizar Producto" : "Crear Producto"}
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
