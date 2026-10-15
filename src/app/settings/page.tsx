'use client';

import {
  useState,
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
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Switch,
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

import AppShell from '@/components/AppShell';

import {
  usePaymentMethods,
  type PaymentMethod,
} from '@/context/PaymentMethodsContext';

import {
  useBusinessSettings,
  type Currency,
  type MeasurementSystem,
  type DefaultUserRole,
} from '@/context/BusinessSettingsContext';

const currencies: {
  value: Currency;
  label: string;
}[] = [
  {
    value: 'USD',
    label:
      'US Dollar (USD)',
  },
  {
    value: 'MXN',
    label:
      'Mexican Peso (MXN)',
  },
  {
    value: 'CAD',
    label:
      'Canadian Dollar (CAD)',
  },
  {
    value: 'EUR',
    label:
      'Euro (EUR)',
  },
];

const userRoles:
  DefaultUserRole[] = [
    'Admin',
    'Manager',
    'Employee',
    'Viewer',
  ];

export default function SettingsPage() {
  /*
   * BUSINESS SETTINGS
   */
  const {
    settings,
    updateSettings,
  } =
    useBusinessSettings();

  const [
    businessName,
    setBusinessName,
  ] = useState(
    settings.businessName
  );

  const [
    businessEmail,
    setBusinessEmail,
  ] = useState(
    settings.businessEmail
  );

  const [
    phone,
    setPhone,
  ] = useState(
    settings.phone
  );

  const [
    currency,
    setCurrency,
  ] = useState<Currency>(
    settings.currency
  );

  const [
    defaultTaxRate,
    setDefaultTaxRate,
  ] = useState(
    settings.defaultTaxRate
  );

  const [
    pricesIncludeTax,
    setPricesIncludeTax,
  ] = useState(
    settings.pricesIncludeTax
  );

  const [
    measurementSystem,
    setMeasurementSystem,
  ] =
    useState<MeasurementSystem>(
      settings.measurementSystem
    );

  const [
    defaultNewUserRole,
    setDefaultNewUserRole,
  ] =
    useState<DefaultUserRole>(
      settings.defaultNewUserRole
    );

  const [
    settingsMessage,
    setSettingsMessage,
  ] = useState('');

  const [
    businessEmailError,
    setBusinessEmailError,
  ] = useState('');

  /*
   * PAYMENT METHODS
   */
  const {
    paymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  } =
    usePaymentMethods();

  const [
    paymentDialogOpen,
    setPaymentDialogOpen,
  ] = useState(false);

  const [
    editingMethod,
    setEditingMethod,
  ] = useState<
    PaymentMethod | null
  >(null);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    methodToDelete,
    setMethodToDelete,
  ] = useState<
    PaymentMethod | null
  >(null);

  const [
    paymentMethodName,
    setPaymentMethodName,
  ] = useState('');

  const [
    paymentMethodActive,
    setPaymentMethodActive,
  ] = useState(true);

  const [
    paymentMethodError,
    setPaymentMethodError,
  ] = useState('');

  /*
   * BUSINESS SETTINGS
   */
  const isValidEmail = (
    email: string
  ) => {
    if (!email.trim()) {
      return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim()
    );
  };

  const handleSaveSettings =
    () => {
      setSettingsMessage('');
      setBusinessEmailError('');

      if (
        !businessName.trim()
      ) {
        return;
      }

      if (
        !isValidEmail(
          businessEmail
        )
      ) {
        setBusinessEmailError(
          'Enter a valid email address.'
        );

        return;
      }

      updateSettings({
        businessName:
          businessName.trim(),

        businessEmail:
          businessEmail
            .trim()
            .toLowerCase(),

        phone:
          phone.trim(),

        currency,

        defaultTaxRate,

        pricesIncludeTax,

        measurementSystem,

        defaultNewUserRole,
      });

      setSettingsMessage(
        'Settings saved successfully.'
      );
    };

  /*
   * PAYMENT METHOD FORM
   */
  const resetPaymentMethodForm =
    () => {
      setPaymentMethodName('');
      setPaymentMethodActive(
        true
      );
      setPaymentMethodError(
        ''
      );
      setEditingMethod(null);
    };

  const handleAddPaymentMethod =
    () => {
      resetPaymentMethodForm();

      setPaymentDialogOpen(
        true
      );
    };

  const handleEditPaymentMethod =
    (
      method: PaymentMethod
    ) => {
      setEditingMethod(
        method
      );

      setPaymentMethodName(
        method.name
      );

      setPaymentMethodActive(
        method.active
      );

      setPaymentMethodError(
        ''
      );

      setPaymentDialogOpen(
        true
      );
    };

  const handleClosePaymentMethod =
    () => {
      setPaymentDialogOpen(
        false
      );

      resetPaymentMethodForm();
    };

  const paymentMethodExists =
    (
      nameToCheck: string
    ) => {
      const normalized =
        nameToCheck
          .trim()
          .toLowerCase();

      return paymentMethods.some(
        (method) =>
          method.name
            .trim()
            .toLowerCase() ===
            normalized &&
          method.id !==
            editingMethod?.id
      );
    };

  const handleSavePaymentMethod =
    () => {
      const cleanName =
        paymentMethodName.trim();

      setPaymentMethodError(
        ''
      );

      if (!cleanName) {
        return;
      }

      if (
        paymentMethodExists(
          cleanName
        )
      ) {
        setPaymentMethodError(
          'This payment method already exists.'
        );

        return;
      }

      if (editingMethod) {
        updatePaymentMethod({
          ...editingMethod,

          name:
            cleanName,

          active:
            paymentMethodActive,
        });
      } else {
        addPaymentMethod({
          name:
            cleanName,

          active:
            paymentMethodActive,
        });
      }

      setPaymentDialogOpen(
        false
      );

      resetPaymentMethodForm();
    };

  /*
   * DELETE PAYMENT METHOD
   */
  const handleDeleteRequest =
    (
      method: PaymentMethod
    ) => {
      setMethodToDelete(
        method
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

      setMethodToDelete(
        null
      );
    };

  const handleDeleteConfirm =
    () => {
      if (!methodToDelete) {
        return;
      }

      deletePaymentMethod(
        methodToDelete.id
      );

      setDeleteDialogOpen(
        false
      );

      setMethodToDelete(
        null
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

                fontWeight:
                  700,
              }}
            >
              Settings
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 0.5,

                color:
                  'text.secondary',
              }}
            >
              Manage Milo +
              Marley Business
              Manager preferences.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={
              <SaveIcon />
            }
            onClick={
              handleSaveSettings
            }
            disabled={
              !businessName.trim()
            }
          >
            Save Settings
          </Button>
        </Stack>

        {settingsMessage && (
          <Alert
            severity="success"
            onClose={() =>
              setSettingsMessage(
                ''
              )
            }
          >
            {
              settingsMessage
            }
          </Alert>
        )}

        {/* BUSINESS INFORMATION */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  600,
              }}
            >
              Business Information
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
              Basic information
              used throughout the
              Business Manager.
            </Typography>

            <Stack
              spacing={3}
            >
              <TextField
                label="Business Name"
                value={
                  businessName
                }
                onChange={(
                  event
                ) =>
                  setBusinessName(
                    event.target
                      .value
                  )
                }
                required
                fullWidth
              />

              <Box
                sx={{
                  display:
                    'grid',

                  gridTemplateColumns:
                    {
                      xs: '1fr',
                      md: '1fr 1fr',
                    },

                  gap: 2,
                }}
              >
                <TextField
                  label="Business Email"
                  type="email"
                  value={
                    businessEmail
                  }
                  onChange={(
                    event
                  ) => {
                    setBusinessEmail(
                      event.target
                        .value
                    );

                    if (
                      businessEmailError
                    ) {
                      setBusinessEmailError(
                        ''
                      );
                    }
                  }}
                  fullWidth
                  error={
                    Boolean(
                      businessEmailError
                    )
                  }
                  helperText={
                    businessEmailError
                  }
                />

                <TextField
                  label="Phone"
                  value={
                    phone
                  }
                  onChange={(
                    event
                  ) =>
                    setPhone(
                      event.target
                        .value
                    )
                  }
                  fullWidth
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* FINANCIAL SETTINGS */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  600,
              }}
            >
              Financial Settings
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
              Configure currency
              and tax behavior for
              sales and reports.
            </Typography>

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
                      md: '1fr 1fr',
                    },

                  gap: 2,
                }}
              >
                <TextField
                  select
                  label="Currency"
                  value={
                    currency
                  }
                  onChange={(
                    event
                  ) =>
                    setCurrency(
                      event.target
                        .value as Currency
                    )
                  }
                  fullWidth
                >
                  {currencies.map(
                    (
                      option
                    ) => (
                      <MenuItem
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </MenuItem>
                    )
                  )}
                </TextField>

                <TextField
                  label="Default Tax Rate"
                  type="number"
                  value={
                    defaultTaxRate
                  }
                  onChange={(
                    event
                  ) =>
                    setDefaultTaxRate(
                      Math.max(
                        0,
                        Number(
                          event
                            .target
                            .value
                        )
                      )
                    )
                  }
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: 100,
                      step: 0.01,
                    },
                  }}
                  helperText="Enter the tax percentage, for example 8.25."
                />
              </Box>

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
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight:
                          500,
                      }}
                    >
                      Prices include
                      tax
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          'text.secondary',
                      }}
                    >
                      Turn this on
                      if product
                      prices already
                      include sales
                      tax.
                    </Typography>
                  </Box>

                  <Switch
                    checked={
                      pricesIncludeTax
                    }
                    onChange={(
                      event
                    ) =>
                      setPricesIncludeTax(
                        event.target
                          .checked
                      )
                    }
                  />
                </Stack>
              </Box>

              <TextField
                select
                label="Measurement System"
                value={
                  measurementSystem
                }
                onChange={(
                  event
                ) =>
                  setMeasurementSystem(
                    event.target
                      .value as MeasurementSystem
                  )
                }
                fullWidth
                helperText="Used as the default when working with ingredient quantities and weights."
              >
                <MenuItem
                  value="us"
                >
                  US Customary
                  (oz / lb)
                </MenuItem>

                <MenuItem
                  value="metric"
                >
                  Metric
                  (g / kg)
                </MenuItem>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {/* USER DEFAULTS */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  600,
              }}
            >
              User Defaults
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
              Choose the default
              role assigned when a
              new team member is
              created.
            </Typography>

            <TextField
              select
              label="Default New User Role"
              value={
                defaultNewUserRole
              }
              onChange={(
                event
              ) =>
                setDefaultNewUserRole(
                  event.target
                    .value as DefaultUserRole
                )
              }
              fullWidth
            >
              {userRoles.map(
                (role) => (
                  <MenuItem
                    key={
                      role
                    }
                    value={
                      role
                    }
                  >
                    {role}
                  </MenuItem>
                )
              )}
            </TextField>
          </CardContent>
        </Card>

        {/* PAYMENT METHODS */}
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
                  xs: 'stretch',
                  sm: 'center',
                },

                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight:
                      600,
                  }}
                >
                  Payment Methods
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,

                    color:
                      'text.secondary',
                  }}
                >
                  Manage payment
                  methods available
                  in Sales and
                  Expenses.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={
                  <AddIcon />
                }
                onClick={
                  handleAddPaymentMethod
                }
              >
                Add Payment Method
              </Button>
            </Stack>

            <Divider
              sx={{
                mb: 2,
              }}
            />

            {paymentMethods.length ===
            0 ? (
              <Box
                sx={{
                  py: 5,

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
                  No payment methods
                  have been added.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Payment Method
                      </TableCell>

                      <TableCell>
                        Status
                      </TableCell>

                      <TableCell
                        align="right"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paymentMethods.map(
                      (method) => (
                        <TableRow
                          key={
                            method.id
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
                                method.name
                              }
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                method.active
                                  ? 'Active'
                                  : 'Inactive'
                              }
                              color={
                                method.active
                                  ? 'success'
                                  : 'default'
                              }
                              variant={
                                method.active
                                  ? 'filled'
                                  : 'outlined'
                              }
                            />
                          </TableCell>

                          <TableCell
                            align="right"
                          >
                            <IconButton
                              aria-label={`Edit ${method.name}`}
                              onClick={() =>
                                handleEditPaymentMethod(
                                  method
                                )
                              }
                            >
                              <EditIcon />
                            </IconButton>

                            <IconButton
                              aria-label={`Delete ${method.name}`}
                              color="error"
                              onClick={() =>
                                handleDeleteRequest(
                                  method
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

      {/* ADD / EDIT PAYMENT METHOD */}
      <Dialog
        open={
          paymentDialogOpen
        }
        onClose={
          handleClosePaymentMethod
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {editingMethod
            ? 'Edit Payment Method'
            : 'Add Payment Method'}
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={3}
            sx={{
              mt: 1,
            }}
          >
            <TextField
              label="Payment Method"
              value={
                paymentMethodName
              }
              onChange={(
                event
              ) => {
                setPaymentMethodName(
                  event.target
                    .value
                );

                if (
                  paymentMethodError
                ) {
                  setPaymentMethodError(
                    ''
                  );
                }
              }}
              required
              fullWidth
              error={
                Boolean(
                  paymentMethodError
                )
              }
              helperText={
                paymentMethodError
              }
            />

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
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight:
                        500,
                    }}
                  >
                    Active
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    Inactive methods
                    won't appear in
                    new transactions.
                  </Typography>
                </Box>

                <Switch
                  checked={
                    paymentMethodActive
                  }
                  onChange={(
                    event
                  ) =>
                    setPaymentMethodActive(
                      event.target
                        .checked
                    )
                  }
                />
              </Stack>
            </Box>
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
              handleClosePaymentMethod
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSavePaymentMethod
            }
            disabled={
              !paymentMethodName.trim()
            }
          >
            {editingMethod
              ? 'Save Changes'
              : 'Add Payment Method'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE PAYMENT METHOD */}
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
          Delete Payment Method?
        </DialogTitle>

        <DialogContent>
          <Typography>
            You are about to delete{' '}
            <strong>
              {
                methodToDelete?.name
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
            This payment method
            will no longer appear
            in new Sales or
            Expenses.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 1,

              color:
                'text.secondary',
            }}
          >
            Historical records
            will keep the payment
            method they were
            originally created
            with.
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
            Delete Payment Method
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}