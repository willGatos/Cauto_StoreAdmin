import { Currency } from "@/@types/currency";
import { Dialog, FormItem, Select } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import supabase from "@/services/Supabase/BaseClient";
import {
  Supply,
  SupplyVariation,
} from "@/views/inventory/Supply/List/Data/types";
import { Loader2, X, FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductData } from "../ProductForm";
import UploadWidget from "./Images";
import { Attribute, AttributeValue } from "@/@types/products";
import VariationSelectionType from "./variationSelectionType";
import Attributes from "../Attributes";
import { AttributeSelect } from "./AttributeSelect";
import { Field } from "formik";
import Label from "@/components/ui/Label";

interface ProductVariation {
  id?: number;
  product_id: number;
  name: string;
  price: number;
  stock: number;
  created_at: string;
  pictures: string[];
  enabled: boolean;
  currency_id: string | number;
  attributes?: AttributeValue[];
  supply_variations: SupplyVariation[];
}

// Mock service
const mockService = {
  getAttributes: async (): Promise<Attribute[]> => {
    const { data, error } = await supabase
      .from("attributes")
      .select("id, name, values:attribute_values(id, value)");
    if (error) throw error;
    return data;
  },
  getCurrencies: async (): Promise<Currency[]> => {
    const { data, error } = await supabase.from("currency").select("*");
    if (error) throw error;
    return data;
  },
  uploadImage: async (file: File): Promise<string> => {
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(`${Date.now()}-${file.name}`, file);
    if (error) throw error;
    const { publicURL, error: urlError } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);
    if (urlError) throw urlError;
    return publicURL;
  },
};

interface ProductVariationGeneratorProps {
  onVariationsChange?: (variations: ProductVariation[]) => void;
  supplies: Supply[];
  values: ProductData;
  variations;
  attributes: Attribute[];
}

export default function ProductVariationGenerator({
  onVariationsChange = () => {},
  variations,
  selectIds,
  attributes,
  setVariations,
  supplies,
  values,
  errors,
  touched,
}: ProductVariationGeneratorProps) {
  const {
    selectedIdsForAttributes,
    setSelectedIdsForAttributes,
    selectedIdsForAttributeValues,
    setSelectedIdsForAttributeValues,
  } = selectIds;
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<number, number[]>
  >({});
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string>({} as string);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [galleries, setGalleries] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState(null);
  const [variationSelectionType, setVariationSelectionType] =
    useState("generate");

  const [variationIndex, setVariationIndex] = useState(0);
  const handleSelectGallery = (gallery) => {
    setSelectedGallery(gallery);
    fetchImages(gallery.id);
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  async function fetchGalleries() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("galleries").select("*");
      if (error) throw error;
      setGalleries(data);
    } catch (error) {
      console.error("Error al obtener galerías:", error);
      setError(
        "No se pudieron cargar las galerías. Por favor, intente de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchImages(galleryId) {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("galleries_images")
        .select("*")
        .eq("gallery_id", galleryId);
      if (error) throw error;
      setImages(data);
    } catch (error) {
      console.error("Error al obtener imágenes:", error);
      setError(
        "No se pudieron cargar las imágenes. Por favor, intente de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  }
  const handleSelectImage = (image) => {
    console.log("VariationIndex", variationIndex);
    setSelectedImages((prev) => {
      const updatedImages = prev.find((img) => img.id === image.id)
        ? prev.filter((img) => img.id !== image.id)
        : [...prev, image];
      return updatedImages;
    });

    // Actualizar el estado con una imagen de carga
    setVariations((prev) =>
      prev.map((v, i) =>
        i === variationIndex
          ? { ...v, pictures: [...v.pictures, "loading"] }
          : v
      )
    );

    // Simular la subida de la imagen (reemplaza esto con tu lógica real de subida)
    const imageUrl = image.url;

    // Actualizar el estado con la URL real de la imagen
    setVariations((prev) =>
      prev.map((v, i) =>
        i === variationIndex
          ? {
              ...v,
              pictures: v.pictures.map((pic) =>
                pic === "loading" ? imageUrl : pic
              ),
            }
          : v
      )
    );
    console.log("Variation", variations);
  };

  const onViewOpen = (img: string) => {
    setSelectedImg(img);
    setViewOpen(true);
  };

  const onDialogClose = () => {
    setViewOpen(false);
    setTimeout(() => {
      setSelectedImg({} as string);
    }, 300);
  };

  useEffect(() => {
    const loadData = async () => {
      const currenciesData = await mockService.getCurrencies();
      setCurrencies(currenciesData);
      setSelectedCurrency(currenciesData[0]);
    };
    loadData();
  }, []);

  useEffect(() => {
    onVariationsChange(variations);
  }, [variations, onVariationsChange]);

  const handleAttributeValueChange = (
    attributeId: number,
    valueId: number,
    isChecked: boolean
  ) => {
    setSelectedAttributes((prev) => {
      const updatedValues = isChecked
        ? [...(prev[attributeId] || []), valueId]
        : (prev[attributeId] || []).filter((id) => id !== valueId);

      return {
        ...prev,
        [attributeId]: updatedValues,
      };
    });
  };

  const generateVariations = () => {
    const selectedAttributesList = Object.entries(selectedAttributes)
      .filter(([_, values]) => values.length > 0)
      .map(([attributeId, valueIds]) => ({
        attribute: attributes.find((attr) => attr.id === Number(attributeId))!,
        values: valueIds.map(
          (id) =>
            attributes
              .find((attr) => attr.id === Number(attributeId))!
              .values.find((v) => v.id === id)!
        ),
      }));

    if (selectedAttributesList.length === 0) {
      alert("Por favor, seleccione al menos un valor de atributo.");
      return;
    }

    const generateCombinations = (
      index: number,
      current: AttributeValue[]
    ): AttributeValue[][] => {
      if (index === selectedAttributesList.length) {
        return [current];
      }

      const combinations: AttributeValue[][] = [];
      for (const value of selectedAttributesList[index].values) {
        combinations.push(
          ...generateCombinations(index + 1, [...current, value])
        );
      }
      return combinations;
    };

    const combinations = generateCombinations(0, []);

    const newVariations: ProductVariation[] = combinations.map(
      (combo, index) => ({
        product_id: 1,
        name: combo.map((attr) => attr.value).join(" - "),
        price: 0,
        stock: 0,
        created_at: new Date().toISOString(),
        pictures: [],
        currency_id: 1,
        attributes: combo.map((atV) => ({
          ...atV,
          label: atV.value,
          value: atV.id,
        })),
      })
    );

    setVariations(newVariations);
  };

  const handleVariationChange = (
    index: number,
    field: keyof ProductVariation,
    value: any
  ) => {
    setVariations((prev) => {
      return prev.map((variation, i) =>
        i === index ? { ...variation, [field]: value } : variation
      );
    });
  };

  const handleImageUpload = async (error, result, widget, index: number) => {
    if (error) {
      setError(error);
      widget.close({
        quiet: true,
      });
      return;
    }

    // Actualizar el estado con una imagen de carga
    setVariations((prev) => {
      const updatedVariation = { ...prev[index] };
      updatedVariation.pictures = [...updatedVariation.pictures, "loading"];
      return prev.map((v, i) => (i === index ? updatedVariation : v));
    });

    // Simular la subida de la imagen (reemplaza esto con tu lógica real de subida)
    const imageUrl = result;

    // Actualizar el estado con la URL real de la imagen
    setVariations((prev) => {
      const updatedVariation = { ...prev[index] };
      updatedVariation.pictures = updatedVariation.pictures.map((pic) =>
        pic === "loading" ? imageUrl : pic
      );
      return prev.map((v, i) => (i === index ? updatedVariation : v));
    });
  };

  const removeImage = (variationIndex: number, imageIndex: number) => {
    setVariations((prev) =>
      prev.map((variation, i) =>
        i === variationIndex
          ? {
              ...variation,
              pictures: variation.pictures.filter(
                (_, idx) => idx !== imageIndex
              ),
            }
          : variation
      )
    );
  };

  const handleGlobalCurrencyChange = (currencyId: string) => {
    const newCurrency = currencies.find((c) => c.id === Number(currencyId));
    if (newCurrency) {
      setSelectedCurrency(newCurrency);
      setVariations((prev) =>
        prev.map((variation) =>
          variation.currency_id === selectedCurrency?.id
            ? { ...variation, currency_id: newCurrency?.id }
            : variation
        )
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <VariationSelectionType
        value={variationSelectionType}
        setValue={setVariationSelectionType}
      />
      {variationSelectionType == "generate" ? (
        <>
          <h1 className="text-2xl font-bold mb-4">
            Generador de Variantes de Producto
          </h1>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              Seleccione los atributos del producto relavantes para el Cliente:
            </h2>
            {attributes.map((attribute) => (
              <div key={attribute.id} className="mb-4">
                <h3 className="text-lg font-medium mb-2">{attribute.name}</h3>
                <div className="flex flex-wrap gap-4">
                  {attribute.values.map((value) => (
                    <div key={value.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`attr-${attribute.id}-${value.id}`}
                        checked={
                          selectedAttributes[attribute.id]?.includes(
                            value.id
                          ) || false
                        }
                        onChange={(checked) =>
                          handleAttributeValueChange(
                            attribute.id,
                            value.id,
                            checked === true
                          )
                        }
                      />
                      <label
                        htmlFor={`attr-${attribute.id}-${value.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {value.value}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button type="button" onClick={generateVariations} className="mb-6">
            Generar Variaciones
          </Button>
        </>
      ) : (
        values.type !== "simple" && (
          <FormItem
            invalid={(errors.attributes && touched.attributes) as boolean}
            errorMessage={errors.attributes}
          >
            <Field name={`attributes`}>
              {({ field, form }) => (
                <AttributeSelect
                  attributes={attributes}
                  selectedIds={selectedIdsForAttributes}
                  setSelectedIds={setSelectedIdsForAttributes}
                  onSelectionChange={(selectedCategories) => {
                    form.setFieldValue(
                      field.name,
                      Array.from(selectedIdsForAttributes)
                    );
                    //handleVariationChange(index, "attributes", selectedCategories);
                  }}
                />
              )}
            </Field>
          </FormItem>
        )
      )}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Seleccione la moneda para todos las variaciones:
        </h2>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedCurrency?.id || ""}
          onChange={(e) => handleGlobalCurrencyChange(e.target.value)}
        >
          <option value="">Seleccione una moneda</option>
          {currencies.map((currency) => (
            <option key={currency.id} value={currency.id}>
              {currency.name}
            </option>
          ))}
        </select>
      </div>
      {variations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Variaciones Generadas:</h2>
          <div className="grid grid-cols-1 gap-4">
            {variations.map((variation, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <Input
                    value={variation.name}
                    onChange={(e) =>
                      handleVariationChange(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio
                    </label>
                    <Input
                      type="number"
                      value={variation.price}
                      onChange={(e) =>
                        handleVariationChange(
                          index,
                          "price",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  {values.origin == "imported" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Inventario
                      </label>
                      <Input
                        type="number"
                        value={variation.stock}
                        onChange={(e) =>
                          handleVariationChange(
                            index,
                            "stock",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moneda
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={variation.currency_id}
                      onChange={(e) =>
                        handleVariationChange(
                          index,
                          "currency_id",
                          currencies.find(
                            (c) => c.id === Number(e.target.value)
                          ).id
                        )
                      }
                    >
                      {currencies.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imágenes
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {variation.pictures.map((pic, picIndex) => (
                      <div key={picIndex} className="relative">
                        {pic === "loading" ? (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <img
                              src={pic}
                              alt={`Variation ${index + 1}`}
                              className="w-16 h-16 object-cover rounded"
                              onClick={() => onViewOpen(pic)}
                            />
                            <button
                              onClick={() => removeImage(index, picIndex)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                              aria-label="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    <UploadWidget
                      onUpload={(error, result, widget) => {
                        const img = result?.info?.secure_url;
                        handleImageUpload(error, img, widget, index);
                      }}
                    >
                      {({ open }) => {
                        function handleOnClick(e) {
                          e.preventDefault();
                          open();
                        }
                        return (
                          <label className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded cursor-pointer">
                            <button onClick={handleOnClick}>
                              <span className="text-4xl text-gray-500">+</span>
                            </button>
                          </label>
                        );
                      }}
                    </UploadWidget>
                    <Button
                      type="button"
                      onClick={() => {
                        setIsGalleryDialogOpen(true);
                        setVariationIndex(index);
                      }}
                    >
                      <FolderPlus />
                    </Button>
                  </div>
                </div>

                {values.origin == "manufactured" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insumos
                    </label>
                    <Select
                      isMulti
                      name={`supplies-${index}`}
                      placeholder="Seleccione insumos"
                      value={variation?.supply_variation}
                      options={supplies
                        .map(({ supply_variation, value }) => {
                          const data = supply_variation
                            .filter(
                              (variation) =>
                                values.supplies.includes(value) &&
                                variation.supply_id === value
                            )
                            .map((filteredVariation) => ({
                              ...filteredVariation,
                              label: filteredVariation.description,
                              value: filteredVariation.id,
                            }))
                            .flat();
                          return data;
                        })
                        .flat()}
                      onChange={(option) => {
                        handleVariationChange(
                          index,
                          "supply_variations",
                          option.map((op) => (op.id ? op.id : op))
                        );

                        handleVariationChange(
                          index,
                          "supply_variation",
                          option
                        );
                      }}
                    />
                  </div>
                )}

                <AttributeSelect
                  attributes={attributes
                    .map((at) => {
                      const data = at.values
                        .filter((value) =>
                          Array.from(selectedIdsForAttributes).includes(at.id)
                        )
                        .map((filteredVariation) => ({
                          ...filteredVariation,
                          label: filteredVariation.value,
                          name: filteredVariation.value,
                          value: filteredVariation.id,
                        }))
                        .flat();
                      return data;
                    })
                    .flat()}
                  selectedIds={new Set(variation.attributes)}
                  setSelectedIds={setSelectedIdsForAttributeValues}
                  onSelectionChange={(selectedCategories) => {
                    handleVariationChange(
                      index,
                      "attributes",
                      selectedCategories
                    );
                  }}
                />

                <div className="flex mt-5 justify-center text-center">
                  <Checkbox
                    checked={variation.enabled}
                    onChange={(isEnabled) =>
                      handleVariationChange(index, "enabled", isEnabled)
                    }
                    className="!text-sm"
                    name="hasDelivery"
                  />
                  <Label className="text-sm">Visible</Label>
                </div>

                <Button
                  className="mt-5"
                  type="button"
                  variant="default"
                  onClick={() => {
                    setVariations((preVariation) =>
                      preVariation.filter((_, i) => i !== index)
                    );
                  }}
                >
                  Eliminar Variación
                </Button>
                <Dialog
                  isOpen={isGalleryDialogOpen}
                  onClose={() => setIsGalleryDialogOpen(false)}
                >
                  <div className="max-w-4xl max-h-[80vh] flex flex-col">
                    <div>
                      <div>
                        {selectedGallery
                          ? `Imágenes de ${selectedGallery.name}`
                          : "Seleccionar Galería"}
                      </div>
                    </div>
                    <div className="flex-grow overflow-auto">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : !selectedGallery ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                          {galleries.map((gallery) => (
                            <Button
                              key={gallery.id}
                              type="button"
                              variant="plain"
                              onClick={() => handleSelectGallery(gallery)}
                              className="h-24 flex flex-col items-center justify-center text-center"
                            >
                              <span className="font-semibold">
                                {gallery.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                Seleccionar
                              </span>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map((image, imageIndex) => {
                              const onClickImage = () => {
                                console.log("INDEX", variationIndex);
                                handleSelectImage(image, variationIndex);
                              };
                              return (
                                <div
                                  key={image.id}
                                  className={`relative cursor-pointer border-2 ${
                                    selectedImages.find(
                                      (img) => img.id === image.id
                                    )
                                      ? "border-blue-500"
                                      : "border-transparent"
                                  }`}
                                  onClick={onClickImage}
                                >
                                  <img
                                    src={image.url}
                                    alt={image.title}
                                    className="w-full h-24 object-cover"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedGallery && (
                      <div className="mt-4 flex justify-between">
                        <Button
                          type="button"
                          onClick={() => setSelectedGallery(null)}
                        >
                          Volver a Galerías
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setIsGalleryDialogOpen(false)}
                        >
                          Confirmar Selección
                        </Button>
                      </div>
                    )}
                  </div>
                </Dialog>
              </div>
            ))}
          </div>
        </div>
      )}{" "}
      <Dialog
        isOpen={viewOpen}
        onClose={onDialogClose}
        onRequestClose={onDialogClose}
      >
        <img className="w-full" src={selectedImg} alt={"img"} />
      </Dialog>
      <div>
        <Button
          className="mt-5"
          variant="default"
          type="button"
          onClick={() => {
            setVariations((preVariation) => [
              ...preVariation,
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
          }}
        >
          Añadir Variación
        </Button>
      </div>
    </div>
  );
}
