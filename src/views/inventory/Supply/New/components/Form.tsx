import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui";
import Checkbox from "@/components/ui/Checkbox";
import { PlusCircle, Trash2 } from "lucide-react";
import Typography from "@/views/ui-components/common/Typography";
import { useSelector } from "react-redux";
import supabase from "@/services/Supabase/BaseClient";
import { Supply, SupplyVariation } from "@/@types/supply";
import { Currency } from "@/@types/currency";
import { Product, ProductVariation } from "@/@types/products";
// Tipos

interface FormValues extends Supply {
  variations: SupplyVariation[];
  products: number[];
}

// Valores iniciales
const initialValues: FormValues = {
  name: "",
  type: "fixed",
  supply_variation_id: 0,
  variations: [
    {
      cost: 0,
      currency_id: 0,
      description: "",
      measure: "",
      product_variations: [],
    },
  ],
  products: [],
};

// Esquema de validación
const validationSchema = Yup.object().shape({
  name: Yup.string().required("El nombre es requerido"),
  type: Yup.string()
    .oneOf(["fixed", "variable"])
    .required("El tipo es requerido"),
  variations: Yup.array()
    .of(
      Yup.object().shape({
        cost: Yup.number()
          .min(0, "El costo debe ser mayor o igual a 0")
          .required("El costo es requerido"),
        currency_id: Yup.number()
          .min(1, "Debe seleccionar una moneda")
          .required("La moneda es requerida"),
        description: Yup.string().required("La descripción es requerida"),
        measure: Yup.string().required("La medida es requerida"),
        product_variations: Yup.array().of(
          Yup.object().shape({
            id: Yup.number().required(),
            required_supplies: Yup.number()
              .min(0, "La cantidad requerida debe ser mayor o igual a 0")
              .required("La cantidad requerida es necesaria"),
          })
        ),
      })
    )
    .min(1, "Debe haber al menos una variación"),
  products: Yup.array().of(Yup.number()),
});

// Servicios mock (reemplazar con servicios de Supabase en producción)
const fetchCurrencies = async (): Promise<Currency[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { id: 1, name: "Dólar", symbol: "USD" },
    { id: 2, name: "Euro", symbol: "EUR" },
    { id: 3, name: "Peso Cubano", symbol: "CUP" },
  ];
};

const fetchProducts = async (): Promise<Product[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    {
      id: 1,
      name: "Producto 1",
      variations: [
        { id: 1, name: "Variación 1.1" },
        { id: 2, name: "Variación 1.2" },
      ],
    },
    {
      id: 2,
      name: "Producto 2",
      variations: [
        { id: 3, name: "Variación 2.1" },
        { id: 4, name: "Variación 2.2" },
      ],
    },
  ];
};
const fetchCurrenciesFromSupabase = async (): Promise<Currency[]> => {
  const { data, error } = await supabase.from("currency").select("*");

  if (error) throw error;
  return data;
};
// Servicios de Supabase (comentados)
/*
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY')

const fetchCurrenciesFromSupabase = async (): Promise<Currency[]> => {
  const { data, error } = await supabase
    .from('currency')
    .select('*')
  
  if (error) throw error;
  return data;
}

const createSupply = async (supply: Supply): Promise<Supply> => {
  const { data, error } = await supabase
    .from('supplies')
    .insert(supply)
    .single()
  
  if (error) throw error;
  return data;
}

const createSupplyVariations = async (variations: SupplyVariation[]): Promise<SupplyVariation[]> => {
  const { data, error } = await supabase
    .from('supply_variation')
    .insert(variations)
  
  if (error) throw error;
  return data;
}
*/

const fetchProductsFromSupabase = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from("products").select(`
      id,
      name,
      variations:product_variations (id, name)
    `);

  if (error) throw error;
  return data;
};
const updateSupplyVariationProductVariations = async (
  supplyVariationId: string | number,
  productVariations: ProductVariationRelation[]
) => {
  // Primero, eliminamos todas las relaciones existentes
  const { error: deleteError } = await supabase
    .from("supply_variation_product_variations")
    .delete()
    .match({ supply_variation_id: supplyVariationId });

  if (deleteError) throw deleteError;

  // Luego, insertamos las nuevas relaciones
  const newRelations = productVariations.map((pv) => ({
    supply_variation_id: supplyVariationId,
    product_variation_id: pv.id,
    required_supplies: pv.required_supplies,
  }));

  const { error: insertError } = await supabase
    .from("supply_variation_product_variations")
    .insert(newRelations);

  if (insertError) throw insertError;
};

const updateProductSupplies = async (
  supplyId: string,
  productIds: number[]
) => {
  // Primero, eliminamos todas las relaciones existentes
  const { error: deleteError } = await supabase
    .from("product_supplies")
    .delete()
    .match({ supply_id: supplyId });

  if (deleteError) throw deleteError;

  // Luego, insertamos las nuevas relaciones
  const newRelations = productIds.map((pId) => ({
    supply_id: supplyId,
    product_id: pId,
  }));

  const { error: insertError } = await supabase
    .from("product_supplies")
    .insert(newRelations);

  if (insertError) throw insertError;
};

// Servicio para obtener un suministro por su ID
const fetchSupplyById = async (id: number): Promise<Supply> => {
  const { data, error } = await supabase
    .from("supplies")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

// Servicio para obtener las variaciones de un suministro por su ID
const fetchExistingVariationsBySupplyId = async (
  supplyId: number
): Promise<SupplyVariation[]> => {
  const { data, error } = await supabase
    .from("supply_variation")
    .select("*")
    .eq("supply_id", supplyId);

  if (error) throw error;
  return data;
};

// Servicio para crear un nuevo suministro
const createSupply = async (supply: Supply): Promise<Supply> => {
  const { data, error } = await supabase
    .from("supplies")
    .upsert(supply)
    .select()
    .single();
  console.log("SOY", data);
  if (error) throw error;
  return data;
};

// Servicio para actualizar un suministro existente
const updateSupply = async (id, supply: Supply): Promise<Supply> => {
  const { data, error } = await supabase
    .from("supplies")
    .update(supply)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

// Servicio para crear nuevas variaciones de un suministro
const createSupplyVariations = async (
  variations: SupplyVariation[]
): Promise<SupplyVariation[]> => {
  const { data, error } = await supabase
    .from("supply_variation")
    .upsert(variations)
    .select();

  if (error) throw error;
  return data;
};

// Servicio para actualizar una variación existente de un suministro
const updateSupplyVariation = async (
  supplyVarId,
  variation: SupplyVariation
): Promise<SupplyVariation> => {
  const { data, error } = await supabase
    .from("supply_variation")
    .update(variation)
    .eq("id", supplyVarId)
    .single();

  if (error) throw error;
  return data;
};

// Servicio para eliminar una variación de un suministro
const deleteSupplyVariation = async (variationId: number): Promise<void> => {
  const { error } = await supabase
    .from("supply_variation")
    .delete()
    .eq("id", variationId);

  if (error) throw error;
};

export const fetchProductsAndVariations = async () => {
  // Fetch products
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id, name"); // Sólo traemos id y nombre de los productos

  if (productsError) throw productsError;

  // Fetch product variations for all products
  const { data: variationsData, error: variationsError } = await supabase
    .from<ProductVariation>("product_variations")
    .select("*"); // Traemos todas las variaciones

  if (variationsError) throw variationsError;

  const newProd = productsData.map((product) => {
    variationsData.map((variation) => {
      if (variation.product_id === product.id) {
        product.variations = []; // Inicializamos el array si no existe
        product.variations.push(variation);
      } else {
        product.variations = []; // Inicializamos el array si no existe
      }
      return variation;
    });
    console.log("SOY YO", product);
    return product;
  });
  console.log(newProd);

  return newProd;
};

export default function SupplyForm() {
  const { id } = useParams<{ id: string }>();
  const [initialFormValues, setInitialFormValues] =
    useState<FormValues>(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [valueRan, setValueRan] = useState("");
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Cargar monedas desde Supabase
        const currenciesData = await fetchCurrenciesFromSupabase();
        setCurrencies(currenciesData);
        try {
          // Cargar prods desde Supabase
          const productsData = await fetchProductsAndVariations();

          console.log("Productos:", productsData);
          setProducts(productsData);
        } catch (error) {
          console.error("Error al cargar productos y variaciones:", error);
        }

        if (id) {
          // Cargar el suministro existente desde Supabase
          const supply = await fetchSupplyById(id);

          // Verificar si el suministro pertenece a la tienda del usuario
          if (supply.shop_id !== user.shopId) {
            throw new Error("No tienes permiso para editar este suministro");
          }

          // Cargar variaciones existentes del suministro
          const variations = await fetchExistingVariationsBySupplyId(id);

          // Configurar los valores iniciales del formulario
          setInitialFormValues({
            id: supply.id,
            name: supply.name,
            type: supply.type,
            supply_variation_id: supply.supply_variation_id,
            variations: variations.map((variation) => ({
              ...variation,
              product_variations: [],
              created_at: new Date(variation.created_at).toISOString(),
            })),
            products: products.map((p) => p.id),
          });
        }
      } catch (err) {
        setError(err.message || "Error al cargar los datos iniciales");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, user.shopId]);

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      // Obtener el shopId del usuario desde Redux
      let supply;
      if (values.id) {
        // Obtener el suministro existente
        const existingSupply = await fetchSupplyById(values.id);

        // Verificar si el suministro pertenece a la tienda del usuario
        if (existingSupply.shop_id !== user.shopId) {
          throw new Error("No tienes permiso para editar este suministro");
        }

        // Actualizar relaciones de variaciones de suministro con variaciones de producto
        for (const variation of values.variations) {
          await updateSupplyVariationProductVariations(
            variation.id,
            variation.product_variations
          );
          delete variation.product_variations;
          delete variation.id;
        }

        const variations = await createSupplyVariations(
          values.variations.map((v) => ({
            ...v,
            supply_id: id,
          }))
        );

        // Actualizar relaciones de suministro con productos
        await updateProductSupplies(id!, values.products);

        // Actualizar el suministro
        supply = await updateSupply(values.id, {
          name: values.name,
          type: values.type,
          shop_id: user.shopId, // Asegurarse de que el shop_id no cambie
        });

        // // Obtener las variaciones existentes
        // const existingVariations =
        //     await fetchExistingVariationsBySupplyId(values.id)
        console.log(values.variations);
        // Actualizar y crear variaciones
        for (const variation of values.variations) {
          if (variation.id) {
            console.log("first1");
            const { id: variationId } = variation;
            delete variation.id;
            // Actualizar variación existente
            await updateSupplyVariation(variationId, variation);
          } else {
            console.log("first2");
            // Crear nueva variación
            await createSupplyVariations([
              {
                ...variation,
                supply_id: +id,
              },
            ]);
          }
        }

        // // Eliminar variaciones que no están en la lista actual
        // const existingVariationIds = existingVariations.map((v) => v.id)
        // const incomingVariationIds = values.variations.map((v) => v.id)
        // const variationsToDelete = existingVariationIds.filter(
        //     (id) => !incomingVariationIds.includes(id)
        // )

        // for (let variationId of variationsToDelete) {
        //     await deleteSupplyVariation(variationId)
        // }
      } else {
        // Creación de un nuevo suministro
        supply = await createSupply({
          name: values.name,
          type: values.type,
          shop_id: user.shopId,
        });

        console.log(supply);

        // Crear variaciones para el nuevo suministro
        const variationsToCreate = values.variations.map((v) => ({
          ...v,
          supply_id: id,
        }));
        await createSupplyVariations(variationsToCreate);
      }

      alert(values.id ? "Suministro actualizado" : "Suministro creado");
    } catch (err) {
      setError(err.message || "Error al guardar el suministro");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (error) {
    return <Alert variant="default">{error}</Alert>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {id ? "Editar Suministro" : "Crear Suministro"}
      </h2>
      <Formik
        initialValues={initialFormValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            <div>
              <label htmlFor="name">Nombre</label>
              <Field name="name" as={Input} className="mt-1" />
              {errors.name && touched.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="fixed"
                checked={values.type === "fixed"}
                onChange={(checked) => {
                  setFieldValue("type", checked ? "fixed" : "variable");
                }}
              />
              <label htmlFor="fixed">Fijo</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="variable"
                checked={values.type === "variable"}
                onChange={(checked) => {
                  setFieldValue("type", checked ? "variable" : "fixed");
                }}
              />
              <label htmlFor="variable">Variable</label>
            </div>

            <div>
              <label>Productos</label>
              <div className="space-y-2 mt-2">
                <Checkbox.Group
                  name="products"
                  value={values.products} // Vincula el valor del grupo a los productos seleccionados
                  onChange={(checked) => {
                    setProducts(products);
                    setFieldValue("products", checked);
                  }}
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`product-${product.id}`}
                        value={product.id} // Asigna el ID del producto como valor del checkbox
                      />
                      <label htmlFor={`product-${product.id}`}>
                        {product.name}
                      </label>
                    </div>
                  ))}
                </Checkbox.Group>

                {/* {products.map(product => (
                            <div key={product.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`product-${product.id}`}
                                checked={values.products.includes(product.id)}
                                onChange={(checked) => {
                                  const newProducts = checked
                                    ? [...values.products, product.id]
                                    : values.products.filter(id => id !== product.id)
                                  
                                    console.log({ checked, newProducts });

                                  setFieldValue('products', newProducts.slice())
                                }}
                              />
                              <label htmlFor={`product-${product.id}`}>{product.name}</label>
                            </div>
                          ))} */}
              </div>
            </div>

            <FieldArray name="variations">
              {({ push, remove }) => (
                <div>
                  {values.variations.map((variation, index) => (
                    <Card key={index} className="mb-4">
                      <div className="pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Variación {index + 1}
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor={`variations.${index}.cost`}>
                              Costo
                            </label>
                            <Field
                              name={`variations.${index}.cost`}
                              type="number"
                              as={Input}
                              className="mt-1"
                            />
                            {errors.variations?.[index]?.cost &&
                              touched.variations?.[index]?.cost && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.variations[index].cost}
                                </p>
                              )}
                          </div>

                          <div>
                            <label>Moneda</label>
                            <div className="space-y-2">
                              {currencies.map((currency) => (
                                <div
                                  key={currency.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`currency-${currency.id}-${index}`}
                                    checked={
                                      values.variations[index].currency_id ===
                                      currency.id
                                    }
                                    onChange={(checked) => {
                                      if (checked) {
                                        setFieldValue(
                                          `variations.${index}.currency_id`,
                                          currency.id
                                        );
                                      } else {
                                        console.log(
                                          "HOLA2",
                                          initialFormValues,
                                          currency.id
                                        );

                                        setFieldValue(
                                          `variations.${index}.currency_id`,
                                          0
                                        );
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`currency-${currency.id}-${index}`}
                                  >
                                    {currency.name}{" "}
                                  </label>
                                </div>
                              ))}
                            </div>
                            {errors.variations?.[index]?.currency_id &&
                              touched.variations?.[index]?.currency_id && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.variations[index].currency_id}
                                </p>
                              )}
                          </div>

                          <div>
                            <label htmlFor={`variations.${index}.description`}>
                              Descripción
                            </label>
                            <Field
                              name={`variations.${index}.description`}
                              as={Input}
                              className="mt-1"
                            />
                            {errors.variations?.[index]?.description &&
                              touched.variations?.[index]?.description && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.variations[index].description}
                                </p>
                              )}
                          </div>

                          <div>
                            <label htmlFor={`variations.${index}.measure`}>
                              Medida
                            </label>
                            <Field
                              name={`variations.${index}.measure`}
                              as={Input}
                              className="mt-1"
                            />
                            {errors.variations?.[index]?.measure &&
                              touched.variations?.[index]?.measure && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.variations[index].measure}
                                </p>
                              )}
                          </div>
                          <div>
                            <label>Variaciones de Producto</label>
                            <div className="space-y-4 mt-2">
                              {products
                                .filter((p) => values.products.includes(p.id))
                                .map((product, key) => (
                                  <div key={key}>
                                    {product.variations.map((pv) => (
                                      <div key={pv.id} className="ml-4 mt-2">
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`pv-${pv.id}-${index}`}
                                            checked={values.variations[
                                              index
                                            ].product_variations.some(
                                              (v) => v.id === pv.id
                                            )}
                                            onChange={(checked) => {
                                              const newProductVariations =
                                                checked
                                                  ? [
                                                      ...values.variations[
                                                        index
                                                      ].product_variations,
                                                      {
                                                        id: pv.id,
                                                        required_supplies: 0,
                                                      },
                                                    ]
                                                  : values.variations[
                                                      index
                                                    ].product_variations.filter(
                                                      (v) => v.id !== pv.id
                                                    );

                                              console.log(newProductVariations);
                                              setFieldValue(
                                                `variations.${index}.product_variations`,
                                                newProductVariations
                                              );
                                            }}
                                          />
                                          <label
                                            htmlFor={`pv-${pv.id}-${index}`}
                                          >
                                            {pv.name}
                                          </label>
                                        </div>
                                        {values.variations[
                                          index
                                        ].product_variations.some(
                                          (v) => v.id === pv.id
                                        ) && (
                                          <div className="mt-2 ml-6">
                                            <label
                                              htmlFor={`pv-${pv.id}-${index}-required`}
                                            >
                                              Cantidad Requerida para la
                                              Variación
                                            </label>
                                            <Field
                                              name={`variations.${index}.product_variations[${values.variations[
                                                index
                                              ].product_variations.findIndex(
                                                (v) => v.id === pv.id
                                              )}].required_supplies`}
                                              type="number"
                                              as={Input}
                                              className="mt-1 w-24"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                            </div>
                          </div>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="default"
                              onClick={() => remove(index)}
                              className="mt-2"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                              Variación
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="default"
                    onClick={() =>
                      push({
                        cost: 0, // Valor vacío para el costo
                        currency_id: 0, // Valor vacío para el ID de la moneda
                        description: "", // Cadena vacía para la descripción
                        measure: "", // Cadena vacía para la medida
                        created_at: "", // Cadena vacía para la fecha de creación
                        supply_id: 0, // Valor vacío para el ID de suministro
                        product_variations: [
                          { id: null, required_supplies: 0 }, // Valores vacíos para la variación de producto
                        ],
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Variación
                  </Button>
                </div>
              )}
            </FieldArray>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Enviando..."
                : id
                ? "Actualizar Suministro"
                : "Crear Suministro"}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
