'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type PaymentMethod = {
  id: number;
  name: string;
  active: boolean;
};

type NewPaymentMethod = Omit<
  PaymentMethod,
  'id'
>;

type PaymentMethodsContextType = {
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (
    method: NewPaymentMethod
  ) => void;
  updatePaymentMethod: (
    method: PaymentMethod
  ) => void;
  deletePaymentMethod: (
    id: number
  ) => void;
};

const PaymentMethodsContext =
  createContext<
    PaymentMethodsContextType | undefined
  >(undefined);

const initialPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    name: 'Cash',
    active: true,
  },
  {
    id: 2,
    name: 'Credit Card',
    active: true,
  },
  {
    id: 3,
    name: 'Debit Card',
    active: true,
  },
  {
    id: 4,
    name: 'Zelle',
    active: true,
  },
  {
    id: 5,
    name: 'Venmo',
    active: true,
  },
  {
    id: 6,
    name: 'PayPal',
    active: true,
  },
  {
    id: 7,
    name: 'Bank Transfer',
    active: true,
  },
  {
    id: 8,
    name: 'Other',
    active: true,
  },
];

export function PaymentMethodsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    paymentMethods,
    setPaymentMethods,
  ] = useState<PaymentMethod[]>(
    initialPaymentMethods
  );

  const addPaymentMethod = (
    method: NewPaymentMethod
  ) => {
    const newMethod: PaymentMethod = {
      id: Date.now(),
      ...method,
    };

    setPaymentMethods(
      (currentMethods) => [
        ...currentMethods,
        newMethod,
      ]
    );
  };

  const updatePaymentMethod = (
    updatedMethod: PaymentMethod
  ) => {
    setPaymentMethods(
      (currentMethods) =>
        currentMethods.map(
          (method) =>
            method.id ===
            updatedMethod.id
              ? updatedMethod
              : method
        )
    );
  };

  const deletePaymentMethod = (
    id: number
  ) => {
    setPaymentMethods(
      (currentMethods) =>
        currentMethods.filter(
          (method) =>
            method.id !== id
        )
    );
  };

  return (
    <PaymentMethodsContext.Provider
      value={{
        paymentMethods,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
      }}
    >
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods() {
  const context =
    useContext(
      PaymentMethodsContext
    );

  if (!context) {
    throw new Error(
      'usePaymentMethods must be used inside PaymentMethodsProvider'
    );
  }

  return context;
}