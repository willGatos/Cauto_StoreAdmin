import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui";
import supabase from "@/services/Supabase/BaseClient";
import { useAppSelector } from "@/store";
const { TBody, THead, Td, Tr, Th } = Table;
interface Offer {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  products: OfferProduct[];
}

interface OfferProduct {
  id: number;
  name: string;
  variations: OfferProductVariation[];
}

interface OfferProductVariation {
  id: number;
  name: string;
  offerPrice: number;
  currency: string;
}

// Mock data service
const mockDataService = {
  getOffers: async (shopId): Promise<Offer[]> => {
    const { data, error } = await supabase
      .from("offers")
      .select(
        `
            id,
            name,
            description,
            start_date,
            end_date,
            products:offer_products (
              id,
              product:products (
                id,
                name
              ),
              variations:offer_product_variations (
                id,
                variation:product_variations (
                  id,
                  name
                ),
                offer_price,
                currency:currency (
                  name,
                  exchange_rate
                )
              )
            )
          `
      )
      .order("start_date", { ascending: false })
      .eq("shop_id", shopId);

    if (error) {
      console.error("Error fetching offers:", error);
      return [];
    }

    //Simple

    return data.map((offer) => ({
      ...offer,
      startDate: offer.start_date,
      endDate: offer.end_date,
      products: offer.products.map((p) => ({
        id: p.product.id,
        name: p.product.name,
        variations: p.variations.map((v) => ({
          id: v.variation.id,
          name: v.variation.name,
          offerPrice: v.offer_price,
          currency: v.currency.name,
        })),
      })),
    }));
  },
  deleteOffer: async (id: number): Promise<void> => {
    const { error } = await supabase.from("offers").delete().eq("id", id);

    if (error) {
      console.error("Error deleting offer:", error);
    }
  },
};

export default function OfferTable() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [expandedOffers, setExpandedOffers] = useState<Record<number, boolean>>(
    {}
  );
  
  const [loading, setLoading] = useState(true);
  const { shopId, authority, email } = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    console.log("HOLA", authority, shopId, email);
   //fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    const fetchedOffers = await mockDataService.getOffers(shopId);
    setOffers(fetchedOffers);
    setLoading(false);
  };

  const toggleOfferExpansion = (offerId: number) => {
    setExpandedOffers((prev) => ({ ...prev, [offerId]: !prev[offerId] }));
  };

  const handleEdit = (offerId: number) => {
    // Implement edit functionality (e.g., navigate to edit page)
    console.log(`Edit offer with id ${offerId}`);
  };

  const handleDelete = async (offerId: number) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      await mockDataService.deleteOffer(offerId);
      fetchOffers(); // Refresh the list after deletion
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <THead>
        <Tr>
          <Th className="w-[50px]"></Th>
          <Th>Name</Th>
          <Th>Start Date</Th>
          <Th>End Date</Th>
          <Th className="text-right">Actions</Th>
        </Tr>
      </THead>
      <TBody>
        {offers.map((offer) => (
          <React.Fragment key={offer.id}>
            <Tr>
              <Td>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => toggleOfferExpansion(offer.id)}
                >
                  {expandedOffers[offer.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </Td>
              <Td>{offer.name}</Td>
              <Td>{offer.startDate}</Td>
              <Td>{offer.endDate}</Td>
              <Td className="text-right">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleEdit(offer.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDelete(offer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Td>
            </Tr>
            {expandedOffers[offer.id] && (
              <Tr>
                <Td colSpan={5}>
                  <div className="p-4 bg-gray-50">
                    <h4 className="font-semibold mb-2">Products:</h4>
                    {offer.products.map((product) => (
                      <div key={product.id} className="mb-4">
                        <h5 className="font-medium">{product.name}</h5>
                        <ul className="list-disc list-inside">
                          {product.variations.map((variation) => (
                            <li key={variation.id}>
                              {variation.name}: {variation.offerPrice}{" "}
                              {variation.currency}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Td>
              </Tr>
            )}
          </React.Fragment>
        ))}
      </TBody>
    </Table>
  );
}
