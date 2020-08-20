import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
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
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsInStorage = await AsyncStorage.getItem('@GoMarketplace');

      if (productsInStorage) {
        setProducts(JSON.parse(productsInStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let productFormmated: Product[] = [];

      const productExists = products.find(
        productItem => productItem.id === product.id,
      );

      if (productExists) {
        productExists.quantity += 1;

        productFormmated = products.map(productItem =>
          productItem.id === productExists.id ? productExists : productItem,
        );
      } else {
        productFormmated = [
          ...products,
          {
            ...product,
            quantity: 1,
          },
        ];
      }

      setProducts(productFormmated);

      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex === -1) {
        throw new Error('Id incorret');
      }

      const productFound = products[productIndex];

      productFound.quantity += 1;

      setProducts(
        products.map(product =>
          product.id === productFound.id ? productFound : product,
        ),
      );

      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex === -1) {
        throw new Error('Id incorret');
      }

      const productFound = products[productIndex];

      productFound.quantity -= 1;

      setProducts(
        products.map(product =>
          product.id === productFound.id ? productFound : product,
        ),
      );

      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

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
