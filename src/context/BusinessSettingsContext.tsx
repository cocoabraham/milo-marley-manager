'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type Currency =
  | 'USD'
  | 'MXN'
  | 'CAD'
  | 'EUR';

export type MeasurementSystem =
  | 'us'
  | 'metric';

export type DefaultUserRole =
  | 'Admin'
  | 'Manager'
  | 'Employee'
  | 'Viewer';

export type BusinessSettings = {
  businessName: string;
  businessEmail: string;
  phone: string;

  currency: Currency;
  defaultTaxRate: number;
  pricesIncludeTax: boolean;

  measurementSystem:
    MeasurementSystem;

  defaultNewUserRole:
    DefaultUserRole;
};

type BusinessSettingsContextType = {
  settings: BusinessSettings;

  updateSettings: (
    settings: BusinessSettings
  ) => void;
};

const defaultSettings: BusinessSettings =
  {
    businessName:
      'Milo + Marley',

    businessEmail: '',

    phone: '',

    currency: 'USD',

    defaultTaxRate: 0,

    pricesIncludeTax:
      false,

    measurementSystem:
      'us',

    defaultNewUserRole:
      'Employee',
  };

const BusinessSettingsContext =
  createContext<
    | BusinessSettingsContextType
    | undefined
  >(undefined);

export function BusinessSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    settings,
    setSettings,
  ] =
    useState<BusinessSettings>(
      defaultSettings
    );

  const updateSettings = (
    newSettings:
      BusinessSettings
  ) => {
    setSettings(
      newSettings
    );
  };

  return (
    <BusinessSettingsContext.Provider
      value={{
        settings,
        updateSettings,
      }}
    >
      {children}
    </BusinessSettingsContext.Provider>
  );
}

export function useBusinessSettings() {
  const context =
    useContext(
      BusinessSettingsContext
    );

  if (!context) {
    throw new Error(
      'useBusinessSettings must be used inside BusinessSettingsProvider'
    );
  }

  return context;
}