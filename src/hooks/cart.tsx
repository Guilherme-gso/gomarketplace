import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const storageProjects = '@GoMarkeplace:products';

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsInStorage = await AsyncStorage.getItem(storageProjects);

      if (productsInStorage) {
        setProducts(JSON.parse(productsInStorage));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const currentProduct = products.filter(product => {
        return product.id === id;
      });

      const newProducts = currentProduct.map(newProduct => {
        return { ...newProduct, quantity: newProduct.quantity + 1 };
      });

      setProducts(newProducts);
      await AsyncStorage.setItem(storageProjects, JSON.stringify(newProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const currentProduct = products.filter(product => {
        return product.id === id;
      });

      const newProducts = currentProduct.map(newProduct => {
        return { ...newProduct, quantity: newProduct.quantity - 1 };
      });

      setProducts(newProducts);
      await AsyncStorage.setItem(storageProjects, JSON.stringify(newProducts));
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      // TODO ADD A NEW ITEM TO THE CART
      const productExists = products.findIndex(item => item.id === product.id);

      if (productExists > -1) {
        increment(product.id);
      }

      const newProduct = { ...product, quantity: 1 };

      setProducts([...products, newProduct]);

      await AsyncStorage.setItem(
        storageProjects,
        JSON.stringify([...products, newProduct]),
      );
    },
    [products, increment],
  );

  const value = useMemo(() => ({ addToCart, increment, decrement, products }), [
    products,
    addToCart,
    increment,
    decrement,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
