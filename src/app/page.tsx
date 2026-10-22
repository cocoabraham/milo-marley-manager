'use client';

import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import AppShell from '@/components/AppShell';

import {
  useSales,
} from '@/context/SalesContext';

import {
  useExpenses,
} from '@/context/ExpensesContext';

import {
  useProducts,
} from '@/context/ProductsContext';

import {
  useSalesSessions,
} from '@/context/SalesSessionsContext';

const parseLocalDate = (
  dateString: string
) => {
  if (!dateString) {
    return null;
  }

  const parts =
    dateString.split('-');

  if (
    parts.length !== 3
  ) {
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

const isCurrentMonth = (
  dateString: string
) => {
  const date =
    parseLocalDate(
      dateString
    );

  if (!date) {
    return false;
  }

  const now =
    new Date();

  return (
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth()
  );
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

const formatDate = (
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
    }
  ).format(date);
};

type RecentActivityItem = {
  id: string;
  type: 'sale' | 'expense';
  title: string;
  subtitle: string;
  date: string;
  amount: number;
};

export default function Home() {
  const {
    sales,
  } = useSales();

  const {
    expenses,
  } = useExpenses();

  const {
    products,
  } = useProducts();

  const {
    activeSession,
  } = useSalesSessions();

  /*
   * CURRENT MONTH SALES
   */
  const currentMonthSales =
    sales.filter(
      (sale) =>
        isCurrentMonth(
          sale.date
        )
    );

  /*
   * CURRENT MONTH EXPENSES
   *
   * Undated expenses are
   * intentionally excluded.
   */
  const currentMonthExpenses =
    expenses.filter(
      (expense) =>
        isCurrentMonth(
          expense.date
        )
    );

  /*
   * REVENUE
   */
  const revenue =
    currentMonthSales.reduce(
      (
        total,
        sale
      ) =>
        total +
        sale.quantity *
          sale.unitPrice,
      0
    );

  /*
   * EXPENSES
   */
  const expenseTotal =
    currentMonthExpenses.reduce(
      (
        total,
        expense
      ) =>
        total +
        expense.amount,
      0
    );

  /*
   * PROFIT
   */
  const netProfit =
    revenue -
    expenseTotal;

  const profitMargin =
    revenue > 0
      ? (
          netProfit /
          revenue
        ) * 100
      : 0;

  /*
   * SALES METRICS
   */
  const transactions =
    currentMonthSales.length;

  const itemsSold =
    currentMonthSales.reduce(
      (
        total,
        sale
      ) =>
        total +
        sale.quantity,
      0
    );

  const activeProducts =
    products.filter(
      (product) =>
        product.active
    ).length;

  /*
   * FINANCIAL COMPARISON
   */
  const largestFinancialValue =
    Math.max(
      revenue,
      expenseTotal,
      1
    );

  const revenueWidth =
    (
      revenue /
      largestFinancialValue
    ) * 100;

  const expenseWidth =
    (
      expenseTotal /
      largestFinancialValue
    ) * 100;

  /*
   * RECENT ACTIVITY
   */
  const recentActivity: RecentActivityItem[] =
    [
      ...sales.map(
        (sale) => ({
          id:
            `sale-${sale.id}`,

          type:
            'sale' as const,

          title:
            sale.productName,

          subtitle:
            `${sale.quantity} item${
              sale.quantity ===
              1
                ? ''
                : 's'
            } · ${
              sale.paymentMethod
            }`,

          date:
            sale.date,

          amount:
            sale.quantity *
            sale.unitPrice,
        })
      ),

      ...expenses.map(
        (expense) => ({
          id:
            `expense-${expense.id}`,

          type:
            'expense' as const,

          title:
            expense.description ||
            expense.category,

          subtitle:
            expense.vendor ||
            expense.category,

          date:
            expense.date,

          amount:
            expense.amount,
        })
      ),
    ]
      .filter(
        (item) =>
          Boolean(
            item.date
          )
      )
      .sort(
        (a, b) => {
          const dateA =
            parseLocalDate(
              a.date
            );

          const dateB =
            parseLocalDate(
              b.date
            );

          return (
            (dateB?.getTime() ??
              0) -
            (dateA?.getTime() ??
              0)
          );
        }
      )
      .slice(
        0,
        6
      );

  const metrics = [
    {
      title:
        'Revenue',

      value:
        formatCurrency(
          revenue
        ),

      description:
        'This month',
    },

    {
      title:
        'Expenses',

      value:
        formatCurrency(
          expenseTotal
        ),

      description:
        'This month',
    },

    {
      title:
        'Net Profit',

      value:
        formatCurrency(
          netProfit
        ),

      description:
        'This month',
    },

    {
      title:
        'Profit Margin',

      value:
        `${profitMargin.toFixed(
          1
        )}%`,

      description:
        'This month',
    },
  ];

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
              xs: 'flex-start',
              md: 'center',
            },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight:
                  700,

                color:
                  'primary.main',
              }}
            >
              Dashboard
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 0.5,

                color:
                  'text.secondary',
              }}
            >
              Overview of Milo +
              Marley business
              activity.
            </Typography>
          </Box>

          <Chip
            label={
              activeSession
                ? 'Sales Session Open'
                : 'No Active Sales Session'
            }
            color={
              activeSession
                ? 'success'
                : 'default'
            }
            variant={
              activeSession
                ? 'filled'
                : 'outlined'
            }
          />
        </Stack>

        {/* FINANCIAL METRICS */}
        <Grid
          container
          spacing={3}
        >
          {metrics.map(
            (metric) => (
              <Grid
                key={
                  metric.title
                }
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 3,
                }}
              >
                <Card
                  sx={{
                    height:
                      '100%',
                  }}
                >
                  <CardContent>
                    <Stack
                      spacing={1}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            'text.secondary',

                          fontWeight:
                            500,
                        }}
                      >
                        {
                          metric.title
                        }
                      </Typography>

                      <Typography
                        variant="h4"
                        sx={{
                          color:
                            metric.title ===
                              'Net Profit' &&
                            netProfit <
                              0
                              ? 'error.main'
                              : 'primary.main',

                          fontWeight:
                            700,
                        }}
                      >
                        {
                          metric.value
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
                          metric.description
                        }
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          )}
        </Grid>

        {/* OPERATIONAL METRICS */}
        <Grid
          container
          spacing={3}
        >
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              sx={{
                height:
                  '100%',
              }}
            >
              <CardContent>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  Transactions
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mt: 0.5,

                    fontWeight:
                      700,

                    color:
                      'primary.main',
                  }}
                >
                  {
                    transactions
                  }
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  This month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              sx={{
                height:
                  '100%',
              }}
            >
              <CardContent>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  Items Sold
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mt: 0.5,

                    fontWeight:
                      700,

                    color:
                      'primary.main',
                  }}
                >
                  {
                    itemsSold
                  }
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  This month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              sx={{
                height:
                  '100%',
              }}
            >
              <CardContent>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  Active Products
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mt: 0.5,

                    fontWeight:
                      700,

                    color:
                      'primary.main',
                  }}
                >
                  {
                    activeProducts
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
                    products.length
                  }{' '}
                  total products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* DASHBOARD DETAILS */}
        <Grid
          container
          spacing={3}
        >
          {/* REVENUE VS EXPENSES */}
          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          >
            <Card
              sx={{
                minHeight:
                  360,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight:
                      600,
                  }}
                >
                  Revenue vs.
                  Expenses
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color:
                      'text.secondary',

                    mt: 0.5,
                    mb: 4,
                  }}
                >
                  Current month
                  financial
                  performance.
                </Typography>

                <Stack
                  spacing={4}
                >
                  {/* REVENUE */}
                  <Box>
                    <Stack
                      sx={{
                        flexDirection:
                          'row',

                        alignItems:
                          'center',

                        justifyContent:
                          'space-between',

                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight:
                            600,
                        }}
                      >
                        Revenue
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight:
                            700,
                        }}
                      >
                        {formatCurrency(
                          revenue
                        )}
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        mt: 1,

                        height: 12,

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
                            `${revenueWidth}%`,

                          height:
                            '100%',

                          borderRadius:
                            999,

                          backgroundColor:
                            'primary.main',
                        }}
                      />
                    </Box>
                  </Box>

                  {/* EXPENSES */}
                  <Box>
                    <Stack
                      sx={{
                        flexDirection:
                          'row',

                        alignItems:
                          'center',

                        justifyContent:
                          'space-between',

                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight:
                            600,
                        }}
                      >
                        Expenses
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight:
                            700,
                        }}
                      >
                        {formatCurrency(
                          expenseTotal
                        )}
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        mt: 1,

                        height: 12,

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
                            `${expenseWidth}%`,

                          height:
                            '100%',

                          borderRadius:
                            999,

                          backgroundColor:
                            'secondary.main',
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider />

                  <Stack
                    sx={{
                      flexDirection: {
                        xs:
                          'column',
                        sm:
                          'row',
                      },

                      justifyContent:
                        'space-between',

                      gap: 2,
                    }}
                  >
                    <Box>
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
                    </Box>

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            'text.secondary',
                        }}
                      >
                        Margin
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
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* RECENT ACTIVITY */}
          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <Card
              sx={{
                minHeight:
                  360,

                height:
                  '100%',
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight:
                      600,
                  }}
                >
                  Recent Activity
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color:
                      'text.secondary',

                    mt: 0.5,
                    mb: 2,
                  }}
                >
                  Latest sales and
                  expenses.
                </Typography>

                {recentActivity.length ===
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
                      No activity
                      recorded yet.
                    </Typography>
                  </Box>
                ) : (
                  <Stack
                    divider={
                      <Divider />
                    }
                  >
                    {recentActivity.map(
                      (
                        activity
                      ) => (
                        <Stack
                          key={
                            activity.id
                          }
                          spacing={0.5}
                          sx={{
                            py: 1.5,
                          }}
                        >
                          <Stack
                            sx={{
                              flexDirection:
                                'row',

                              justifyContent:
                                'space-between',

                              alignItems:
                                'flex-start',

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
                                  activity.title
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
                                  activity.subtitle
                                }
                              </Typography>
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  700,

                                flexShrink:
                                  0,

                                color:
                                  activity.type ===
                                  'sale'
                                    ? 'success.main'
                                    : 'text.primary',
                              }}
                            >
                              {activity.type ===
                              'sale'
                                ? '+'
                                : '-'}
                              {formatCurrency(
                                activity.amount
                              )}
                            </Typography>
                          </Stack>

                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                'text.secondary',
                            }}
                          >
                            {activity.type ===
                            'sale'
                              ? 'Sale'
                              : 'Expense'}{' '}
                            ·{' '}
                            {formatDate(
                              activity.date
                            )}
                          </Typography>
                        </Stack>
                      )
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </AppShell>
  );
}