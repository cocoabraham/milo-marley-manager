'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  active: boolean;
  description: string;
  photo: string;
};

type NewProduct = Omit<Product, 'id'>;

type ProductsContextType = {
  products: Product[];
  addProduct: (product: NewProduct) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
};

const ProductsContext =
  createContext<ProductsContextType | undefined>(
    undefined
  );

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Chicken Feet',
    sku: 'MM-CF-10',
    category: 'Dehydrated Treats',
    price: 12.99,
    active: true,
    description: 'Dehydrated chicken feet.',
    photo: '',
  },
];

export function ProductsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [products, setProducts] =
    useState<Product[]>(initialProducts);

  const addProduct = (product: NewProduct) => {
    const newProduct: Product = {
      id: Date.now(),
      ...product,
    };

    setProducts((currentProducts) => [
      newProduct,
      ...currentProducts,
    ]);
  };

  const updateProduct = (
    updatedProduct: Product
  ) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === updatedProduct.id
          ? updatedProduct
          : product
      )
    );
  };

  const deleteProduct = (id: number) => {
    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) => product.id !== id
      )
    );
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error(
      'useProducts must be used inside ProductsProvider'
    );
  }

  return context;
}