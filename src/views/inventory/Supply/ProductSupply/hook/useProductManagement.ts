import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/Supabase/AttributeService';
import { Product } from '@/@types/products';


const useProductManagement = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const fetchedProducts = await supabaseService.getProductsWithVariationsAndSupplies();
                setProducts(fetchedProducts);
            } catch (err) {
                setError('Error fetching products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProductId !== null) {
            const product = products.find(p => p.id === selectedProductId) || null;
            setSelectedProduct(product);
        }
    }, [selectedProductId, products]);

    return {
        products,
        selectedProductId,
        setSelectedProductId,
        selectedProduct,
        loading,
        error
    };
};

export default useProductManagement;