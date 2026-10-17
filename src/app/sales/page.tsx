'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import AppShell from '@/components/AppShell';

import {
  useProducts,
} from '@/context/ProductsContext';

import {
  usePaymentMethods,
} from '@/context/PaymentMethodsContext';

import {
  useSales,
  type Sale,
} from '@/context/SalesContext';

import {
  useSalesSessions,
} from '@/context/SalesSessionsContext';

const SALES_PER_PAGE = 10;

const getTodayDate = () => {
  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      '0'
    );

  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      '0'
    );

  return `${year}-${month}-${day}`;
};

export default function SalesPage() {
  const {
    products,
  } = useProducts();

  const {
    paymentMethods,
  } = usePaymentMethods();

  const {
    sales,
    addSale,
    deleteSale,
  } = useSales();

  const {
    activeSession,
    startSession,
    closeSession,
  } = useSalesSessions();

  const activeProducts =
    products.filter(
      (product) =>
        product.active
    );

  const activePaymentMethods =
    paymentMethods.filter(
      (method) =>
        method.active
    );

  /*
   * CURRENT SESSION SALES
   */
  const currentSessionSales =
    useMemo(() => {
      if (!activeSession) {
        return [];
      }

      return sales.filter(
        (sale) =>
          sale.sessionId ===
          activeSession.id
      );
    }, [
      sales,
      activeSession,
    ]);

  /*
   * PAGINATION
   */
  const [
    salesPage,
    setSalesPage,
  ] = useState(0);

  const paginatedSessionSales =
    useMemo(() => {
      const start =
        salesPage *
        SALES_PER_PAGE;

      const end =
        start +
        SALES_PER_PAGE;

      return currentSessionSales.slice(
        start,
        end
      );
    }, [
      currentSessionSales,
      salesPage,
    ]);

  useEffect(() => {
    setSalesPage(0);
  }, [
    activeSession?.id,
  ]);

  useEffect(() => {
    const maxPage =
      Math.max(
        0,
        Math.ceil(
          currentSessionSales.length /
            SALES_PER_PAGE
        ) - 1
      );

    if (
      salesPage >
      maxPage
    ) {
      setSalesPage(
        maxPage
      );
    }
  }, [
    currentSessionSales.length,
    salesPage,
  ]);

  /*
   * DIALOGS
   */
  const [
    saleDialogOpen,
    setSaleDialogOpen,
  ] = useState(false);

  const [
    startSessionDialogOpen,
    setStartSessionDialogOpen,
  ] = useState(false);

  const [
    closeSessionDialogOpen,
    setCloseSessionDialogOpen,
  ] = useState(false);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    saleToDelete,
    setSaleToDelete,
  ] = useState<Sale | null>(
    null
  );

  const hasPromptedForSession =
    useRef(false);

  /*
   * FORM
   */
  const [
    date,
    setDate,
  ] = useState(
    getTodayDate()
  );

  const [
    productId,
    setProductId,
  ] = useState<number | ''>(
    ''
  );

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    unitPrice,
    setUnitPrice,
  ] = useState(0);

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState('');

  /*
   * NEW:
   * Used when payment method
   * is "Other".
   */
  const [
    otherPaymentMethod,
    setOtherPaymentMethod,
  ] = useState('');

  const [
    customer,
    setCustomer,
  ] = useState('');

  const [
    notes,
    setNotes,
  ] = useState('');

  /*
   * SESSION PROMPT
   */
  useEffect(() => {
    if (
      !activeSession &&
      !hasPromptedForSession.current
    ) {
      hasPromptedForSession.current =
        true;

      setStartSessionDialogOpen(
        true
      );
    }
  }, [activeSession]);

  /*
   * SELECTED PRODUCT
   */
  const selectedProduct =
    useMemo(() => {
      if (
        productId === ''
      ) {
        return null;
      }

      return (
        products.find(
          (product) =>
            product.id ===
            productId
        ) ?? null
      );
    }, [
      productId,
      products,
    ]);

  /*
   * PAYMENT METHOD
   */
  const isOtherPaymentMethod =
    paymentMethod === 'Other';

  const finalPaymentMethod =
    isOtherPaymentMethod
      ? otherPaymentMethod.trim()
      : paymentMethod;

  /*
   * NEW SALE TOTAL
   */
  const saleTotal =
    useMemo(() => {
      return (
        quantity *
        unitPrice
      );
    }, [
      quantity,
      unitPrice,
    ]);

  /*
   * SESSION SUMMARY
   */
  const sessionTransactionCount =
    currentSessionSales.length;

  const sessionItemCount =
    useMemo(() => {
      return currentSessionSales.reduce(
        (
          total,
          sale
        ) =>
          total +
          sale.quantity,
        0
      );
    }, [
      currentSessionSales,
    ]);

  const sessionTotal =
    useMemo(() => {
      return currentSessionSales.reduce(
        (
          total,
          sale
        ) =>
          total +
          sale.quantity *
            sale.unitPrice,
        0
      );
    }, [
      currentSessionSales,
    ]);

  /*
   * PAYMENT BREAKDOWN
   */
  const paymentSummary =
    useMemo(() => {
      const totals:
        Record<
          string,
          number
        > = {};

      currentSessionSales.forEach(
        (sale) => {
          const saleAmount =
            sale.quantity *
            sale.unitPrice;

          totals[
            sale.paymentMethod
          ] =
            (
              totals[
                sale.paymentMethod
              ] ?? 0
            ) +
            saleAmount;
        }
      );

      return Object.entries(
        totals
      ).sort(
        (
          [, amountA],
          [, amountB]
        ) =>
          amountB -
          amountA
      );
    }, [
      currentSessionSales,
    ]);

  /*
   * RESET FORM
   */
  const resetForm = () => {
    setDate(
      getTodayDate()
    );

    setProductId('');

    setQuantity(1);

    setUnitPrice(0);

    setPaymentMethod('');

    setOtherPaymentMethod('');

    setCustomer('');

    setNotes('');
  };

  /*
   * START SESSION
   */
  const handleStartSession =
    () => {
      startSession();

      setStartSessionDialogOpen(
        false
      );
    };

  const handleStartSessionRequest =
    () => {
      setStartSessionDialogOpen(
        true
      );
    };

  /*
   * ADD SALE
   */
  const handleAdd = () => {
    if (!activeSession) {
      setStartSessionDialogOpen(
        true
      );

      return;
    }

    resetForm();

    setSaleDialogOpen(
      true
    );
  };

  const handleCloseSaleDialog =
    () => {
      setSaleDialogOpen(
        false
      );

      resetForm();
    };

  /*
   * PRODUCT
   */
  const handleProductChange =
    (
      selectedId: number
    ) => {
      setProductId(
        selectedId
      );

      const product =
        products.find(
          (item) =>
            item.id ===
            selectedId
        );

      if (product) {
        setUnitPrice(
          product.price
        );
      } else {
        setUnitPrice(0);
      }
    };

  /*
   * PAYMENT METHOD CHANGE
   */
  const handlePaymentMethodChange =
    (
      newPaymentMethod: string
    ) => {
      setPaymentMethod(
        newPaymentMethod
      );

      if (
        newPaymentMethod !==
        'Other'
      ) {
        setOtherPaymentMethod(
          ''
        );
      }
    };

  /*
   * SAVE SALE
   */
  const handleSave = () => {
    if (
      !activeSession ||
      !date ||
      !selectedProduct ||
      quantity <= 0 ||
      unitPrice < 0 ||
      !paymentMethod ||
      !finalPaymentMethod
    ) {
      return;
    }

    addSale({
      date,

      productId:
        selectedProduct.id,

      productName:
        selectedProduct.name,

      quantity,

      unitPrice,

      paymentMethod:
        finalPaymentMethod,

      customer:
        customer.trim(),

      notes:
        notes.trim(),
    });

    setSaleDialogOpen(
      false
    );

    resetForm();
  };

  /*
   * CLOSE SESSION
   */
  const handleCloseSessionRequest =
    () => {
      if (!activeSession) {
        return;
      }

      setCloseSessionDialogOpen(
        true
      );
    };

  const handleCloseSessionCancel =
    () => {
      setCloseSessionDialogOpen(
        false
      );
    };

  const handleCloseSessionConfirm =
    () => {
      if (!activeSession) {
        return;
      }

      closeSession();

      setCloseSessionDialogOpen(
        false
      );
    };

  /*
   * DELETE SALE
   */
  const handleDeleteRequest =
    (
      sale: Sale
    ) => {
      setSaleToDelete(
        sale
      );

      setDeleteDialogOpen(
        true
      );
    };

  const handleDeleteCancel =
    () => {
      setDeleteDialogOpen(
        false
      );

      setSaleToDelete(
        null
      );
    };

  const handleDeleteConfirm =
    () => {
      if (!saleToDelete) {
        return;
      }

      deleteSale(
        saleToDelete.id
      );

      setDeleteDialogOpen(
        false
      );

      setSaleToDelete(
        null
      );
    };

  /*
   * PAGINATION
   */
  const handleSalesPageChange =
    (
      event:
        | React.MouseEvent<HTMLButtonElement>
        | null,
      newPage: number
    ) => {
      setSalesPage(
        newPage
      );
    };

  /*
   * VALIDATION
   */
  const formValid =
    Boolean(
      activeSession &&
        date &&
        selectedProduct &&
        quantity > 0 &&
        unitPrice >= 0 &&
        paymentMethod &&
        finalPaymentMethod
    );

  return (
    <AppShell>
      <Stack spacing={4}>
        {/* HEADER */}
        <Stack
          spacing={2}
          sx={{
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },

            justifyContent:
              'space-between',

            alignItems: {
              xs: 'stretch',
              sm: 'center',
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
              Sales
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 0.5,

                color:
                  'text.secondary',
              }}
            >
              Record and manage
              Milo + Marley sales.
            </Typography>
          </Box>

          {activeSession ? (
            <Stack
              spacing={1.5}
              sx={{
                flexDirection: {
                  xs: 'column',
                  sm: 'row',
                },

                alignItems:
                  'stretch',
              }}
            >
              <Button
                variant="contained"
                startIcon={
                  <AddIcon />
                }
                onClick={
                  handleAdd
                }
              >
                Add Sale
              </Button>

              <Button
                variant="contained"
                onClick={
                  handleCloseSessionRequest
                }
                sx={{
                  backgroundColor:
                    '#9B4935',

                  '&:hover': {
                    backgroundColor:
                      '#7F3B2B',
                  },
                }}
              >
                Close Session
              </Button>
            </Stack>
          ) : (
            <Button
              variant="contained"
              onClick={
                handleStartSessionRequest
              }
            >
              Start Session
            </Button>
          )}
        </Stack>

        {/* SESSION STATUS */}
        <Card>
          <CardContent>
            <Stack
              spacing={2}
              sx={{
                flexDirection: {
                  xs: 'column',
                  sm: 'row',
                },

                justifyContent:
                  'space-between',

                alignItems: {
                  xs: 'flex-start',
                  sm: 'center',
                },
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
                  Current Session
                </Typography>

                {activeSession ? (
                  <>
                    <Typography
                      variant="h6"
                      sx={{
                        mt: 0.5,

                        fontWeight:
                          700,

                        color:
                          'success.main',
                      }}
                    >
                      Session Active
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,

                        color:
                          'text.secondary',
                      }}
                    >
                      Opened{' '}
                      {new Date(
                        activeSession.openedAt
                      ).toLocaleString()}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography
                      variant="h6"
                      sx={{
                        mt: 0.5,

                        fontWeight:
                          700,

                        color:
                          'text.secondary',
                      }}
                    >
                      No Active
                      Session
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,

                        color:
                          'text.secondary',
                      }}
                    >
                      Start a session
                      to begin
                      recording sales.
                    </Typography>
                  </>
                )}
              </Box>

              {activeSession && (
                <Box
                  sx={{
                    textAlign: {
                      xs: 'left',
                      sm: 'right',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    Current Session
                    Sales
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mt: 0.5,

                      color:
                        'primary.main',

                      fontWeight:
                        700,
                    }}
                  >
                    $
                    {sessionTotal.toFixed(
                      2
                    )}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* SESSION SUMMARY */}
        {activeSession && (
          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns:
                {
                  xs: '1fr',

                  sm:
                    'repeat(3, 1fr)',
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
                  Transactions
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    mt: 0.5,

                    color:
                      'primary.main',

                    fontWeight:
                      700,
                  }}
                >
                  {
                    sessionTransactionCount
                  }
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
                  Items Sold
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    mt: 0.5,

                    color:
                      'primary.main',

                    fontWeight:
                      700,
                  }}
                >
                  {
                    sessionItemCount
                  }
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
                  Sales Total
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    mt: 0.5,

                    color:
                      'primary.main',

                    fontWeight:
                      700,
                  }}
                >
                  $
                  {sessionTotal.toFixed(
                    2
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* CURRENT SESSION SALES */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                mb: 2,

                fontWeight:
                  600,
              }}
            >
              Current Session Sales
            </Typography>

            {!activeSession ? (
              <Box
                sx={{
                  py: 6,

                  textAlign:
                    'center',
                }}
              >
                <Typography
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  There is no active
                  sales session.
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,

                    color:
                      'text.secondary',
                  }}
                >
                  Start a new session
                  from the button
                  above to begin
                  recording sales.
                </Typography>
              </Box>
            ) : currentSessionSales.length ===
              0 ? (
              <Box
                sx={{
                  py: 6,

                  textAlign:
                    'center',
                }}
              >
                <Typography
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  No sales have
                  been recorded in
                  this session yet.
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
                          Product
                        </TableCell>

                        <TableCell
                          align="right"
                        >
                          Quantity
                        </TableCell>

                        <TableCell
                          align="right"
                        >
                          Unit Price
                        </TableCell>

                        <TableCell
                          align="right"
                        >
                          Total
                        </TableCell>

                        <TableCell>
                          Payment
                        </TableCell>

                        <TableCell>
                          Customer
                        </TableCell>

                        {/* NEW */}
                        <TableCell>
                          Notes
                        </TableCell>

                        <TableCell
                          align="right"
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedSessionSales.map(
                        (sale) => (
                          <TableRow
                            key={
                              sale.id
                            }
                          >
                            <TableCell>
                              {
                                sale.date
                              }
                            </TableCell>

                            <TableCell>
                              {
                                sale.productName
                              }
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              {
                                sale.quantity
                              }
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              $
                              {sale.unitPrice.toFixed(
                                2
                              )}
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                fontWeight:
                                  600,
                              }}
                            >
                              $
                              {(
                                sale.quantity *
                                sale.unitPrice
                              ).toFixed(
                                2
                              )}
                            </TableCell>

                            <TableCell>
                              {
                                sale.paymentMethod
                              }
                            </TableCell>

                            <TableCell>
                              {sale.customer ||
                                '—'}
                            </TableCell>

                            {/* NEW */}
                            <TableCell
                              sx={{
                                maxWidth:
                                  240,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  overflow:
                                    'hidden',

                                  textOverflow:
                                    'ellipsis',

                                  whiteSpace:
                                    'nowrap',
                                }}
                                title={
                                  sale.notes
                                }
                              >
                                {sale.notes ||
                                  '—'}
                              </Typography>
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              <IconButton
                                aria-label="Delete sale"
                                color="error"
                                onClick={() =>
                                  handleDeleteRequest(
                                    sale
                                  )
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {currentSessionSales.length >
                  SALES_PER_PAGE && (
                  <TablePagination
                    component="div"
                    count={
                      currentSessionSales.length
                    }
                    page={
                      salesPage
                    }
                    onPageChange={
                      handleSalesPageChange
                    }
                    rowsPerPage={
                      SALES_PER_PAGE
                    }
                    rowsPerPageOptions={[
                      SALES_PER_PAGE,
                    ]}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* START SESSION */}
      <Dialog
        open={
          startSessionDialogOpen
        }
        onClose={() =>
          setStartSessionDialogOpen(
            false
          )
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Start Sales Session?
        </DialogTitle>

        <DialogContent>
          <Typography>
            Start a new sales
            session to begin
            recording sales.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 1.5,

              color:
                'text.secondary',
            }}
          >
            Sales cannot be added
            until a session is
            active.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={() =>
              setStartSessionDialogOpen(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleStartSession
            }
          >
            Start Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD SALE */}
      <Dialog
        open={
          saleDialogOpen
        }
        onClose={
          handleCloseSaleDialog
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Add Sale
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={3}
            sx={{
              mt: 1,
            }}
          >
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(
                event
              ) =>
                setDate(
                  event.target
                    .value
                )
              }
              fullWidth
              required
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              select
              label="Product"
              value={
                productId
              }
              onChange={(
                event
              ) =>
                handleProductChange(
                  Number(
                    event.target
                      .value
                  )
                )
              }
              fullWidth
              required
            >
              {activeProducts.map(
                (product) => (
                  <MenuItem
                    key={
                      product.id
                    }
                    value={
                      product.id
                    }
                  >
                    {
                      product.name
                    }
                  </MenuItem>
                )
              )}
            </TextField>

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

                alignItems:
                  'start',
              }}
            >
              <TextField
                label="Quantity"
                type="number"
                value={
                  quantity
                }
                onChange={(
                  event
                ) =>
                  setQuantity(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                fullWidth
                required
                slotProps={{
                  htmlInput: {
                    min: 1,
                    step: 1,
                  },
                }}
              />

              <TextField
                label="Unit Price"
                type="number"
                value={
                  unitPrice
                }
                onChange={(
                  event
                ) =>
                  setUnitPrice(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                fullWidth
                required
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: 0.01,
                  },
                }}
              />
            </Box>

            {/* TOTAL */}
            <Box
              sx={{
                p: 2,

                border:
                  '1px solid',

                borderColor:
                  'divider',

                borderRadius:
                  2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color:
                    'text.secondary',
                }}
              >
                Sale Total
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
                $
                {saleTotal.toFixed(
                  2
                )}
              </Typography>
            </Box>

            <TextField
              select
              label="Payment Method"
              value={
                paymentMethod
              }
              onChange={(
                event
              ) =>
                handlePaymentMethodChange(
                  event.target
                    .value
                )
              }
              fullWidth
              required
            >
              {activePaymentMethods.map(
                (method) => (
                  <MenuItem
                    key={
                      method.id
                    }
                    value={
                      method.name
                    }
                  >
                    {
                      method.name
                    }
                  </MenuItem>
                )
              )}
            </TextField>

            {/* NEW:
                OTHER PAYMENT METHOD */}
            {isOtherPaymentMethod && (
              <TextField
                label="Specify Payment Method"
                value={
                  otherPaymentMethod
                }
                onChange={(
                  event
                ) =>
                  setOtherPaymentMethod(
                    event.target
                      .value
                  )
                }
                fullWidth
                required
                helperText="Enter the payment method used for this sale."
              />
            )}

            <TextField
              label="Customer"
              value={
                customer
              }
              onChange={(
                event
              ) =>
                setCustomer(
                  event.target
                    .value
                )
              }
              fullWidth
            />

            <TextField
              label="Notes"
              value={
                notes
              }
              onChange={(
                event
              ) =>
                setNotes(
                  event.target
                    .value
                )
              }
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={
              handleCloseSaleDialog
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSave
            }
            disabled={
              !formValid
            }
          >
            Add Sale
          </Button>
        </DialogActions>
      </Dialog>

      {/* CLOSE SESSION */}
      <Dialog
        open={
          closeSessionDialogOpen
        }
        onClose={
          handleCloseSessionCancel
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Close Session?
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body1"
            sx={{
              mb: 3,

              color:
                'text.secondary',
            }}
          >
            Review the session
            summary before closing.
          </Typography>

          <Stack spacing={2}>
            <Stack
              sx={{
                flexDirection:
                  'row',

                justifyContent:
                  'space-between',

                alignItems:
                  'center',
              }}
            >
              <Typography>
                Sales transactions
              </Typography>

              <Typography
                sx={{
                  fontWeight:
                    700,
                }}
              >
                {
                  sessionTransactionCount
                }
              </Typography>
            </Stack>

            <Stack
              sx={{
                flexDirection:
                  'row',

                justifyContent:
                  'space-between',

                alignItems:
                  'center',
              }}
            >
              <Typography>
                Items sold
              </Typography>

              <Typography
                sx={{
                  fontWeight:
                    700,
                }}
              >
                {
                  sessionItemCount
                }
              </Typography>
            </Stack>

            <Divider />

            <Stack
              sx={{
                flexDirection:
                  'row',

                justifyContent:
                  'space-between',

                alignItems:
                  'center',
              }}
            >
              <Typography
                sx={{
                  fontWeight:
                    600,
                }}
              >
                Total sales
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight:
                    700,

                  color:
                    'primary.main',
                }}
              >
                $
                {sessionTotal.toFixed(
                  2
                )}
              </Typography>
            </Stack>

            {paymentSummary.length >
              0 && (
              <>
                <Divider />

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,

                      fontWeight:
                        700,
                    }}
                  >
                    Payment Methods
                  </Typography>

                  <Stack
                    spacing={1}
                  >
                    {paymentSummary.map(
                      ([
                        method,
                        amount,
                      ]) => (
                        <Stack
                          key={
                            method
                          }
                          sx={{
                            flexDirection:
                              'row',

                            justifyContent:
                              'space-between',

                            alignItems:
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
                            {
                              method
                            }
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                600,
                            }}
                          >
                            $
                            {amount.toFixed(
                              2
                            )}
                          </Typography>
                        </Stack>
                      )
                    )}
                  </Stack>
                </Box>
              </>
            )}
          </Stack>

          <Typography
            variant="body2"
            sx={{
              mt: 3,

              color:
                'text.secondary',
            }}
          >
            Once this session is
            closed, new sales will
            require a new session.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={
              handleCloseSessionCancel
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleCloseSessionConfirm
            }
            sx={{
              backgroundColor:
                '#9B4935',

              '&:hover': {
                backgroundColor:
                  '#7F3B2B',
              },
            }}
          >
            Close Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE SALE */}
      <Dialog
        open={
          deleteDialogOpen
        }
        onClose={
          handleDeleteCancel
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Delete Sale?
        </DialogTitle>

        <DialogContent>
          <Typography>
            You are about to
            delete the sale for{' '}
            <strong>
              {
                saleToDelete?.productName
              }
            </strong>
            .
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 1.5,

              color:
                'text.secondary',
            }}
          >
            This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={
              handleDeleteCancel
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={
              handleDeleteConfirm
            }
          >
            Delete Sale
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}