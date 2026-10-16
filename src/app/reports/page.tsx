'use client';

import {
  useMemo,
  useState,
  type SyntheticEvent,
} from 'react';

import {
  Box,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import AppShell from '@/components/AppShell';

import {
  useSales,
} from '@/context/SalesContext';

import {
  useExpenses,
} from '@/context/ExpensesContext';

type ReportTab =
  | 'sales'
  | 'expenses'
  | 'profit-loss'
  | 'products';

type DateRange =
  | 'this-month'
  | 'last-month'
  | 'this-year'
  | 'custom';

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

export default function ReportsPage() {
  const {
    sales,
  } = useSales();

  const {
    expenses,
  } = useExpenses();

  const [
    activeTab,
    setActiveTab,
  ] = useState<ReportTab>(
    'sales'
  );

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

  const handleTabChange = (
    event: SyntheticEvent,
    newValue: ReportTab
  ) => {
    setActiveTab(
      newValue
    );
  };

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
              now.getMonth() + 1,
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
            now.getMonth() - 1,
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

  const filteredExpenses =
    useMemo(() => {
      return expenses.filter(
        (expense) => {
          /*
           * Imported historical
           * expenses can have no
           * date.
           */
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
    }, [filteredSales]);

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
              setDateRange(
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
              value="custom"
            >
              Custom
            </MenuItem>
          </TextField>
        </Stack>

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
                  ) =>
                    setCustomStartDate(
                      event.target
                        .value
                    )
                  }
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
                  ) =>
                    setCustomEndDate(
                      event.target
                        .value
                    )
                  }
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
          <Stack
            spacing={3}
          >
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
              <Card>
                <CardContent>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    Revenue
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 0.5,
                      fontWeight:
                        700,
                      color:
                        'primary.main',
                    }}
                  >
                    $
                    {salesRevenue.toFixed(
                      2
                    )}
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    Sales
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 0.5,
                      fontWeight:
                        700,
                      color:
                        'primary.main',
                    }}
                  >
                    {
                      filteredSales.length
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Card>
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight:
                      700,

                    color:
                      'primary.main',
                  }}
                >
                  Sales Report
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,

                    color:
                      'text.secondary',
                  }}
                >
                  Found{' '}
                  {
                    filteredSales.length
                  }{' '}
                  sale
                  {filteredSales.length ===
                  1
                    ? ''
                    : 's'}{' '}
                  in the selected
                  period.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        )}

        {/* EXPENSES */}
        {activeTab ===
          'expenses' && (
          <Stack
            spacing={3}
          >
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
              <Card>
                <CardContent>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    Total Expenses
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 0.5,

                      fontWeight:
                        700,

                      color:
                        'primary.main',
                    }}
                  >
                    $
                    {expenseTotal.toFixed(
                      2
                    )}
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    Expenses
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 0.5,

                      fontWeight:
                        700,

                      color:
                        'primary.main',
                    }}
                  >
                    {
                      filteredExpenses.length
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Card>
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight:
                      700,

                    color:
                      'primary.main',
                  }}
                >
                  Expense Report
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,

                    color:
                      'text.secondary',
                  }}
                >
                  Found{' '}
                  {
                    filteredExpenses.length
                  }{' '}
                  expense
                  {filteredExpenses.length ===
                  1
                    ? ''
                    : 's'}{' '}
                  in the selected
                  period.
                </Typography>
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
            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  Revenue
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mt: 0.5,
                    fontWeight:
                      700,
                  }}
                >
                  $
                  {salesRevenue.toFixed(
                    2
                  )}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  Expenses
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mt: 0.5,
                    fontWeight:
                      700,
                  }}
                >
                  $
                  {expenseTotal.toFixed(
                    2
                  )}
                </Typography>
              </CardContent>
            </Card>

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
                  $
                  {netProfit.toFixed(
                    2
                  )}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  Profit Margin
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mt: 0.5,
                    fontWeight:
                      700,
                  }}
                >
                  {profitMargin.toFixed(
                    1
                  )}
                  %
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* PRODUCTS */}
        {activeTab ===
          'products' && (
          <Card>
            <CardContent>
              <Typography
                variant="h5"
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
                  mt: 1,

                  color:
                    'text.secondary',
                }}
              >
                Product-level sales
                and profitability
                will be added next.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </AppShell>
  );
}