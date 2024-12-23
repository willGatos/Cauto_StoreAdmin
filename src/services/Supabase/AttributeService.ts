import { Supply } from "@/views/inventory/Supply/List/Data/types";
import supabase from "./BaseClient";
import { Attribute, Category } from "@/@types/category";
import { Currency } from "@/@types/currency";
import {  } from "@/@types/orders";
import { Product, ProductVariation } from "@/@types/products";
// Supabase service
export const supabaseService = {
  getProductsWithVariationsAndSupplies: async () => {
    if (!supabase) {
      throw new Error("Supabase client is not initialized");
    }

    // Obtener productos
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("id");

    if (productsError) throw productsError;

    // Obtener variaciones de productos
    const { data: productVariations, error: variationsError } = await supabase
      .from("product_variations")
      .select("*")
      .order("id");

    if (variationsError) throw variationsError;

    // Obtener suministros
    const { data: supplies, error: suppliesError } = await supabase
      .from("supplies")
      .select("*")
      .order("id");

    if (suppliesError) throw suppliesError;

    // Obtener variaciones de suministros
    const { data: supplyVariations, error: supplyVariationsError } =
      await supabase.from("supply_variation").select("*").order("id");

    if (supplyVariationsError) throw supplyVariationsError;

    // Obtener asociaciones de suministros a productos
    const { data: productSupplies, error: productSuppliesError } =
      await supabase.from("product_supplies").select("*");

    if (productSuppliesError) throw productSuppliesError;

    // Obtener asociaciones de variaciones de suministros a variaciones de productos
    const {
      data: supplyVariationProductVariations,
      error: supplyVariationProductVariationsError,
    } = await supabase.from("supply_variation_product_variations").select("*");

    if (supplyVariationProductVariationsError)
      throw supplyVariationProductVariationsError;

    // Procesar datos
    const productsWithVariations = products.map((product) => {
      const variations = productVariations.filter(
        (v) => v.product_id === product.id
      );

      const variationsWithSupplies = variations.map((variation) => {
        const supplyIds = supplyVariationProductVariations
          .filter((vs) => vs.product_variation_id === variation.id)
          .map((vs) => vs.supply_id);

        const suppliesForVariation = supplyVariations
          .filter((supplyVariation) => supplyIds.includes(supplyVariation.id))
          .map((supplyVariation) => ({
            ...supplyVariation,
            supply:
              supplies.find(
                (supply) => supply.id === supplyVariation.supply_id
              ) || null,
          }));

        return {
          ...variation,
          supplies: suppliesForVariation,
        };
      });

      const productSuppliesForProduct = productSupplies
        .filter((ps) => ps.product_id === product.id)
        .map(
          (ps) => supplies.find((supply) => supply.id === ps.supply_id) || null
        )
        .filter((supply) => supply !== null) as Supply[];

      return {
        ...product,
        variations: variationsWithSupplies,
        supplies: productSuppliesForProduct,
      };
    });

    return productsWithVariations;
  },
  getAttributes: async (shopId): Promise<Attribute[]> => {
    const { data, error: valuesError } = await supabase
      .from("attributes")
      .select("id, name, values:attribute_values(id, value)")
      .eq("shop_id", shopId);
    if (valuesError) throw valuesError;
    if (valuesError) {
      console.error("Error fetching attribute values:", valuesError);
      return [];
    }
    return data;
  },
  getCategories: async (): Promise<Category[]> => {
    if (!supabase) {
      console.error("Supabase client is not initialized");
      return [];
    }
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    // Organize categories into a tree structure
    const categoryMap = new Map<number, Category>();
    data?.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    const rootCategories: Category[] = [];
    categoryMap.forEach((category) => {
      if (category.parent_id === null) {
        rootCategories.push(category);
      } else {
        const parent = categoryMap.get(category.parent_id);
        parent?.children?.push(category);
      }
    });
    return rootCategories;
  },
  getSupplies: async (shopId): Promise<Supply[]> => {
    const { data: supplies, error: suppliesError } = await supabase
      .from("supplies")
      .select(
        `
          id,
          name,
          type,
          supply_variation(*,           
          currency: currency_id(name))
          `
      )
      .eq("shop_id", shopId);

    if (suppliesError) {
      console.error("Error fetching supplies:", suppliesError);
      return [];
    }

    return supplies;
  },
  getCurrencies: async (): Promise<Currency[]> => {
    const { data, error } = await supabase
      .from("currency")
      .select("*")
      .order("id");

    if (error) {
      console.error("Error fetching currencies:", error);
      return [];
    }

    return data || [];
  },
  updateCurrency: async (
    id: number,
    exchange_rate: number
  ): Promise<Currency> => {
    const { data, error } = await supabase
      .from("currency")
      .update({ exchange_rate })
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error updating currency:", error);
      throw error;
    }

    return data;
  },
  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items (
          id,
          quantity,
          price,
          variation:product_variations (
            id,
            name,
            price,
            currency:currencies (*),
            supplies:supply_variation (
              id,
              cost,
              currency:currencies (*),
              description,
              measure
            )
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return data || [];
  },
  saveAttribute: async (attribute, isEdit = false) => {
    const { id, name, value, shop_id } = attribute;
    if (isEdit) {
      const { data, error } = await supabase
        .from("attributes")
        .update({ name, shop_id })
        .eq("id", id);

      if (error) throw new Error(error.message);

      for (let val of value) {
        const { error } = await supabase.from("attribute_values").upsert({
          type: id,
          value: val.value,
        });

        if (error) throw new Error(error.message);
      }
      return data;
    } else {
      const { data, error } = await supabase
        .from("attributes")
        .insert({ name, shop_id });

      if (error) throw new Error(error.message);

      const attributeId = data[0].id;

      for (let val of value) {
        const { error } = await supabase.from("attribute_values").insert({
          type: attributeId,
          value: val.value,
        });

        if (error) throw new Error(error.message);
      }
      return data;
    }
  },
  saveCategory: async (category, isEdit = false) => {
    const { id, name, description, parent_id, shop_id } = category;
    if (isEdit) {
      const { data, error } = await supabase
        .from("categories")
        .update({ name, description, parent_id, shop_id })
        .eq("id", id);

      if (error) throw new Error(error.message);

      return data;
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name, description, parent_id, shop_id });

      if (error) throw new Error(error.message);

      return data;
    }
  },
  getAllSupplies: async (): Promise<Supply[]> => {
    const { data: supplies, error: suppliesError } = await supabase
      .from("supplies")
      .select("*");

    if (suppliesError) {
      console.error("Error fetching supplies:", suppliesError);
      return [];
    }

    return supplies;
  },
  getSupplyVariationsBySupplies: async (
    supplyIds: number[]
  ): Promise => {
    const { data: supplyVariations, error: variationsError } = await supabase
      .from("supply_variation")
      .select("*")
      .in("supply_id", supplyIds);

    if (variationsError) {
      console.error("Error fetching supply variations:", variationsError);
      return [];
    }

    return supplyVariations;
  },
};
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*, category(*), currency(*), variations(*)");
  if (error) throw error;
  return data;
};

export const getProductVariations = async (): Promise<ProductVariation[]> => {
  const { data, error } = await supabase
    .from("product_variations")
    .select("*, currency(*), attributes(*), supplies(*)");
  if (error) throw error;
  return data;
};

export const getSupplies = async (): Promise<Supply[]> => {
  const { data, error } = await supabase
    .from("supplies")
    .select("*, variations(*)");
  if (error) throw error;
  return data;
};

export const updateProductSupplyAssociation = async (
  productId: number,
  supplyId: number,
  isAssociated: boolean
) => {
  const { error } = await supabase.from("product_supplies").upsert({
    product_id: productId,
    supply_id: supplyId,
    is_associated: isAssociated,
  });
  if (error) throw error;
};

export const updateVariationSupplyAssociation = async (
  variationId: number,
  supplyId: number,
  isAssociated: boolean
) => {
  const { error } = await supabase.from("variation_supplies").upsert({
    variation_id: variationId,
    supply_id: supplyId,
    is_associated: isAssociated,
  });
  if (error) throw error;
};
// Supabase data service
// const supabaseDataService = {

// };

// Obtener productos de la tienda
export async function getProductsByShop(shopId: number) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shopId);

  if (error) throw error;
  return data;
}

// Obtener suministros de la tienda
export async function getSuppliesByShop(shopId: number) {
  const { data, error } = await supabase
    .from("supplies")
    .select("*")
    .eq("shop_id", shopId);

  if (error) throw error;
  return data;
}

// Obtener asociaciones productos-suministros de la tienda
export async function getProductSuppliesByShop(shopId: number) {
  const { data, error } = await supabase
    .from("product_supplies")
    .select("*")
    .eq("shop_id", shopId);

  if (error) throw error;
  return data;
}

// Crear asociación producto-suministro
export async function createProductSupply(
  productId: number,
  supplyId: number,
  requiredSupplies: number,
  shopId: number
) {
  const { data, error } = await supabase.from("product_supplies").insert([
    {
      product_id: productId,
      supply_id: supplyId,
      required_supplies: requiredSupplies,
      shop_id: shopId,
    },
  ]);

  if (error) throw error;
  return data;
}

// Eliminar asociación producto-suministro
export async function deleteProductSupply(productId: number, supplyId: number) {
  const { data, error } = await supabase
    .from("product_supplies")
    .delete()
    .match({ product_id: productId, supply_id: supplyId });

  if (error) throw error;
  return data;
}
