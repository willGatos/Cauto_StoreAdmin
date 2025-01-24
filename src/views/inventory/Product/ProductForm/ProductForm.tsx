import { Attribute as TypeAttribute } from "@/@types/products";
import { Loading } from "@/components/shared";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StickyFooter from "@/components/shared/StickyFooter";
import Button from "@/components/ui/Button";
import HandleFeedback from "@/components/ui/FeedBack";
import { FormContainer } from "@/components/ui/Form";
import { supabaseService } from "@/services/Supabase/AttributeService";
import supabase from "@/services/Supabase/BaseClient";
import { useAppSelector } from "@/store";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import { forwardRef, useEffect, useRef, useState } from "react";
import { AiOutlineSave } from "react-icons/ai";
import { HiOutlineTrash } from "react-icons/hi";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { Supply } from "../../Supply/List/Data/types";
import BasicInformationFields from "./BasicInformationFields";
import Attribute from "./components/Attribute";
import { useCategories } from "./components/Categories/hook/useCategories";
import OrganizationFields from "./OrganizationFields";
import PricingFields from "./PricingFields";
import ProductImages from "./ProductImages";
import Supplies from "./Supplies";

export type ProductVariation = {
  id?: any;
  name: string;
  price: number;
  stock: number;
  pictures?: string[];
  currency_id?: number;
  supply_variations?: number[];
  enabled: boolean;
};

function mergeArraysByIndex(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    throw new Error("Los arrays deben tener la misma longitud");
  }
  return arr1.flatMap((item1, index) => {
    const item2 = arr2[index];
    return item2.attributes.map((attribute) => ({
      product_variation_id: item1.id,
      attribute_value_id: attribute,
    }));
  });
}

/**
 * Crea un nuevo producto con sus relaciones en la base de datos
 * @param productData - Datos principales del producto
 * @param categories - Array de IDs de categorías a asociar
 * @param variations - Variaciones del producto (tallas, colores, etc.)
 * @param supplies - Insumos necesarios para productos fabricados
 * @returns Objeto vacío (considerar devolver el producto creado)
 */
export const createProduct = async (
  productData: ProductData,
  categories: number[],
  variations: ProductVariation[],
  supplies: number[]
) => {
  try {
    // 1. EXTRACCIÓN DE PROPIEDADES DEL PRODUCTO
    const {
      name,
      description,
      shop_id,
      cost,
      discount,
      state,
      gender,
      commission,
      type,
      origin,
      commission_type,
      reference_currency,
      owner_id,
      standard_price,
      status,
      images,
      socialMediaLink,
    } = productData;

    // 2. CREACIÓN DEL PRODUCTO PRINCIPAL
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          shop_id,
          cost,
          discount,
          state,
          gender,
          commission,
          type,
          origin,
          commission_type,
          reference_currency,
          owner_id,
          standard_price,
          status,
          images,
          social_media_link: socialMediaLink,
        },
      ])
      .select("*")
      .single();

    if (productError) throw productError;

    // 3. ASOCIACIÓN CON CATEGORÍAS
    await supabase.from("category_product").insert(
      categories.map((categoryId) => ({
        category_id: categoryId,
        product_id: product.id,
      }))
    );

    // 4. MANEJO DE INSUMOS PARA PRODUCTOS FABRICADOS
    if (origin === "manufactured") {
      const supplyRelations = supplies.map((supplyId) => ({
        supply_id: supplyId,
        product_id: product.id,
      }));

      const { error: errorCP } = await supabase
        .from("product_supplies")
        .insert(supplyRelations);

      if (errorCP) throw errorCP;
    }

    // 5. CREACIÓN DE VARIACIONES DEL PRODUCTO
    if (variations?.length && type !== "simple") {
      // Insertar variaciones principales
      const variationsToInsert = variations.map((variation) => ({
        name: variation.name,
        price: variation.price,
        stock: variation.stock,
        pictures: variation.pictures,
        product_id: product.id,
        currency_id: variation.currency_id,
        enabled: variation.enabled,
      }));

      const { data: createdVariations, error: variationsError } = await supabase
        .from("product_variations")
        .insert(variationsToInsert)
        .select("id, name");

      if (variationsError) throw variationsError;

      // 6. ASOCIACIÓN DE ATRIBUTOS DE VARIACIONES
      const variationAttributes = createdVariations.flatMap(
        (createdVar, index) =>
          (variations[index].attributes || []).map((attr) => ({
            product_variation_id: createdVar.id,
            attribute_value_id: attr,
          }))
      );

      const { error: attributesError } = await supabase
        .from("product_variation_attributes")
        .insert(variationAttributes);

      if (attributesError) throw attributesError;

      // 7. RELACIONES CON INSUMOS PARA VARIACIONES FABRICADAS (CORREGIDO)
      if (origin === "manufactured") {
        // Generar relaciones usando el índice para emparejar createdVariations con variations
        const supplyVariationRelations = createdVariations
          .flatMap((createdVar, index) =>
            (variations[index].supply_variations || [])
              .filter(Boolean)
              .map((supplyVarId) => ({
                supply_variation_id: supplyVarId,
                product_variation_id: createdVar.id,
              }))
          )
          // Eliminar duplicados
          .filter(
            (value, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.product_variation_id === value.product_variation_id &&
                  t.supply_variation_id === value.supply_variation_id
              )
          );

        if (supplyVariationRelations.length > 0) {
          const { error: supplyVarError } = await supabase
            .from("supply_variation_product_variations")
            .insert(supplyVariationRelations);

          if (supplyVarError) throw supplyVarError;
        }
      }
    }

    return product || {};
  } catch (error) {
    console.error("Error creando producto:", error);
    throw error;
  }
};

/**
 * Actualiza un producto y sus relaciones en la base de datos
 * @param productData - Datos principales del producto
 * @param categories - Array de IDs de categorías a asociar
 * @param productId - ID del producto a actualizar
 * @param variations - Variaciones del producto (tallas, colores, etc.)
 * @returns Producto actualizado
 */
export const updateProduct = async (
  productData: ProductData,
  categories: number[],
  productId: number,
  variations?: ProductVariation[]
) => {
  try {
    // 1. EXTRACCIÓN Y ACTUALIZACIÓN DE PROPIEDADES DEL PRODUCTO
    const {
      name,
      description,
      shop_id,
      cost,
      discount,
      state,
      gender,
      commission,
      type,
      origin,
      commission_type,
      reference_currency,
      owner_id,
      standard_price,
      status,
      images,
      socialMediaLink,
    } = productData;

    // Actualizar producto principal
    const { data: product, error: updateError } = await supabase
      .from("products")
      .update({
        name,
        description,
        shop_id,
        cost,
        discount,
        state,
        gender,
        commission,
        type,
        origin,
        commission_type,
        reference_currency,
        owner_id,
        standard_price,
        status,
        images,
        social_media_link: socialMediaLink,
      })
      .eq("id", productId)
      .single();

    if (updateError) throw updateError;

    // 2. ACTUALIZACIÓN DE CATEGORÍAS
    const categoriesPayload = categories.map((categoryId) => ({
      category_id: categoryId,
      product_id: productId,
    }));

    await supabase
      .from("category_product")
      .delete()
      .eq("product_id", productId);

    await supabase.from("category_product").insert(categoriesPayload);

    // 3. MANEJO DE VARIACIONES
    if (variations?.length) {
      // Separar variaciones existentes de nuevas
      const existingVariations = variations.filter((v) => v.id);
      const newVariations = variations.filter((v) => !v.id);

      // Actualizar variaciones existentes
      await Promise.all(
        existingVariations.map(async (variation) => {
          const { error } = await supabase
            .from("product_variations")
            .update({
              name: variation.name,
              price: variation.price,
              stock: variation.stock,
              pictures: variation.pictures,
              currency_id: variation.currency_id,
              enabled: variation.enabled,
            })
            .eq("id", variation.id);

          if (error) throw error;
        })
      );

      // Crear nuevas variaciones
      let createdVariations: ProductVariation[] = [];

      if (newVariations.length > 0) {
        const { data, error } = await supabase
          .from("product_variations")
          .insert(
            newVariations.map((v) => ({
              product_id: productId,
              name: v.name,
              price: v.price,
              stock: v.stock,
              pictures: v.pictures,
              currency_id: v.currency_id,
              enabled: v.enabled,
            }))
          )
          .select("id");

        if (error) throw error;
        createdVariations = data;
      }

      // Combinar todas las variaciones con IDs
      const allVariations = [
        ...existingVariations,
        ...newVariations.map((v, i) => ({
          ...v,
          id: createdVariations[i]?.id,
        })),
      ].filter((v) => v.id);

      // 4. MANEJO DE INSUMOS PARA PRODUCTOS FABRICADOS
      if (origin === "manufactured") {
        // Actualizar relaciones de insumos principales
        if (productData.supplies) {
          const suppliesPayload = productData.supplies.map((supplyId) => ({
            supply_id: supplyId,
            product_id: productId,
          }));

          await supabase
            .from("product_supplies")
            .delete()
            .eq("product_id", productId);

          await supabase.from("product_supplies").insert(suppliesPayload);
        }

        // Manejar relaciones de variaciones de insumos
        const supplyVariationRelations = allVariations
          .flatMap((variation) =>
            (variation.supply_variations || [])
              .filter(Boolean)
              .map((supplyVarId) => ({
                supply_variation_id: supplyVarId,
                product_variation_id: variation.id!,
              }))
          )
          .filter(
            (v, i, self) =>
              i ===
              self.findIndex(
                (t) =>
                  t.supply_variation_id === v.supply_variation_id &&
                  t.product_variation_id === v.product_variation_id
              )
          );

        await supabase
          .from("supply_variation_product_variations")
          .upsert(supplyVariationRelations, {
            onConflict: ["supply_variation_id", "product_variation_id"],
          });
      }

      // 5. ACTUALIZACIÓN DE ATRIBUTOS
      // Eliminar atributos existentes solo de variaciones actualizadas
      await supabase
        .from("product_variation_attributes")
        .delete()
        .in(
          "product_variation_id",
          existingVariations.map((v) => v.id!)
        );

      console.log("All Variations", allVariations);
      // Filtrar atributos válidos y crear payload
      const variationAttributes = allVariations
        .flatMap((variation) =>
          (variation.attributes || [])
            // Filtrar atributos sin ID válido
            //.filter((attribute) => Boolean(attribute?.id))
            .map((attribute) => ({
              product_variation_id: variation.id!,
              attribute_value_id: attribute,
            }))
        )
        // Filtrar posibles entradas nulas después del mapeo
        .filter((attr) => Boolean(attr.attribute_value_id));
      console.log(variationAttributes);
      if (variationAttributes.length > 0) {
        const { error: attributesError } = await supabase
          .from("product_variation_attributes")
          .insert(variationAttributes);

        if (attributesError) throw attributesError;
      }
    }

    return product;
  } catch (error) {
    console.error("Error actualizando producto:", error);
    throw error;
  }
};

export const getProductById = async (productId: number) => {
  try {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        "*, categories(*), supplies(*),variations: product_variations (*, supply_variation(*), attribute_values(*, type(id, name))))) "
      )
      .eq("id", productId)
      .single();

    if (productError) throw productError;

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export type ProductData = {
  name: string;
  description: string | null;
  shop_id: number | null;
  cost: number;
  discount: number;
  state: "available" | "unavailable";
  gender: string | null;
  commission: number;
  type: "simple" | "variable" | null;
  origin: "manufactured" | "imported" | null;
  commission_type: "percentage" | "fixed";
  reference_currency: number | null;
  owner_id: string | null;
  standard_price: number;
  status: 0 | 1 | 2 | 3;
  variations?: ProductVariation[];
  images: string[];
  supplies: string[];
  attributes: [];
  socialMediaLink: string; // Nuevo campo
};

export function transformArrayToObjectArray(array: any) {
  return array.map((item: any) => ({
    ...item,
    label: item.name || item.description,
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
  socialMediaLink: Yup.string().url("Debe ser una URL válida").nullable(),
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
        Borrar
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
          ¿Estás seguro de que deseas eliminar este producto? Todos los
          registros relacionados con este producto también serán eliminados.
          Esta acción no se puede deshacer.
        </p>
      </ConfirmDialog>
    </>
  );
};

//

const ProductForm = forwardRef<FormikRef, ProductForm>((props) => {
  const [categoriesOpt, setCategoriesOpt] = useState();
  const [variations, setVariations] = useState<ProductVariation[]>([
    {
      supply_variation: [],
      supply_variations: [],
      name: "",
      price: 0,
      stock: 0,
      pictures: [],
      currency_id: 1,
      attributes: [],
      enabled: true,
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<Boolean>(true);
  const [localImages, setLocalImages] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const productId =
    location.pathname.substring(location.pathname.lastIndexOf("/") + 1) ===
    "product-new"
      ? false
      : location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
  const formRef = useRef<FormikRef>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedIdsForAttributes, setSelectedIdsForAttributes] = useState<
    Set<number>
  >(new Set());
  const [selectedIdsForAttributeValues, setSelectedIdsForAttributeValues] =
    useState<Set<number>>(new Set());
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<number, number[]>
  >({});
  const [initialValues, setInitialValues] = useState<ProductData>({
    name: "",
    description: null,
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
    attributes: [],
  });

  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [attributes, setAttributes] = useState<TypeAttribute[]>([]);
  const { shopId } = useAppSelector((state) => state.auth.user);

  const { categories } = useCategories();
  useEffect(() => {
    setLoading(true);
    supabaseService
      .getSupplies(shopId)
      .then((data) => setSupplies(transformArrayToObjectArray(data)));

    supabaseService
      .getAttributes(shopId)
      .then((data) => setAttributes(transformArrayToObjectArray(data)));
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);

      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const product = await getProductById(parseInt(productId));
        const formik = formRef.current;

        // Configurar categorías
        const categoryIds = new Set(product.categories.map((c) => c.id));
        setSelectedIds(categoryIds);

        // Procesar atributos
        const attributeData = processAttributeData(product.variations);
        setSelectedIdsForAttributes(attributeData.typeIds);
        setSelectedAttributes(attributeData.initialAttributes);
        setSelectedIdsForAttributeValues(attributeData.valueIds);

        // Procesar variaciones
        const processedVariations = processVariations(product.variations);
        setVariations(processedVariations);

        // Procesar suministros
        const suppliesData = processSupplies(product.supplies);
        const formSupplies = suppliesData.map((supply) => supply.id);

        // Configurar valores iniciales
        const initialValues = prepareInitialValues(product, formSupplies);
        setInitialValues(initialValues);
        setLocalImages(product.images);
        formik.setValues(initialValues);
      } catch (error) {
        setError("No se encontró el producto");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();

    return () => setLoading(false);
  }, [supplies]);

  // Funciones auxiliares
  const processAttributeData = (variations: Variation[]) => {
    const attributeValueIds = new Set<number>();
    const attributeTypeIds = new Set<number>();
    const initialAttributes: { [key: number]: number[] } = {};

    variations.forEach((variation) => {
      variation.attribute_values.forEach((av) => {
        const typeId = av.type.id;
        const valueId = av.id;

        attributeValueIds.add(valueId);
        attributeTypeIds.add(typeId);

        if (!initialAttributes[typeId]) {
          initialAttributes[typeId] = [];
        }

        if (!initialAttributes[typeId].includes(valueId)) {
          initialAttributes[typeId].push(valueId);
        }
      });
    });

    return {
      valueIds: attributeValueIds,
      typeIds: attributeTypeIds,
      initialAttributes,
    };
  };

  const processVariations = (variations: ProductVariation[]) => {
    return variations.map((v) => ({
      ...v,
      supply_variation: transformArrayToObjectArray(v.supply_variation),
      supply_variations: v.supply_variation.map((sv) => sv.id),
      attributes: v.attribute_values.map((av) => av.id),
    }));
  };

  // Función corregida para procesar suministros
  const processSupplies = (productSupplies: Supply[]) => {
    return transformArrayToObjectArray(
      productSupplies
        .map((supply) => supplies.find((s) => s.value === supply.id)) // Usa el arreglo global 'supplies'
        .filter(Boolean) as Supply[]
    );
  };

  // Función corregida para preparar valores iniciales
  const prepareInitialValues = (product: ProductData, supplies: number[]) => {
    if (!product) return { supplies: [] }; // Fallback seguro

    const {
      variations,
      social_media_link, // Nombre de campo de la API
      ...restProduct
    } = product;

    console.log(social_media_link, product);

    return {
      ...restProduct,
      socialMediaLink: social_media_link || "", // Mapeo a camelCase
      supplies,
    };
  };

  const { handleSuccess, handleLoading } = HandleFeedback();
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
      handleLoading(true);

      values.owner_id = user.id;
      values.images = localImages;
      const suppliesIds = values.supplies;

      const miArray = Array.from(selectedIds);

      if (productId) {
        await updateProduct(values, miArray, parseInt(productId), variations);
      } else {
        await createProduct(values, miArray, variations, suppliesIds);
      }

      // Manejar el éxito (por ejemplo, mostrar un mensaje, redirigir, etc.)
      handleSuccess("Formulario enviado exitosamente");
      setSubmitting(false);
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      setError("Ocurrió un error al enviar el formulario");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Loading loading={loading}>
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
                    <BasicInformationFields
                      values={values}
                      touched={touched}
                      errors={errors}
                    />

                    <OrganizationFields
                      touched={touched}
                      errors={errors}
                      values={values}
                      categories={categories}
                      selectedIds={selectedIds}
                      setSelectedIds={setSelectedIds}
                    />

                    <PricingFields
                      touched={touched}
                      errors={errors}
                      values={values}
                    />

                    {values.origin == "manufactured" && (
                      <Supplies
                        touched={touched}
                        errors={errors}
                        values={values}
                        supplies={supplies}
                      />
                    )}

                    {values.type !== "simple" && (
                      <Attribute
                        touched={touched}
                        errors={errors}
                        values={values}
                        attributes={attributes}
                        supplies={supplies}
                        variations={variations}
                        setVariations={setVariations}
                        setFieldValue={setFieldValue}
                        selectIds={{
                          selectedIdsForAttributes,
                          setSelectedIdsForAttributes,
                          selectedIdsForAttributeValues,
                          setSelectedIdsForAttributeValues,
                          selectedAttributes,
                          setSelectedAttributes,
                        }}
                      />
                    )}
                  </div>

                  <div>
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
      </Loading>
    </>
  );
});

ProductForm.displayName = "ProductForm";

export default ProductForm;
