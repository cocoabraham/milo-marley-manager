'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type ExpenseSource =
  | 'manual'
  | 'import';

export type Expense = {
  id: number;

  date: string;
  category: string;
  vendor: string;
  description: string;
  amount: number;
  paymentMethod: string;
  recurring: boolean;
  notes: string;
  receiptName: string;

  ingredientName: string;
  measurementType: string;
  quantityPurchased: number;
  measurementUnit: string;
  costPerUnit: number;

  source: ExpenseSource;
};

export type NewExpense =
  Omit<Expense, 'id'>;

type ExpensesContextType = {
  expenses: Expense[];

  addExpense: (
    expense: NewExpense
  ) => void;

  addExpenses: (
    expenses: NewExpense[]
  ) => void;

  updateExpense: (
    expense: Expense
  ) => void;

  deleteExpense: (
    id: number
  ) => void;
};

const ExpensesContext =
  createContext<
    ExpensesContextType | undefined
  >(undefined);

export function ExpensesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    expenses,
    setExpenses,
  ] = useState<Expense[]>([]);

  const addExpense = (
    expense: NewExpense
  ) => {
    const newExpense: Expense = {
      id: Date.now(),
      ...expense,
    };

    setExpenses(
      (currentExpenses) => [
        newExpense,
        ...currentExpenses,
      ]
    );
  };

  const addExpenses = (
    expensesToAdd:
      NewExpense[]
  ) => {
    const now =
      Date.now();

    const newExpenses:
      Expense[] =
        expensesToAdd.map(
          (
            expense,
            index
          ) => ({
            id:
              now +
              index,

            ...expense,
          })
        );

    setExpenses(
      (currentExpenses) => [
        ...newExpenses,
        ...currentExpenses,
      ]
    );
  };

  const updateExpense = (
    updatedExpense: Expense
  ) => {
    setExpenses(
      (currentExpenses) =>
        currentExpenses.map(
          (expense) =>
            expense.id ===
            updatedExpense.id
              ? updatedExpense
              : expense
        )
    );
  };

  const deleteExpense = (
    id: number
  ) => {
    setExpenses(
      (currentExpenses) =>
        currentExpenses.filter(
          (expense) =>
            expense.id !== id
        )
    );
  };

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        addExpense,
        addExpenses,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context =
    useContext(
      ExpensesContext
    );

  if (!context) {
    throw new Error(
      'useExpenses must be used inside ExpensesProvider'
    );
  }

  return context;
}