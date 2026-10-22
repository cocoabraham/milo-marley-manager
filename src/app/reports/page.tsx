'use client';

import {
  useEffect,
  useMemo,
  useState,
  type SyntheticEvent,
} from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import AppShell from '@/components/AppShell';

import {
  useSales,
} from '@/context/SalesContext';

import {
  useSalesSessions,
} from '@/context/SalesSessionsContext';

import {
  useExpenses,
  type Expense,
} from '@/context/ExpensesContext';

import {
  useProducts,
} from '@/context/ProductsContext';

type ReportTab =
  | 'sales'
  | 'expenses'
  | 'profit-loss'
  | 'products';

type DateRange =
  | 'this-month'
  | 'last-month'
  | 'this-year'
  | 'all-time'
  | 'custom';

type ExpenseGroup = {
  label: string;
  amount: number;
  count: number;
};

type MonthlyExpenseGroup = {
  key: string;
  label: string;
  amount: number;
  count: number;
};

type PaymentSummary = {
  label: string;
  revenue: number;
  transactions: number;
};

type SessionReportRow = {
  id: number;
  openedAt: string;
  closedAt: string | null;
  transactions: number;
  itemsSold: number;
  revenue: number;
};

type ProductPerformanceRow = {
  key: string;
  productId: number | null;
  name: string;
  status:
    | 'Active'
    | 'Inactive'
    | 'Historical';
  currentPrice: number | null;
  transactions: number;
  unitsSold: number;
  revenue: number;
  averageUnitPrice: number;
};

const REPORT_ROWS_PER_PAGE = 10;

const parseLocalDate = (
  dateString: string
) => {
  if (!dateString) {
    return null;
  }

  const parts =
    dateString.split('-');

  if (parts.length !== 3) {
    return null;
  }

  const year =
    Number(parts[0]);

  const month =
    Number(parts[1]);

  const day =
    Number(parts[2]);

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  return new Date(
    year,
    month - 1,
    day
  );
};

const parseSessionDate = (
  dateString:
    | string
    | null
) => {
  if (!dateString) {
    return null;
  }

  const date =
    new Date(
      dateString
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
};

const startOfDay = (
  date: Date
) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0
  );
};

const endOfDay = (
  date: Date
) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
};

const formatExpenseDate = (
  dateString: string
) => {
  const date =
    parseLocalDate(
      dateString
    );

  if (!date) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  ).format(date);
};

const formatDateTime = (
  dateString:
    | string
    | null
) => {
  const date =
    parseSessionDate(
      dateString
    );

  if (!date) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
  ).format(date);
};

const formatCurrency = (
  amount: number
) => {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
    }
  ).format(amount);
};

const groupExpensesByField = (
  expenses: Expense[],
  getLabel: (
    expense: Expense
  ) => string
): ExpenseGroup[] => {
  const groups =
    new Map<
      string,
      {
        amount: number;
        count: number;
      }
    >();

  expenses.forEach(
    (expense) => {
      const rawLabel =
        getLabel(
          expense
        ).trim();

      const label =
        rawLabel ||
        'Unknown';

      const existing =
        groups.get(
          label
        ) ?? {
          amount: 0,
          count: 0,
        };

      groups.set(
        label,
        {
          amount:
            existing.amount +
            expense.amount,

          count:
            existing.count +
            1,
        }
      );
    }
  );

  return Array.from(
    groups.entries()
  )
    .map(
      ([
        label,
        values,
      ]) => ({
        label,
        amount:
          values.amount,
        count:
          values.count,
      })
    )
    .sort(
      (a, b) =>
        b.amount -
        a.amount
    );
};

function SummaryCard({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <Card>
      <CardContent>
        <Typography
          variant="body2"
          sx={{
            color:
              'text.secondary',
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mt: 0.5,
            fontWeight: 700,
            color:
              'primary.main',
          }}
        >
          {value}
        </Typography>

        {secondary && (
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color:
                'text.secondary',
            }}
          >
            {secondary}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const {
    sales,
  } = useSales();

  const {
    sessions,
  } = useSalesSessions();

  const {
    expenses,
  } = useExpenses();

  const {
    products,
  } = useProducts();

  /*
   * REPORT NAVIGATION
   */
  const [
    activeTab,
    setActiveTab,
  ] = useState<ReportTab>(
    'sales'
  );

  /*
   * DATE RANGE
   */
  const [
    dateRange,
    setDateRange,
  ] = useState<DateRange>(
    'this-month'
  );

  const [
    customStartDate,
    setCustomStartDate,
  ] = useState('');

  const [
    customEndDate,
    setCustomEndDate,
  ] = useState('');

  /*
   * PAGINATION
   */
  const [
    salesSessionPage,
    setSalesSessionPage,
  ] = useState(0);

  const [
    expensePage,
    setExpensePage,
  ] = useState(0);

  const [
    productPage,
    setProductPage,
  ] = useState(0);

  /*
   * UNDATED EXPENSE WARNING
   */
  const [
    undatedDialogOpen,
    setUndatedDialogOpen,
  ] = useState(false);

  const [
    warningContext,
    setWarningContext,
  ] = useState<
    'expenses' | 'profit-loss'
  >('expenses');

  const [
    expenseWarningShown,
    setExpenseWarningShown,
  ] = useState(false);

  const [
    profitLossWarningShown,
    setProfitLossWarningShown,
  ] = useState(false);

  const undatedExpenses =
    useMemo(() => {
      return expenses.filter(
        (expense) =>
          !expense.date ||
          !parseLocalDate(
            expense.date
          )
      );
    }, [expenses]);

  const handleTabChange = (
    _event: SyntheticEvent,
    newValue: ReportTab
  ) => {
    setActiveTab(
      newValue
    );

    if (
      undatedExpenses.length ===
      0
    ) {
      return;
    }

    if (
      newValue ===
        'expenses' &&
      !expenseWarningShown
    ) {
      setWarningContext(
        'expenses'
      );

      setUndatedDialogOpen(
        true
      );

      setExpenseWarningShown(
        true
      );
    }

    if (
      newValue ===
        'profit-loss' &&
      !profitLossWarningShown
    ) {
      setWarningContext(
        'profit-loss'
      );

      setUndatedDialogOpen(
        true
      );

      setProfitLossWarningShown(
        true
      );
    }
  };

  /*
   * DATE RANGE BOUNDARIES
   */
  const {
    rangeStart,
    rangeEnd,
  } = useMemo(() => {
    const now =
      new Date();

    if (
      dateRange ===
      'this-month'
    ) {
      return {
        rangeStart:
          new Date(
            now.getFullYear(),
            now.getMonth(),
            1
          ),

        rangeEnd:
          endOfDay(
            new Date(
              now.getFullYear(),
              now.getMonth() +
                1,
              0
            )
          ),
      };
    }

    if (
      dateRange ===
      'last-month'
    ) {
      return {
        rangeStart:
          new Date(
            now.getFullYear(),
            now.getMonth() -
              1,
            1
          ),

        rangeEnd:
          endOfDay(
            new Date(
              now.getFullYear(),
              now.getMonth(),
              0
            )
          ),
      };
    }

    if (
      dateRange ===
      'this-year'
    ) {
      return {
        rangeStart:
          new Date(
            now.getFullYear(),
            0,
            1
          ),

        rangeEnd:
          endOfDay(
            new Date(
              now.getFullYear(),
              11,
              31
            )
          ),
      };
    }

    if (
      dateRange ===
      'all-time'
    ) {
      return {
        rangeStart: null,
        rangeEnd: null,
      };
    }

    const customStart =
      parseLocalDate(
        customStartDate
      );

    const customEnd =
      parseLocalDate(
        customEndDate
      );

    return {
      rangeStart:
        customStart
          ? startOfDay(
              customStart
            )
          : null,

      rangeEnd:
        customEnd
          ? endOfDay(
              customEnd
            )
          : null,
    };
  }, [
    dateRange,
    customStartDate,
    customEndDate,
  ]);

  /*
   * SALES FILTER
   */
  const filteredSales =
    useMemo(() => {
      return sales.filter(
        (sale) => {
          const saleDate =
            parseLocalDate(
              sale.date
            );

          if (!saleDate) {
            return false;
          }

          if (
            rangeStart &&
            saleDate <
              rangeStart
          ) {
            return false;
          }

          if (
            rangeEnd &&
            saleDate >
              rangeEnd
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      sales,
      rangeStart,
      rangeEnd,
    ]);

  /*
   * CLOSED SALES SESSIONS
   */
  const filteredClosedSessions =
    useMemo(() => {
      return sessions
        .filter(
          (session) =>
            session.status ===
              'closed' &&
            session.closedAt
        )
        .filter(
          (session) => {
            const sessionDate =
              parseSessionDate(
                session.openedAt
              );

            if (!sessionDate) {
              return false;
            }

            if (
              rangeStart &&
              sessionDate <
                rangeStart
            ) {
              return false;
            }

            if (
              rangeEnd &&
              sessionDate >
                rangeEnd
            ) {
              return false;
            }

            return true;
          }
        )
        .sort(
          (a, b) => {
            const dateA =
              parseSessionDate(
                a.openedAt
              )?.getTime() ??
              0;

            const dateB =
              parseSessionDate(
                b.openedAt
              )?.getTime() ??
              0;

            return (
              dateB -
              dateA
            );
          }
        );
    }, [
      sessions,
      rangeStart,
      rangeEnd,
    ]);

  const sessionReportRows =
    useMemo<
      SessionReportRow[]
    >(() => {
      return filteredClosedSessions.map(
        (session) => {
          const sessionSales =
            sales.filter(
              (sale) =>
                sale.sessionId ===
                session.id
            );

          const transactions =
            sessionSales.length;

          const itemsSold =
            sessionSales.reduce(
              (
                total,
                sale
              ) =>
                total +
                sale.quantity,
              0
            );

          const revenue =
            sessionSales.reduce(
              (
                total,
                sale
              ) =>
                total +
                sale.quantity *
                  sale.unitPrice,
              0
            );

          return {
            id:
              session.id,

            openedAt:
              session.openedAt,

            closedAt:
              session.closedAt,

            transactions,

            itemsSold,

            revenue,
          };
        }
      );
    }, [
      filteredClosedSessions,
      sales,
    ]);

  /*
   * SALES METRICS
   */
  const salesRevenue =
    useMemo(() => {
      return filteredSales.reduce(
        (
          sum,
          sale
        ) =>
          sum +
          sale.quantity *
            sale.unitPrice,
        0
      );
    }, [
      filteredSales,
    ]);

  const itemsSold =
    useMemo(() => {
      return filteredSales.reduce(
        (
          total,
          sale
        ) =>
          total +
          sale.quantity,
        0
      );
    }, [
      filteredSales,
    ]);

  const averageSale =
    filteredSales.length >
    0
      ? salesRevenue /
        filteredSales.length
      : 0;

  /*
   * SALES PAYMENT BREAKDOWN
   */
  const salesPaymentBreakdown =
    useMemo<
      PaymentSummary[]
    >(() => {
      const groups =
        new Map<
          string,
          {
            revenue: number;
            transactions: number;
          }
        >();

      filteredSales.forEach(
        (sale) => {
          const label =
            sale.paymentMethod ||
            'Unknown';

          const existing =
            groups.get(
              label
            ) ?? {
              revenue: 0,
              transactions: 0,
            };

          groups.set(
            label,
            {
              revenue:
                existing.revenue +
                sale.quantity *
                  sale.unitPrice,

              transactions:
                existing.transactions +
                1,
            }
          );
        }
      );

      return Array.from(
        groups.entries()
      )
        .map(
          ([
            label,
            values,
          ]) => ({
            label,
            revenue:
              values.revenue,
            transactions:
              values.transactions,
          })
        )
        .sort(
          (a, b) =>
            b.revenue -
            a.revenue
        );
    }, [
      filteredSales,
    ]);

  /*
   * PRODUCT PERFORMANCE
   *
   * Start with every current
   * catalog product so products
   * with zero sales still appear.
   *
   * Historical sales for products
   * no longer in the catalog are
   * preserved as Historical.
   */
  const productPerformance =
    useMemo<
      ProductPerformanceRow[]
    >(() => {
      const performance =
        new Map<
          string,
          ProductPerformanceRow
        >();

      products.forEach(
        (product) => {
          const key =
            `product-${product.id}`;

          performance.set(
            key,
            {
              key,
              productId:
                product.id,

              name:
                product.name,

              status:
                product.active
                  ? 'Active'
                  : 'Inactive',

              currentPrice:
                product.price,

              transactions: 0,
              unitsSold: 0,
              revenue: 0,
              averageUnitPrice:
                0,
            }
          );
        }
      );

      filteredSales.forEach(
        (sale) => {
          const currentProduct =
            products.find(
              (product) =>
                product.id ===
                sale.productId
            );

          const key =
            currentProduct
              ? `product-${currentProduct.id}`
              : `historical-${sale.productId}-${sale.productName}`;

          const existing =
            performance.get(
              key
            ) ?? {
              key,

              productId:
                sale.productId,

              name:
                sale.productName,

              status:
                'Historical' as const,

              currentPrice:
                null,

              transactions: 0,
              unitsSold: 0,
              revenue: 0,
              averageUnitPrice:
                0,
            };

          const unitsSold =
            existing.unitsSold +
            sale.quantity;

          const revenue =
            existing.revenue +
            sale.quantity *
              sale.unitPrice;

          performance.set(
            key,
            {
              ...existing,

              transactions:
                existing.transactions +
                1,

              unitsSold,

              revenue,

              averageUnitPrice:
                unitsSold >
                0
                  ? revenue /
                    unitsSold
                  : 0,
            }
          );
        }
      );

      return Array.from(
        performance.values()
      ).sort(
        (a, b) => {
          if (
            b.revenue !==
            a.revenue
          ) {
            return (
              b.revenue -
              a.revenue
            );
          }

          return a.name.localeCompare(
            b.name
          );
        }
      );
    }, [
      products,
      filteredSales,
    ]);

  const productsWithSales =
    useMemo(() => {
      return productPerformance.filter(
        (product) =>
          product.unitsSold >
          0
      );
    }, [
      productPerformance,
    ]);

  const topSellingProduct =
    productsWithSales[0] ??
    null;

  const largestProductRevenue =
    useMemo(() => {
      return Math.max(
        0,
        ...productsWithSales.map(
          (product) =>
            product.revenue
        )
      );
    }, [
      productsWithSales,
    ]);

  /*
   * EXPENSE FILTER
   */
  const filteredExpenses =
    useMemo(() => {
      return expenses.filter(
        (expense) => {
          if (
            !expense.date
          ) {
            return false;
          }

          const expenseDate =
            parseLocalDate(
              expense.date
            );

          if (!expenseDate) {
            return false;
          }

          if (
            rangeStart &&
            expenseDate <
              rangeStart
          ) {
            return false;
          }

          if (
            rangeEnd &&
            expenseDate >
              rangeEnd
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      expenses,
      rangeStart,
      rangeEnd,
    ]);

  const sortedFilteredExpenses =
    useMemo(() => {
      return [
        ...filteredExpenses,
      ].sort(
        (a, b) => {
          const dateA =
            parseLocalDate(
              a.date
            );

          const dateB =
            parseLocalDate(
              b.date
            );

          const timeA =
            dateA?.getTime() ??
            0;

          const timeB =
            dateB?.getTime() ??
            0;

          if (
            timeA !==
            timeB
          ) {
            return (
              timeB -
              timeA
            );
          }

          return (
            b.id - a.id
          );
        }
      );
    }, [
      filteredExpenses,
    ]);

  /*
   * EXPENSE METRICS
   */
  const expenseTotal =
    useMemo(() => {
      return filteredExpenses.reduce(
        (
          sum,
          expense
        ) =>
          sum +
          expense.amount,
        0
      );
    }, [
      filteredExpenses,
    ]);

  const averageExpense =
    filteredExpenses.length >
    0
      ? expenseTotal /
        filteredExpenses.length
      : 0;

  const categoryBreakdown =
    useMemo(() => {
      return groupExpensesByField(
        filteredExpenses,
        (expense) =>
          expense.category
      );
    }, [
      filteredExpenses,
    ]);

  const topCategory =
    categoryBreakdown[0] ??
    null;

  const paymentBreakdown =
    useMemo(() => {
      return groupExpensesByField(
        filteredExpenses,
        (expense) =>
          expense.paymentMethod
      );
    }, [
      filteredExpenses,
    ]);

  const sourceBreakdown =
    useMemo(() => {
      return groupExpensesByField(
        filteredExpenses,
        (expense) =>
          expense.source ===
          'import'
            ? 'Imported'
            : 'Manual'
      );
    }, [
      filteredExpenses,
    ]);

  /*
   * SPENDING OVER TIME
   */
  const monthlyExpenseBreakdown =
    useMemo(() => {
      const groups =
        new Map<
          string,
          MonthlyExpenseGroup
        >();

      filteredExpenses.forEach(
        (expense) => {
          const date =
            parseLocalDate(
              expense.date
            );

          if (!date) {
            return;
          }

          const year =
            date.getFullYear();

          const month =
            date.getMonth();

          const key =
            `${year}-${String(
              month + 1
            ).padStart(
              2,
              '0'
            )}`;

          const label =
            new Intl.DateTimeFormat(
              'en-US',
              {
                month: 'short',
                year: 'numeric',
              }
            ).format(
              new Date(
                year,
                month,
                1
              )
            );

          const existing =
            groups.get(
              key
            ) ?? {
              key,
              label,
              amount: 0,
              count: 0,
            };

          groups.set(
            key,
            {
              ...existing,

              amount:
                existing.amount +
                expense.amount,

              count:
                existing.count +
                1,
            }
          );
        }
      );

      return Array.from(
        groups.values()
      ).sort(
        (a, b) =>
          a.key.localeCompare(
            b.key
          )
      );
    }, [
      filteredExpenses,
    ]);

  const largestMonthlyExpenseTotal =
    useMemo(() => {
      return Math.max(
        0,
        ...monthlyExpenseBreakdown.map(
          (month) =>
            month.amount
        )
      );
    }, [
      monthlyExpenseBreakdown,
    ]);

  /*
   * PROFIT & LOSS
   */
  const netProfit =
    salesRevenue -
    expenseTotal;

  const profitMargin =
    salesRevenue > 0
      ? (
          netProfit /
          salesRevenue
        ) * 100
      : 0;

  /*
   * PAGINATED TABLES
   */
  const paginatedSessions =
    useMemo(() => {
      const start =
        salesSessionPage *
        REPORT_ROWS_PER_PAGE;

      return sessionReportRows.slice(
        start,
        start +
          REPORT_ROWS_PER_PAGE
      );
    }, [
      sessionReportRows,
      salesSessionPage,
    ]);

  const paginatedExpenses =
    useMemo(() => {
      const start =
        expensePage *
        REPORT_ROWS_PER_PAGE;

      return sortedFilteredExpenses.slice(
        start,
        start +
          REPORT_ROWS_PER_PAGE
      );
    }, [
      sortedFilteredExpenses,
      expensePage,
    ]);

  const paginatedProducts =
    useMemo(() => {
      const start =
        productPage *
        REPORT_ROWS_PER_PAGE;

      return productPerformance.slice(
        start,
        start +
          REPORT_ROWS_PER_PAGE
      );
    }, [
      productPerformance,
      productPage,
    ]);

  /*
   * KEEP PAGINATION VALID
   */
  useEffect(() => {
    const maxPage =
      Math.max(
        0,
        Math.ceil(
          sessionReportRows.length /
            REPORT_ROWS_PER_PAGE
        ) - 1
      );

    if (
      salesSessionPage >
      maxPage
    ) {
      setSalesSessionPage(
        maxPage
      );
    }
  }, [
    sessionReportRows.length,
    salesSessionPage,
  ]);

  useEffect(() => {
    const maxPage =
      Math.max(
        0,
        Math.ceil(
          sortedFilteredExpenses.length /
            REPORT_ROWS_PER_PAGE
        ) - 1
      );

    if (
      expensePage >
      maxPage
    ) {
      setExpensePage(
        maxPage
      );
    }
  }, [
    sortedFilteredExpenses.length,
    expensePage,
  ]);

  useEffect(() => {
    const maxPage =
      Math.max(
        0,
        Math.ceil(
          productPerformance.length /
            REPORT_ROWS_PER_PAGE
        ) - 1
      );

    if (
      productPage >
      maxPage
    ) {
      setProductPage(
        maxPage
      );
    }
  }, [
    productPerformance.length,
    productPage,
  ]);

  const handleDateRangeChange =
    (
      newRange: DateRange
    ) => {
      setDateRange(
        newRange
      );

      setSalesSessionPage(
        0
      );

      setExpensePage(
        0
      );

      setProductPage(
        0
      );
    };

  return (
    <AppShell>
      <Stack spacing={4}>
        {/* HEADER */}
        <Stack
          spacing={2}
          sx={{
            flexDirection: {
              xs: 'column',
              md: 'row',
            },

            justifyContent:
              'space-between',

            alignItems: {
              xs: 'stretch',
              md: 'center',
            },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color:
                  'primary.main',

                fontWeight:
                  700,
              }}
            >
              Reports
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 0.5,

                color:
                  'text.secondary',
              }}
            >
              Analyze Milo +
              Marley sales,
              expenses, and
              profitability.
            </Typography>
          </Box>

          <TextField
            select
            label="Date Range"
            value={
              dateRange
            }
            onChange={(
              event
            ) =>
              handleDateRangeChange(
                event.target
                  .value as DateRange
              )
            }
            sx={{
              minWidth: 180,
            }}
          >
            <MenuItem
              value="this-month"
            >
              This Month
            </MenuItem>

            <MenuItem
              value="last-month"
            >
              Last Month
            </MenuItem>

            <MenuItem
              value="this-year"
            >
              This Year
            </MenuItem>

            <MenuItem
              value="all-time"
            >
              All Time
            </MenuItem>

            <MenuItem
              value="custom"
            >
              Custom
            </MenuItem>
          </TextField>
        </Stack>

        {/* UNDATED EXPENSE WARNING */}
        {undatedExpenses.length >
          0 && (
          <Alert
            severity="warning"
          >
            <strong>
              {
                undatedExpenses.length
              }{' '}
              expense
              {undatedExpenses.length ===
              1
                ? ''
                : 's'}{' '}
              {undatedExpenses.length ===
              1
                ? 'is'
                : 'are'}{' '}
              missing a valid
              date.
            </strong>{' '}
            {undatedExpenses.length ===
            1
              ? 'It is'
              : 'They are'}{' '}
            excluded from
            Expense and Profit
            &amp; Loss reports
            until a date is
            assigned.
          </Alert>
        )}

        {/* CUSTOM DATE RANGE */}
        {dateRange ===
          'custom' && (
          <Card>
            <CardContent>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,

                  fontWeight:
                    600,
                }}
              >
                Custom Date Range
              </Typography>

              <Box
                sx={{
                  display:
                    'grid',

                  gridTemplateColumns:
                    {
                      xs: '1fr',
                      sm: '1fr 1fr',
                    },

                  gap: 2,
                }}
              >
                <TextField
                  label="Start Date"
                  type="date"
                  value={
                    customStartDate
                  }
                  onChange={(
                    event
                  ) => {
                    setCustomStartDate(
                      event.target
                        .value
                    );

                    setSalesSessionPage(
                      0
                    );

                    setExpensePage(
                      0
                    );

                    setProductPage(
                      0
                    );
                  }}
                  fullWidth
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />

                <TextField
                  label="End Date"
                  type="date"
                  value={
                    customEndDate
                  }
                  onChange={(
                    event
                  ) => {
                    setCustomEndDate(
                      event.target
                        .value
                    );

                    setSalesSessionPage(
                      0
                    );

                    setExpensePage(
                      0
                    );

                    setProductPage(
                      0
                    );
                  }}
                  fullWidth
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* TABS */}
        <Card>
          <CardContent
            sx={{
              pb:
                '0 !important',
            }}
          >
            <Tabs
              value={
                activeTab
              }
              onChange={
                handleTabChange
              }
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                label="Sales"
                value="sales"
              />

              <Tab
                label="Expenses"
                value="expenses"
              />

              <Tab
                label="Profit & Loss"
                value="profit-loss"
              />

              <Tab
                label="Products"
                value="products"
              />
            </Tabs>
          </CardContent>
        </Card>

        {/* SALES */}
        {activeTab ===
          'sales' && (
          <Stack spacing={3}>
            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns:
                  {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    lg:
                      'repeat(4, 1fr)',
                  },

                gap: 2,
              }}
            >
              <SummaryCard
                label="Revenue"
                value={formatCurrency(
                  salesRevenue
                )}
              />

              <SummaryCard
                label="Transactions"
                value={String(
                  filteredSales.length
                )}
              />

              <SummaryCard
                label="Items Sold"
                value={String(
                  itemsSold
                )}
              />

              <SummaryCard
                label="Closed Sessions"
                value={String(
                  sessionReportRows.length
                )}
              />
            </Box>

            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns:
                  {
                    xs: '1fr',
                    lg: '1fr 1fr',
                  },

                gap: 3,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight:
                        700,

                      color:
                        'primary.main',
                    }}
                  >
                    Payment Methods
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      mb: 2,

                      color:
                        'text.secondary',
                    }}
                  >
                    Revenue by
                    payment method
                    for the selected
                    period.
                  </Typography>

                  {salesPaymentBreakdown.length ===
                  0 ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          'text.secondary',
                      }}
                    >
                      No sales data
                      is available for
                      this period.
                    </Typography>
                  ) : (
                    <Stack
                      spacing={2}
                    >
                      {salesPaymentBreakdown.map(
                        (
                          payment
                        ) => (
                          <Stack
                            key={
                              payment.label
                            }
                            sx={{
                              flexDirection:
                                'row',

                              justifyContent:
                                'space-between',

                              alignItems:
                                'center',

                              gap: 2,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    600,
                                }}
                              >
                                {
                                  payment.label
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    'text.secondary',
                                }}
                              >
                                {
                                  payment.transactions
                                }{' '}
                                transaction
                                {payment.transactions ===
                                1
                                  ? ''
                                  : 's'}
                              </Typography>
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  700,
                              }}
                            >
                              {formatCurrency(
                                payment.revenue
                              )}
                            </Typography>
                          </Stack>
                        )
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight:
                        700,

                      color:
                        'primary.main',
                    }}
                  >
                    Top Products
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      mb: 2,

                      color:
                        'text.secondary',
                    }}
                  >
                    Products ranked
                    by sales revenue.
                  </Typography>

                  {productsWithSales.length ===
                  0 ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          'text.secondary',
                      }}
                    >
                      No product
                      sales data is
                      available.
                    </Typography>
                  ) : (
                    <Stack
                      spacing={2}
                    >
                      {productsWithSales
                        .slice(
                          0,
                          5
                        )
                        .map(
                          (
                            product
                          ) => (
                            <Stack
                              key={
                                product.key
                              }
                              sx={{
                                flexDirection:
                                  'row',

                                justifyContent:
                                  'space-between',

                                alignItems:
                                  'center',

                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  minWidth:
                                    0,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight:
                                      600,

                                    overflow:
                                      'hidden',

                                    textOverflow:
                                      'ellipsis',

                                    whiteSpace:
                                      'nowrap',
                                  }}
                                >
                                  {
                                    product.name
                                  }
                                </Typography>

                                <Typography
                                  variant="caption"
                                  sx={{
                                    color:
                                      'text.secondary',
                                  }}
                                >
                                  {
                                    product.unitsSold
                                  }{' '}
                                  item
                                  {product.unitsSold ===
                                  1
                                    ? ''
                                    : 's'}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    700,
                                }}
                              >
                                {formatCurrency(
                                  product.revenue
                                )}
                              </Typography>
                            </Stack>
                          )
                        )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Box>

            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns:
                  {
                    xs: '1fr',
                    sm: '1fr 1fr',
                  },

                gap: 2,
              }}
            >
              <SummaryCard
                label="Average Sale"
                value={formatCurrency(
                  averageSale
                )}
              />

              <SummaryCard
                label="Average Items per Transaction"
                value={
                  filteredSales.length >
                  0
                    ? (
                        itemsSold /
                        filteredSales.length
                      ).toFixed(
                        1
                      )
                    : '0.0'
                }
              />
            </Box>

            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight:
                      700,

                    color:
                      'primary.main',
                  }}
                >
                  Closed Sales
                  Sessions
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    mb: 2,

                    color:
                      'text.secondary',
                  }}
                >
                  Historical sales
                  sessions for the
                  selected reporting
                  period.
                </Typography>

                {sessionReportRows.length ===
                0 ? (
                  <Box
                    sx={{
                      py: 5,

                      textAlign:
                        'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          'text.secondary',
                      }}
                    >
                      No closed
                      sessions were
                      found.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              Opened
                            </TableCell>

                            <TableCell>
                              Closed
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              Transactions
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              Items Sold
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              Revenue
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {paginatedSessions.map(
                            (
                              session
                            ) => (
                              <TableRow
                                key={
                                  session.id
                                }
                              >
                                <TableCell>
                                  {formatDateTime(
                                    session.openedAt
                                  )}
                                </TableCell>

                                <TableCell>
                                  {formatDateTime(
                                    session.closedAt
                                  )}
                                </TableCell>

                                <TableCell
                                  align="right"
                                >
                                  {
                                    session.transactions
                                  }
                                </TableCell>

                                <TableCell
                                  align="right"
                                >
                                  {
                                    session.itemsSold
                                  }
                                </TableCell>

                                <TableCell
                                  align="right"
                                  sx={{
                                    fontWeight:
                                      600,
                                  }}
                                >
                                  {formatCurrency(
                                    session.revenue
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {sessionReportRows.length >
                      REPORT_ROWS_PER_PAGE && (
                      <TablePagination
                        component="div"
                        count={
                          sessionReportRows.length
                        }
                        page={
                          salesSessionPage
                        }
                        onPageChange={(
                          _event,
                          newPage
                        ) =>
                          setSalesSessionPage(
                            newPage
                          )
                        }
                        rowsPerPage={
                          REPORT_ROWS_PER_PAGE
                        }
                        rowsPerPageOptions={[
                          REPORT_ROWS_PER_PAGE,
                        ]}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Stack>
        )}

        {/* EXPENSES */}
        {activeTab ===
          'expenses' && (
          <Stack spacing={3}>
            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns:
                  {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    lg:
                      'repeat(4, 1fr)',
                  },

                gap: 2,
              }}
            >
              <SummaryCard
                label="Total Expenses"
                value={formatCurrency(
                  expenseTotal
                )}
              />

              <SummaryCard
                label="Transactions"
                value={String(
                  filteredExpenses.length
                )}
              />

              <SummaryCard
                label="Average Expense"
                value={formatCurrency(
                  averageExpense
                )}
              />

              <SummaryCard
                label="Top Category"
                value={
                  topCategory
                    ? topCategory.label
                    : '—'
                }
                secondary={
                  topCategory
                    ? formatCurrency(
                        topCategory.amount
                      )
                    : undefined
                }
              />
            </Box>

            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns:
                  {
                    xs: '1fr',
                    lg: '2fr 1fr',
                  },

                gap: 3,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight:
                        700,

                      color:
                        'primary.main',
                    }}
                  >
                    Expenses by
                    Category
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      mb: 3,

                      color:
                        'text.secondary',
                    }}
                  >
                    See where money
                    was spent during
                    the selected
                    period.
                  </Typography>

                  {categoryBreakdown.length ===
                  0 ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          'text.secondary',
                      }}
                    >
                      No expense data
                      is available.
                    </Typography>
                  ) : (
                    <Stack
                      spacing={2.5}
                    >
                      {categoryBreakdown.map(
                        (
                          category
                        ) => {
                          const percentage =
                            expenseTotal >
                            0
                              ? (
                                  category.amount /
                                  expenseTotal
                                ) *
                                100
                              : 0;

                          return (
                            <Box
                              key={
                                category.label
                              }
                            >
                              <Stack
                                sx={{
                                  flexDirection:
                                    'row',

                                  justifyContent:
                                    'space-between',

                                  gap: 2,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight:
                                        600,
                                    }}
                                  >
                                    {
                                      category.label
                                    }
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color:
                                        'text.secondary',
                                    }}
                                  >
                                    {
                                      category.count
                                    }{' '}
                                    transaction
                                    {category.count ===
                                    1
                                      ? ''
                                      : 's'}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    textAlign:
                                      'right',
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight:
                                        600,
                                    }}
                                  >
                                    {formatCurrency(
                                      category.amount
                                    )}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color:
                                        'text.secondary',
                                    }}
                                  >
                                    {percentage.toFixed(
                                      1
                                    )}
                                    %
                                  </Typography>
                                </Box>
                              </Stack>

                              <Box
                                sx={{
                                  mt: 1,
                                  height: 8,

                                  borderRadius:
                                    999,

                                  backgroundColor:
                                    'action.hover',

                                  overflow:
                                    'hidden',
                                }}
                              >
                                <Box
                                  sx={{
                                    width:
                                      `${Math.min(
                                        percentage,
                                        100
                                      )}%`,

                                    height:
                                      '100%',

                                    backgroundColor:
                                      'primary.main',
                                  }}
                                />
                              </Box>
                            </Box>
                          );
                        }
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              <Stack spacing={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight:
                          700,

                        color:
                          'primary.main',
                      }}
                    >
                      Payment Methods
                    </Typography>

                    <Stack
                      spacing={2}
                      sx={{
                        mt: 2,
                      }}
                    >
                      {paymentBreakdown.map(
                        (
                          payment
                        ) => (
                          <Stack
                            key={
                              payment.label
                            }
                            sx={{
                              flexDirection:
                                'row',

                              justifyContent:
                                'space-between',

                              gap: 2,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    600,
                                }}
                              >
                                {
                                  payment.label
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    'text.secondary',
                                }}
                              >
                                {
                                  payment.count
                                }{' '}
                                transaction
                                {payment.count ===
                                1
                                  ? ''
                                  : 's'}
                              </Typography>
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  600,
                              }}
                            >
                              {formatCurrency(
                                payment.amount
                              )}
                            </Typography>
                          </Stack>
                        )
                      )}

                      {paymentBreakdown.length ===
                        0 && (
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              'text.secondary',
                          }}
                        >
                          No payment
                          data.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight:
                          700,

                        color:
                          'primary.main',
                      }}
                    >
                      Entry Source
                    </Typography>

                    <Stack
                      spacing={2}
                      sx={{
                        mt: 2,
                      }}
                    >
                      {sourceBreakdown.map(
                        (
                          source
                        ) => (
                          <Stack
                            key={
                              source.label
                            }
                            sx={{
                              flexDirection:
                                'row',

                              justifyContent:
                                'space-between',

                              gap: 2,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    600,
                                }}
                              >
                                {
                                  source.label
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    'text.secondary',
                                }}
                              >
                                {
                                  source.count
                                }{' '}
                                transaction
                                {source.count ===
                                1
                                  ? ''
                                  : 's'}
                              </Typography>
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  600,
                              }}
                            >
                              {formatCurrency(
                                source.amount
                              )}
                            </Typography>
                          </Stack>
                        )
                      )}

                      {sourceBreakdown.length ===
                        0 && (
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              'text.secondary',
                          }}
                        >
                          No expense
                          data.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>

            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight:
                      700,

                    color:
                      'primary.main',
                  }}
                >
                  Spending Over Time
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    mb: 3,

                    color:
                      'text.secondary',
                  }}
                >
                  Monthly expense
                  totals for the
                  selected period.
                </Typography>

                {monthlyExpenseBreakdown.length ===
                0 ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    No expense data
                    is available.
                  </Typography>
                ) : (
                  <Stack
                    spacing={2}
                  >
                    {monthlyExpenseBreakdown.map(
                      (month) => {
                        const width =
                          largestMonthlyExpenseTotal >
                          0
                            ? (
                                month.amount /
                                largestMonthlyExpenseTotal
                              ) *
                              100
                            : 0;

                        return (
                          <Box
                            key={
                              month.key
                            }
                          >
                            <Stack
                              sx={{
                                flexDirection:
                                  'row',

                                justifyContent:
                                  'space-between',

                                gap: 2,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight:
                                      600,
                                  }}
                                >
                                  {
                                    month.label
                                  }
                                </Typography>

                                <Typography
                                  variant="caption"
                                  sx={{
                                    color:
                                      'text.secondary',
                                  }}
                                >
                                  {
                                    month.count
                                  }{' '}
                                  transaction
                                  {month.count ===
                                  1
                                    ? ''
                                    : 's'}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    700,
                                }}
                              >
                                {formatCurrency(
                                  month.amount
                                )}
                              </Typography>
                            </Stack>

                            <Box
                              sx={{
                                mt: 1,
                                height: 8,

                                borderRadius:
                                  999,

                                backgroundColor:
                                  'action.hover',

                                overflow:
                                  'hidden',
                              }}
                            >
                              <Box
                                sx={{
                                  width:
                                    `${width}%`,

                                  height:
                                    '100%',

                                  backgroundColor:
                                    'secondary.main',
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      }
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight:
                      700,

                    color:
                      'primary.main',
                  }}
                >
                  Expense Details
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    mb: 2,

                    color:
                      'text.secondary',
                  }}
                >
                  Historical expense
                  records for the
                  selected period.
                </Typography>

                {sortedFilteredExpenses.length ===
                0 ? (
                  <Box
                    sx={{
                      py: 5,

                      textAlign:
                        'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          'text.secondary',
                      }}
                    >
                      No expenses were
                      found.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              Date
                            </TableCell>

                            <TableCell>
                              Category
                            </TableCell>

                            <TableCell>
                              Vendor
                            </TableCell>

                            <TableCell>
                              Description
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              Amount
                            </TableCell>

                            <TableCell>
                              Payment
                            </TableCell>

                            <TableCell>
                              Source
                            </TableCell>

                            <TableCell>
                              Receipt
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {paginatedExpenses.map(
                            (
                              expense
                            ) => (
                              <TableRow
                                key={
                                  expense.id
                                }
                              >
                                <TableCell>
                                  {formatExpenseDate(
                                    expense.date
                                  )}
                                </TableCell>

                                <TableCell>
                                  {
                                    expense.category
                                  }
                                </TableCell>

                                <TableCell>
                                  {expense.vendor ||
                                    '—'}
                                </TableCell>

                                <TableCell>
                                  {
                                    expense.description
                                  }
                                </TableCell>

                                <TableCell
                                  align="right"
                                >
                                  {formatCurrency(
                                    expense.amount
                                  )}
                                </TableCell>

                                <TableCell>
                                  {
                                    expense.paymentMethod
                                  }
                                </TableCell>

                                <TableCell>
                                  <Chip
                                    size="small"
                                    variant={
                                      expense.source ===
                                      'import'
                                        ? 'outlined'
                                        : 'filled'
                                    }
                                    label={
                                      expense.source ===
                                      'import'
                                        ? 'Imported'
                                        : 'Manual'
                                    }
                                  />
                                </TableCell>

                                <TableCell>
                                  {expense.receiptName ||
                                    '—'}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {sortedFilteredExpenses.length >
                      REPORT_ROWS_PER_PAGE && (
                      <TablePagination
                        component="div"
                        count={
                          sortedFilteredExpenses.length
                        }
                        page={
                          expensePage
                        }
                        onPageChange={(
                          _event,
                          newPage
                        ) =>
                          setExpensePage(
                            newPage
                          )
                        }
                        rowsPerPage={
                          REPORT_ROWS_PER_PAGE
                        }
                        rowsPerPageOptions={[
                          REPORT_ROWS_PER_PAGE,
                        ]}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Stack>
        )}

        {/* PROFIT & LOSS */}
        {activeTab ===
          'profit-loss' && (
          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns:
                {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  lg:
                    'repeat(4, 1fr)',
                },

              gap: 2,
            }}
          >
            <SummaryCard
              label="Revenue"
              value={formatCurrency(
                salesRevenue
              )}
            />

            <SummaryCard
              label="Expenses"
              value={formatCurrency(
                expenseTotal
              )}
            />

            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  Net Profit
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mt: 0.5,

                    fontWeight:
                      700,

                    color:
                      netProfit >=
                      0
                        ? 'success.main'
                        : 'error.main',
                  }}
                >
                  {formatCurrency(
                    netProfit
                  )}
                </Typography>
              </CardContent>
            </Card>

            <SummaryCard
              label="Profit Margin"
              value={`${profitMargin.toFixed(
                1
              )}%`}
            />
          </Box>
        )}

        {/* PRODUCTS */}
        {activeTab ===
          'products' && (
          <Stack spacing={3}>
            {/* PRODUCT SUMMARY */}
            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns:
                  {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    lg:
                      'repeat(4, 1fr)',
                  },

                gap: 2,
              }}
            >
              <SummaryCard
                label="Catalog Products"
                value={String(
                  products.length
                )}
              />

              <SummaryCard
                label="Products Sold"
                value={String(
                  productsWithSales.length
                )}
                secondary="In selected period"
              />

              <SummaryCard
                label="Units Sold"
                value={String(
                  itemsSold
                )}
              />

              <SummaryCard
                label="Product Revenue"
                value={formatCurrency(
                  salesRevenue
                )}
              />
            </Box>

            {/* PRODUCT RANKING */}
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight:
                      700,

                    color:
                      'primary.main',
                  }}
                >
                  Product Performance
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    mb: 3,

                    color:
                      'text.secondary',
                  }}
                >
                  Revenue and unit
                  sales for the
                  selected reporting
                  period.
                </Typography>

                {productsWithSales.length ===
                0 ? (
                  <Box
                    sx={{
                      py: 4,

                      textAlign:
                        'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          'text.secondary',
                      }}
                    >
                      No products were
                      sold during this
                      period.
                    </Typography>
                  </Box>
                ) : (
                  <Stack
                    spacing={2.5}
                  >
                    {productsWithSales
                      .slice(
                        0,
                        5
                      )
                      .map(
                        (
                          product
                        ) => {
                          const width =
                            largestProductRevenue >
                            0
                              ? (
                                  product.revenue /
                                  largestProductRevenue
                                ) *
                                100
                              : 0;

                          return (
                            <Box
                              key={
                                product.key
                              }
                            >
                              <Stack
                                sx={{
                                  flexDirection:
                                    'row',

                                  justifyContent:
                                    'space-between',

                                  alignItems:
                                    'center',

                                  gap: 2,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight:
                                        600,
                                    }}
                                  >
                                    {
                                      product.name
                                    }
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color:
                                        'text.secondary',
                                    }}
                                  >
                                    {
                                      product.unitsSold
                                    }{' '}
                                    item
                                    {product.unitsSold ===
                                    1
                                      ? ''
                                      : 's'}{' '}
                                    sold
                                  </Typography>
                                </Box>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  {formatCurrency(
                                    product.revenue
                                  )}
                                </Typography>
                              </Stack>

                              <Box
                                sx={{
                                  mt: 1,
                                  height: 8,

                                  borderRadius:
                                    999,

                                  backgroundColor:
                                    'action.hover',

                                  overflow:
                                    'hidden',
                                }}
                              >
                                <Box
                                  sx={{
                                    width:
                                      `${width}%`,

                                    height:
                                      '100%',

                                    backgroundColor:
                                      'primary.main',
                                  }}
                                />
                              </Box>
                            </Box>
                          );
                        }
                      )}
                  </Stack>
                )}

                {topSellingProduct && (
                  <Box
                    sx={{
                      mt: 3,
                      pt: 2,

                      borderTop:
                        '1px solid',

                      borderColor:
                        'divider',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          'text.secondary',
                      }}
                    >
                      Top product for
                      selected period
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        mt: 0.5,

                        fontWeight:
                          700,

                        color:
                          'primary.main',
                      }}
                    >
                      {
                        topSellingProduct.name
                      }
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.25,

                        color:
                          'text.secondary',
                      }}
                    >
                      {
                        topSellingProduct.unitsSold
                      }{' '}
                      units ·{' '}
                      {formatCurrency(
                        topSellingProduct.revenue
                      )}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* PROFITABILITY NOTICE */}
            <Alert
              severity="info"
            >
              Product profitability
              is not calculated yet.
              Once recipe,
              ingredient, packaging,
              and production costs
              are connected to each
              product, this report
              can show cost per unit,
              gross profit, and
              margin by product.
            </Alert>

            {/* PRODUCT TABLE */}
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight:
                      700,

                    color:
                      'primary.main',
                  }}
                >
                  Product Details
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    mb: 2,

                    color:
                      'text.secondary',
                  }}
                >
                  Catalog status and
                  sales performance
                  for the selected
                  period.
                </Typography>

                {productPerformance.length ===
                0 ? (
                  <Box
                    sx={{
                      py: 5,

                      textAlign:
                        'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          'text.secondary',
                      }}
                    >
                      No products are
                      available.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              Product
                            </TableCell>

                            <TableCell>
                              Status
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              Current Price
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              Transactions
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              Units Sold
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              Avg. Sale Price
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              Revenue
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {paginatedProducts.map(
                            (
                              product
                            ) => (
                              <TableRow
                                key={
                                  product.key
                                }
                              >
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight:
                                        600,
                                    }}
                                  >
                                    {
                                      product.name
                                    }
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={
                                      product.status
                                    }
                                    color={
                                      product.status ===
                                      'Active'
                                        ? 'success'
                                        : product.status ===
                                          'Inactive'
                                        ? 'default'
                                        : 'warning'
                                    }
                                    variant={
                                      product.status ===
                                      'Active'
                                        ? 'filled'
                                        : 'outlined'
                                    }
                                  />
                                </TableCell>

                                <TableCell
                                  align="right"
                                >
                                  {product.currentPrice !==
                                  null
                                    ? formatCurrency(
                                        product.currentPrice
                                      )
                                    : '—'}
                                </TableCell>

                                <TableCell
                                  align="right"
                                >
                                  {
                                    product.transactions
                                  }
                                </TableCell>

                                <TableCell
                                  align="right"
                                >
                                  {
                                    product.unitsSold
                                  }
                                </TableCell>

                                <TableCell
                                  align="right"
                                >
                                  {product.unitsSold >
                                  0
                                    ? formatCurrency(
                                        product.averageUnitPrice
                                      )
                                    : '—'}
                                </TableCell>

                                <TableCell
                                  align="right"
                                  sx={{
                                    fontWeight:
                                      600,
                                  }}
                                >
                                  {formatCurrency(
                                    product.revenue
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {productPerformance.length >
                      REPORT_ROWS_PER_PAGE && (
                      <TablePagination
                        component="div"
                        count={
                          productPerformance.length
                        }
                        page={
                          productPage
                        }
                        onPageChange={(
                          _event,
                          newPage
                        ) =>
                          setProductPage(
                            newPage
                          )
                        }
                        rowsPerPage={
                          REPORT_ROWS_PER_PAGE
                        }
                        rowsPerPageOptions={[
                          REPORT_ROWS_PER_PAGE,
                        ]}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Stack>
        )}
      </Stack>

      {/* UNDATED EXPENSE MODAL */}
      <Dialog
        open={
          undatedDialogOpen
        }
        onClose={() =>
          setUndatedDialogOpen(
            false
          )
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Expenses Missing Dates
        </DialogTitle>

        <DialogContent>
          <Alert
            severity="warning"
            sx={{
              mb: 2,
            }}
          >
            {
              undatedExpenses.length
            }{' '}
            expense
            {undatedExpenses.length ===
            1
              ? ''
              : 's'}{' '}
            {undatedExpenses.length ===
            1
              ? 'is'
              : 'are'}{' '}
            currently missing a
            valid date.
          </Alert>

          <Typography>
            {warningContext ===
            'expenses'
              ? 'Expenses without dates cannot be assigned to the selected reporting period, so they are excluded from the totals and analytics shown in this Expense report.'
              : 'Expenses without dates cannot be assigned to the selected reporting period, so they are excluded from the expense total, net profit, and profit margin calculations in Profit & Loss.'}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 2,

              color:
                'text.secondary',
            }}
          >
            You can correct these
            records from the
            Expenses page.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            variant="contained"
            onClick={() =>
              setUndatedDialogOpen(
                false
              )
            }
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}