'use client';

import {
  useMemo,
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
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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

type Sale = {
  id: number;
  date: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  paymentMethod: string;
  customer: string;
  notes: string;
};

export default function SalesPage() {
  const {
    products,
  } = useProducts();

  const {
    paymentMethods,
  } = usePaymentMethods();

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

  const [
    sales,
    setSales,
  ] = useState<Sale[]>([]);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    date,
    setDate,
  ] = useState('');

  const [
    productId,
    setProductId,
  ] = useState<number | ''>('');

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

  const [
    customer,
    setCustomer,
  ] = useState('');

  const [
    notes,
    setNotes,
  ] = useState('');

  const selectedProduct =
    products.find(
      (product) =>
        product.id === productId
    );

  const total =
    useMemo(() => {
      return (
        quantity *
        unitPrice
      );
    }, [
      quantity,
      unitPrice,
    ]);

  const totalSales =
    useMemo(() => {
      return sales.reduce(
        (
          sum,
          sale
        ) =>
          sum +
          sale.quantity *
            sale.unitPrice,
        0
      );
    }, [sales]);

  const resetForm = () => {
    setDate('');
    setProductId('');
    setQuantity(1);
    setUnitPrice(0);
    setPaymentMethod('');
    setCustomer('');
    setNotes('');
  };

  const handleOpen = () => {
    resetForm();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSave = () => {
    if (
      !date ||
      !productId ||
      !selectedProduct ||
      quantity <= 0 ||
      unitPrice <= 0
    ) {
      return;
    }

    const newSale: Sale = {
      id: Date.now(),

      date,

      productId:
        selectedProduct.id,

      productName:
        selectedProduct.name,

      quantity,

      unitPrice,

      paymentMethod,

      customer:
        customer.trim(),

      notes:
        notes.trim(),
    };

    setSales(
      (
        currentSales
      ) => [
        newSale,
        ...currentSales,
      ]
    );

    setOpen(false);
    resetForm();
  };

  const handleDelete = (
    id: number
  ) => {
    setSales(
      (
        currentSales
      ) =>
        currentSales.filter(
          (sale) =>
            sale.id !== id
        )
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

                fontWeight: 700,
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
              Add and manage
              Milo + Marley sales.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            onClick={
              handleOpen
            }
          >
            Add Sale
          </Button>
        </Stack>

        {/* TOTAL SALES */}
        <Card>
          <CardContent>
            <Typography
              variant="body2"
              sx={{
                color:
                  'text.secondary',
              }}
            >
              Total Sales
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,

                color:
                  'primary.main',

                fontWeight: 700,
              }}
            >
              $
              {totalSales.toFixed(
                2
              )}
            </Typography>
          </CardContent>
        </Card>

        {/* SALES TABLE */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                mb: 2,

                fontWeight: 600,
              }}
            >
              Sales history
            </Typography>

            {sales.length ===
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
                  been added yet.
                </Typography>
              </Box>
            ) : (
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
                        Qty
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

                      <TableCell
                        align="right"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {sales.map(
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
                            {sale.paymentMethod ||
                              '—'}
                          </TableCell>

                          <TableCell>
                            {sale.customer ||
                              '—'}
                          </TableCell>

                          <TableCell
                            align="right"
                          >
                            <IconButton
                              aria-label="Delete sale"
                              color="error"
                              onClick={() =>
                                handleDelete(
                                  sale.id
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
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* ADD SALE DIALOG */}
      <Dialog
        open={open}
        onClose={
          handleClose
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
              value={productId}
              onChange={(
                event
              ) => {
                const selectedId =
                  Number(
                    event.target
                      .value
                  );

                setProductId(
                  selectedId
                );

                const selected =
                  products.find(
                    (product) =>
                      product.id ===
                      selectedId
                  );

                if (selected) {
                  setUnitPrice(
                    selected.price
                  );
                }
              }}
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

            {/* QUANTITY + UNIT PRICE */}
            <Box
              sx={{
                display: 'grid',

                gridTemplateColumns: {
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

            <TextField
              label="Total"
              value={`$${total.toFixed(
                2
              )}`}
              disabled
              fullWidth
            />

            <TextField
              select
              label="Payment Method"
              value={
                paymentMethod
              }
              onChange={(
                event
              ) =>
                setPaymentMethod(
                  event.target
                    .value
                )
              }
              fullWidth
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
              value={notes}
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
              handleClose
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
              !date ||
              !productId ||
              quantity <= 0 ||
              unitPrice <= 0
            }
          >
            Save Sale
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}