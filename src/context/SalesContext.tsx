'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import {
  useSalesSessions,
} from '@/context/SalesSessionsContext';

export type Sale = {
  id: number;
  sessionId: number;
  date: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  paymentMethod: string;
  customer: string;
  notes: string;
};

export type NewSale =
  Omit<
    Sale,
    'id' | 'sessionId'
  >;

type SalesContextType = {
  sales: Sale[];

  addSale: (
    sale: NewSale
  ) => void;

  deleteSale: (
    id: number
  ) => void;
};

const SalesContext =
  createContext<
    SalesContextType | undefined
  >(undefined);

export function SalesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    activeSession,
  } = useSalesSessions();

  const [
    sales,
    setSales,
  ] = useState<Sale[]>([]);

  const addSale = (
    sale: NewSale
  ) => {
    if (!activeSession) {
      throw new Error(
        'Cannot add a sale without an active sales session.'
      );
    }

    const newSale: Sale = {
      id: Date.now(),
      sessionId:
        activeSession.id,
      ...sale,
    };

    setSales(
      (currentSales) => [
        newSale,
        ...currentSales,
      ]
    );
  };

  const deleteSale = (
    id: number
  ) => {
    setSales(
      (currentSales) =>
        currentSales.filter(
          (sale) =>
            sale.id !== id
        )
    );
  };

  return (
    <SalesContext.Provider
      value={{
        sales,
        addSale,
        deleteSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context =
    useContext(
      SalesContext
    );

  if (!context) {
    throw new Error(
      'useSales must be used inside SalesProvider'
    );
  }

  return context;
}