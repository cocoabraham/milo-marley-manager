import type {
  Metadata,
} from 'next';

import {
  AppRouterCacheProvider,
} from '@mui/material-nextjs/v15-appRouter';

import {
  ThemeProvider,
} from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';

import theme from '@/theme/theme';

import {
  ProductsProvider,
} from '@/context/ProductsContext';

import {
  PaymentMethodsProvider,
} from '@/context/PaymentMethodsContext';

import {
  BusinessSettingsProvider,
} from '@/context/BusinessSettingsContext';

import {
  SalesProvider,
} from '@/context/SalesContext';

import {
  ExpensesProvider,
} from '@/context/ExpensesContext';

export const metadata:
  Metadata = {
  title: 'Milo + Marley',

  description:
    'Milo + Marley Business Manager',
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider
            theme={theme}
          >
            <CssBaseline />

            <BusinessSettingsProvider>
              <ProductsProvider>
                <PaymentMethodsProvider>
                  <SalesProvider>
                    <ExpensesProvider>
                      {children}
                    </ExpensesProvider>
                  </SalesProvider>
                </PaymentMethodsProvider>
              </ProductsProvider>
            </BusinessSettingsProvider>

          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}