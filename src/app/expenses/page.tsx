'use client';

import {
  useMemo,
  useState,
  type ChangeEvent,
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
import AttachFileIcon from '@mui/icons-material/AttachFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import * as XLSX from 'xlsx';

import AppShell from '@/components/AppShell';

import {
  usePaymentMethods,
} from '@/context/PaymentMethodsContext';

import {
  useExpenses,
  type Expense,
  type NewExpense,
} from '@/context/ExpensesContext';

type ImportedExpense =
  NewExpense & {
    rowNumber: number;
    valid: boolean;
    errors: string[];
  };

const categories = [
  'Ingredients',
  'Packaging',
  'Equipment',
  'Utilities',
  'Marketing',
  'Shipping',
  'Fees',
  'Licenses',
  'Other',
];

const pieceUnits = [
  {
    value: 'piece',
    label: 'Pieces',
  },
];

const weightUnits = [
  {
    value: 'oz',
    label: 'Ounces (oz)',
  },
  {
    value: 'lb',
    label: 'Pounds (lb)',
  },
  {
    value: 'g',
    label: 'Grams (g)',
  },
  {
    value: 'kg',
    label: 'Kilograms (kg)',
  },
];

const requiredImportColumns = [
  'category',
  'description',
  'amount',
  'payment method',
];

const normalizeHeader = (
  value: string
) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
};

const normalizeValue = (
  value: unknown
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  return String(value).trim();
};

const parseBoolean = (
  value: unknown
) => {
  const normalized =
    normalizeValue(
      value
    ).toLowerCase();

  return [
    'true',
    'yes',
    'y',
    '1',
  ].includes(normalized);
};

const parseAmount = (
  value: unknown
) => {
  if (
    typeof value ===
    'number'
  ) {
    return value;
  }

  const cleaned =
    normalizeValue(value)
      .replace(/\$/g, '')
      .replace(/,/g, '');

  const parsed =
    Number(cleaned);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
};

const parseExcelDate = (
  value: unknown
) => {
  if (!value) {
    return '';
  }

  if (
    typeof value ===
    'number'
  ) {
    const parsed =
      XLSX.SSF.parse_date_code(
        value
      );

    if (parsed) {
      const month =
        String(
          parsed.m
        ).padStart(
          2,
          '0'
        );

      const day =
        String(
          parsed.d
        ).padStart(
          2,
          '0'
        );

      return `${parsed.y}-${month}-${day}`;
    }
  }

  const stringValue =
    normalizeValue(value);

  if (!stringValue) {
    return '';
  }

  const parsedDate =
    new Date(
      stringValue
    );

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return stringValue;
  }

  return parsedDate
    .toISOString()
    .slice(0, 10);
};

export default function ExpensesPage() {
  /*
   * SHARED EXPENSE DATA
   */
  const {
    expenses,
    addExpense,
    addExpenses,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  /*
   * SHARED PAYMENT METHODS
   */
  const {
    paymentMethods,
  } = usePaymentMethods();

  const activePaymentMethods =
    paymentMethods.filter(
      (method) =>
        method.active
    );

  /*
   * ADD / EDIT MODAL
   */
  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    editingExpense,
    setEditingExpense,
  ] =
    useState<Expense | null>(
      null
    );

  /*
   * DELETE MODAL
   */
  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    expenseToDelete,
    setExpenseToDelete,
  ] =
    useState<Expense | null>(
      null
    );

  /*
   * IMPORT MODAL
   */
  const [
    importDialogOpen,
    setImportDialogOpen,
  ] = useState(false);

  const [
    importFileName,
    setImportFileName,
  ] = useState('');

  const [
    importedExpenses,
    setImportedExpenses,
  ] = useState<
    ImportedExpense[]
  >([]);

  const [
    importError,
    setImportError,
  ] = useState('');

  /*
   * STANDARD EXPENSE FIELDS
   */
  const [
    date,
    setDate,
  ] = useState('');

  const [
    category,
    setCategory,
  ] = useState('');

  const [
    vendor,
    setVendor,
  ] = useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    amount,
    setAmount,
  ] = useState(0);

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState('');

  const [
    recurring,
    setRecurring,
  ] = useState(false);

  const [
    notes,
    setNotes,
  ] = useState('');

  const [
    receiptName,
    setReceiptName,
  ] = useState('');

  /*
   * INGREDIENT FIELDS
   */
  const [
    ingredientName,
    setIngredientName,
  ] = useState('');

  const [
    measurementType,
    setMeasurementType,
  ] = useState('');

  const [
    quantityPurchased,
    setQuantityPurchased,
  ] = useState(0);

  const [
    measurementUnit,
    setMeasurementUnit,
  ] = useState('');

  const isIngredient =
    category ===
    'Ingredients';

  const costPerUnit =
    isIngredient &&
    quantityPurchased > 0 &&
    amount > 0
      ? amount /
        quantityPurchased
      : 0;

  /*
   * SUMMARY
   */
  const totalExpenses =
    useMemo(() => {
      return expenses.reduce(
        (
          sum,
          expense
        ) =>
          sum +
          expense.amount,
        0
      );
    }, [expenses]);

  /*
   * IMPORT SUMMARY
   */
  const validImportCount =
    importedExpenses.filter(
      (expense) =>
        expense.valid
    ).length;

  const invalidImportCount =
    importedExpenses.filter(
      (expense) =>
        !expense.valid
    ).length;

  /*
   * FORM RESET
   */
  const resetIngredientFields =
    () => {
      setIngredientName('');
      setMeasurementType('');
      setQuantityPurchased(0);
      setMeasurementUnit('');
    };

  const resetForm = () => {
    setDate('');
    setCategory('');
    setVendor('');
    setDescription('');
    setAmount(0);
    setPaymentMethod('');
    setRecurring(false);
    setNotes('');
    setReceiptName('');

    resetIngredientFields();

    setEditingExpense(null);
  };

  const resetImport = () => {
    setImportFileName('');
    setImportedExpenses(
      []
    );
    setImportError('');
  };

  /*
   * ADD / EDIT
   */
  const handleAdd = () => {
    resetForm();
    setOpen(true);
  };

  const handleEdit = (
    expense: Expense
  ) => {
    setEditingExpense(
      expense
    );

    setDate(
      expense.date
    );

    setCategory(
      expense.category
    );

    setVendor(
      expense.vendor
    );

    setDescription(
      expense.description
    );

    setAmount(
      expense.amount
    );

    setPaymentMethod(
      expense.paymentMethod
    );

    setRecurring(
      expense.recurring
    );

    setNotes(
      expense.notes
    );

    setReceiptName(
      expense.receiptName
    );

    setIngredientName(
      expense.ingredientName
    );

    setMeasurementType(
      expense.measurementType
    );

    setQuantityPurchased(
      expense.quantityPurchased
    );

    setMeasurementUnit(
      expense.measurementUnit
    );

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  /*
   * CATEGORY
   */
  const handleCategoryChange =
    (
      newCategory: string
    ) => {
      setCategory(
        newCategory
      );

      if (
        newCategory !==
        'Ingredients'
      ) {
        resetIngredientFields();
      }
    };

  /*
   * INGREDIENT MEASUREMENT
   */
  const handleMeasurementTypeChange =
    (
      newType: string
    ) => {
      setMeasurementType(
        newType
      );

      setQuantityPurchased(
        0
      );

      if (
        newType ===
        'pieces'
      ) {
        setMeasurementUnit(
          'piece'
        );
      } else {
        setMeasurementUnit(
          ''
        );
      }
    };

  /*
   * RECEIPT
   */
  const handleReceiptChange =
    (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      setReceiptName(
        file.name
      );

      event.target.value =
        '';
    };

  const handleRemoveReceipt =
    () => {
      setReceiptName('');
    };

  /*
   * VALIDATION
   */
  const ingredientFieldsValid =
    !isIngredient ||
    Boolean(
      ingredientName.trim() &&
        measurementType &&
        quantityPurchased >
          0 &&
        measurementUnit
    );

  /*
   * SAVE EXPENSE
   */
  const handleSave = () => {
    if (
      !date ||
      !category ||
      !description.trim() ||
      amount <= 0 ||
      !paymentMethod ||
      !ingredientFieldsValid
    ) {
      return;
    }

    const ingredientData =
      isIngredient
        ? {
            ingredientName:
              ingredientName.trim(),

            measurementType,

            quantityPurchased,

            measurementUnit,

            costPerUnit,
          }
        : {
            ingredientName:
              '',

            measurementType:
              '',

            quantityPurchased:
              0,

            measurementUnit:
              '',

            costPerUnit:
              0,
          };

    if (
      editingExpense
    ) {
      updateExpense({
        ...editingExpense,

        date,

        category,

        vendor:
          vendor.trim(),

        description:
          description.trim(),

        amount,

        paymentMethod,

        recurring,

        notes:
          notes.trim(),

        receiptName,

        ...ingredientData,
      });
    } else {
      addExpense({
        date,

        category,

        vendor:
          vendor.trim(),

        description:
          description.trim(),

        amount,

        paymentMethod,

        recurring,

        notes:
          notes.trim(),

        receiptName,

        ...ingredientData,

        source:
          'manual',
      });
    }

    setOpen(false);
    resetForm();
  };

  /*
   * DELETE
   */
  const handleDeleteRequest =
    (
      expense: Expense
    ) => {
      setExpenseToDelete(
        expense
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

      setExpenseToDelete(
        null
      );
    };

  const handleDeleteConfirm =
    () => {
      if (
        !expenseToDelete
      ) {
        return;
      }

      deleteExpense(
        expenseToDelete.id
      );

      setDeleteDialogOpen(
        false
      );

      setExpenseToDelete(
        null
      );
    };

  /*
   * IMPORT DIALOG
   */
  const handleOpenImport =
    () => {
      resetImport();

      setImportDialogOpen(
        true
      );
    };

  const handleCloseImport =
    () => {
      setImportDialogOpen(
        false
      );

      resetImport();
    };

  /*
   * IMPORT FILE
   */
  const handleImportFile =
    async (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      setImportError('');

      setImportedExpenses(
        []
      );

      setImportFileName(
        file.name
      );

      try {
        const data =
          await file.arrayBuffer();

        const workbook =
          XLSX.read(
            data,
            {
              type: 'array',
            }
          );

        const firstSheetName =
          workbook
            .SheetNames[0];

        if (
          !firstSheetName
        ) {
          setImportError(
            'The file does not contain a worksheet.'
          );

          return;
        }

        const worksheet =
          workbook.Sheets[
            firstSheetName
          ];

        const rows =
          XLSX.utils.sheet_to_json<
            Record<
              string,
              unknown
            >
          >(
            worksheet,
            {
              defval: '',
            }
          );

        if (
          rows.length ===
          0
        ) {
          setImportError(
            'The file does not contain any expense rows.'
          );

          return;
        }

        /*
         * Check required columns.
         */
        const originalHeaders =
          Object.keys(
            rows[0]
          );

        const normalizedHeaders =
          originalHeaders.map(
            normalizeHeader
          );

        const missingRequiredColumns =
          requiredImportColumns.filter(
            (
              requiredColumn
            ) =>
              !normalizedHeaders.includes(
                requiredColumn
              )
          );

        if (
          missingRequiredColumns.length >
          0
        ) {
          setImportError(
            `Missing required column${
              missingRequiredColumns.length >
              1
                ? 's'
                : ''
            }: ${missingRequiredColumns.join(
              ', '
            )}.`
          );

          return;
        }

        /*
         * Parse rows.
         */
        const parsedExpenses =
          rows.map(
            (
              rawRow,
              index
            ) => {
              const row:
                Record<
                  string,
                  unknown
                > = {};

              Object.entries(
                rawRow
              ).forEach(
                ([
                  key,
                  value,
                ]) => {
                  row[
                    normalizeHeader(
                      key
                    )
                  ] =
                    value;
                }
              );

              const rowCategory =
                normalizeValue(
                  row.category
                );

              const rowDescription =
                normalizeValue(
                  row.description
                );

              const rowAmount =
                parseAmount(
                  row.amount
                );

              const rowPaymentMethod =
                normalizeValue(
                  row[
                    'payment method'
                  ]
                );

              /*
               * OPTIONAL
               */
              const rowDate =
                parseExcelDate(
                  row.date
                );

              const rowVendor =
                normalizeValue(
                  row.vendor
                );

              const rowNotes =
                normalizeValue(
                  row.notes
                );

              const rowRecurring =
                parseBoolean(
                  row.recurring
                );

              const rowReceipt =
                normalizeValue(
                  row.receipt
                );

              const rowIngredientName =
                normalizeValue(
                  row[
                    'ingredient name'
                  ]
                );

              const rowMeasurementType =
                normalizeValue(
                  row[
                    'measurement type'
                  ]
                ).toLowerCase();

              const rowQuantity =
                parseAmount(
                  row[
                    'quantity purchased'
                  ] ??
                    row.quantity
                );

              const rowUnit =
                normalizeValue(
                  row.unit
                ).toLowerCase();

              const errors:
                string[] =
                  [];

              /*
               * ONLY FOUR REQUIRED VALUES
               */
              if (
                !rowCategory
              ) {
                errors.push(
                  'Category is required'
                );
              }

              if (
                !rowDescription
              ) {
                errors.push(
                  'Description is required'
                );
              }

              if (
                rowAmount <=
                0
              ) {
                errors.push(
                  'Amount must be greater than 0'
                );
              }

              if (
                !rowPaymentMethod
              ) {
                errors.push(
                  'Payment Method is required'
                );
              }

              const importedCostPerUnit =
                rowQuantity >
                  0 &&
                rowAmount >
                  0
                  ? rowAmount /
                    rowQuantity
                  : 0;

              const importedExpense:
                ImportedExpense =
                  {
                    rowNumber:
                      index +
                      2,

                    valid:
                      errors.length ===
                      0,

                    errors,

                    date:
                      rowDate,

                    category:
                      rowCategory,

                    vendor:
                      rowVendor,

                    description:
                      rowDescription,

                    amount:
                      rowAmount,

                    paymentMethod:
                      rowPaymentMethod,

                    recurring:
                      rowRecurring,

                    notes:
                      rowNotes,

                    receiptName:
                      rowReceipt,

                    ingredientName:
                      rowIngredientName,

                    measurementType:
                      rowMeasurementType,

                    quantityPurchased:
                      rowQuantity,

                    measurementUnit:
                      rowUnit,

                    costPerUnit:
                      importedCostPerUnit,

                    source:
                      'import',
                  };

              return importedExpense;
            }
          );

        setImportedExpenses(
          parsedExpenses
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        setImportError(
          'We could not read this file. Please make sure it is a valid Excel or CSV file.'
        );
      } finally {
        event.target.value =
          '';
      }
    };

  /*
   * CONFIRM IMPORT
   */
  const handleConfirmImport =
    () => {
      const validRows =
        importedExpenses.filter(
          (expense) =>
            expense.valid
        );

      if (
        validRows.length ===
        0
      ) {
        return;
      }

      const newExpenses:
        NewExpense[] =
          validRows.map(
            (expense) => ({
              date:
                expense.date,

              category:
                expense.category,

              vendor:
                expense.vendor,

              description:
                expense.description,

              amount:
                expense.amount,

              paymentMethod:
                expense.paymentMethod,

              recurring:
                expense.recurring,

              notes:
                expense.notes,

              receiptName:
                expense.receiptName,

              ingredientName:
                expense.ingredientName,

              measurementType:
                expense.measurementType,

              quantityPurchased:
                expense.quantityPurchased,

              measurementUnit:
                expense.measurementUnit,

              costPerUnit:
                expense.costPerUnit,

              source:
                'import',
            })
          );

      addExpenses(
        newExpenses
      );

      setImportDialogOpen(
        false
      );

      resetImport();
    };

  const getUnitLabel =
    (
      expense: Expense
    ) => {
      if (
        expense.measurementUnit ===
        'piece'
      ) {
        return 'piece';
      }

      return (
        expense.measurementUnit ||
        'unit'
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
              Expenses
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
              Milo + Marley
              business expenses.
            </Typography>
          </Box>

          <Stack
            spacing={1.5}
            sx={{
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                <UploadFileIcon />
              }
              onClick={
                handleOpenImport
              }
            >
              Import Expenses
            </Button>

            <Button
              variant="contained"
              startIcon={
                <AddIcon />
              }
              onClick={
                handleAdd
              }
            >
              Add Expense
            </Button>
          </Stack>
        </Stack>

        {/* TOTAL EXPENSES */}
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

                color:
                  'primary.main',

                fontWeight:
                  700,
              }}
            >
              $
              {totalExpenses.toFixed(
                2
              )}
            </Typography>
          </CardContent>
        </Card>

        {/* EXPENSE HISTORY */}
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
              Expense history
            </Typography>

            {expenses.length ===
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
                  No expenses
                  have been added
                  yet.
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
                        Category
                      </TableCell>

                      <TableCell>
                        Vendor
                      </TableCell>

                      <TableCell>
                        Description
                      </TableCell>

                      <TableCell>
                        Details
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

                      <TableCell
                        align="right"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {expenses.map(
                      (
                        expense
                      ) => (
                        <TableRow
                          key={
                            expense.id
                          }
                        >
                          <TableCell>
                            {expense.date ||
                              '—'}
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

                          <TableCell>
                            {expense.category ===
                              'Ingredients' &&
                            expense.quantityPurchased >
                              0 ? (
                              <Stack
                                spacing={
                                  0.25
                                }
                              >
                                {expense.ingredientName && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight:
                                        600,
                                    }}
                                  >
                                    {
                                      expense.ingredientName
                                    }
                                  </Typography>
                                )}

                                <Typography
                                  variant="caption"
                                  sx={{
                                    color:
                                      'text.secondary',
                                  }}
                                >
                                  {
                                    expense.quantityPurchased
                                  }{' '}
                                  {expense.measurementUnit ||
                                    'units'}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  sx={{
                                    color:
                                      'text.secondary',
                                  }}
                                >
                                  $
                                  {expense.costPerUnit.toFixed(
                                    2
                                  )}{' '}
                                  per{' '}
                                  {getUnitLabel(
                                    expense
                                  )}
                                </Typography>
                              </Stack>
                            ) : (
                              '—'
                            )}
                          </TableCell>

                          <TableCell
                            align="right"
                          >
                            $
                            {expense.amount.toFixed(
                              2
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

                          <TableCell
                            align="right"
                          >
                            <IconButton
                              aria-label="Edit expense"
                              onClick={() =>
                                handleEdit(
                                  expense
                                )
                              }
                            >
                              <EditIcon />
                            </IconButton>

                            <IconButton
                              aria-label="Delete expense"
                              color="error"
                              onClick={() =>
                                handleDeleteRequest(
                                  expense
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

      {/* ADD / EDIT EXPENSE */}
      <Dialog
        open={open}
        onClose={
          handleClose
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingExpense
            ? 'Edit Expense'
            : 'Add Expense'}
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
              label="Category"
              value={
                category
              }
              onChange={(
                event
              ) =>
                handleCategoryChange(
                  event.target
                    .value
                )
              }
              fullWidth
              required
            >
              {categories.map(
                (item) => (
                  <MenuItem
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {item}
                  </MenuItem>
                )
              )}
            </TextField>

            {/* INGREDIENT DETAILS */}
            {isIngredient && (
              <Box
                sx={{
                  p: 2.5,

                  border:
                    '1px solid',

                  borderColor:
                    'divider',

                  borderRadius:
                    2,

                  backgroundColor:
                    'background.default',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 0.5,

                    fontWeight:
                      600,

                    color:
                      'primary.main',
                  }}
                >
                  Ingredient
                  Details
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 2.5,

                    color:
                      'text.secondary',
                  }}
                >
                  Enter the
                  amount purchased
                  so we can
                  calculate the
                  ingredient cost
                  per unit.
                </Typography>

                <Stack
                  spacing={
                    2.5
                  }
                >
                  <TextField
                    label="Ingredient Name"
                    value={
                      ingredientName
                    }
                    onChange={(
                      event
                    ) =>
                      setIngredientName(
                        event.target
                          .value
                      )
                    }
                    fullWidth
                    required
                  />

                  <TextField
                    select
                    label="Purchase Measurement"
                    value={
                      measurementType
                    }
                    onChange={(
                      event
                    ) =>
                      handleMeasurementTypeChange(
                        event.target
                          .value
                      )
                    }
                    fullWidth
                    required
                  >
                    <MenuItem
                      value="pieces"
                    >
                      Pieces
                    </MenuItem>

                    <MenuItem
                      value="weight"
                    >
                      Weight
                    </MenuItem>
                  </TextField>

                  {measurementType && (
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
                        label="Quantity Purchased"
                        type="number"
                        value={
                          quantityPurchased
                        }
                        onChange={(
                          event
                        ) =>
                          setQuantityPurchased(
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        }
                        fullWidth
                        required
                        slotProps={{
                          htmlInput:
                            {
                              min: 0.01,

                              step:
                                measurementType ===
                                'pieces'
                                  ? 1
                                  : 0.01,
                            },
                        }}
                      />

                      <TextField
                        select
                        label="Unit"
                        value={
                          measurementUnit
                        }
                        onChange={(
                          event
                        ) =>
                          setMeasurementUnit(
                            event.target
                              .value
                          )
                        }
                        fullWidth
                        required
                        disabled={
                          measurementType ===
                          'pieces'
                        }
                      >
                        {(measurementType ===
                        'pieces'
                          ? pieceUnits
                          : weightUnits
                        ).map(
                          (unit) => (
                            <MenuItem
                              key={
                                unit.value
                              }
                              value={
                                unit.value
                              }
                            >
                              {
                                unit.label
                              }
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    </Box>
                  )}
                </Stack>
              </Box>
            )}

            <TextField
              label="Vendor"
              value={
                vendor
              }
              onChange={(
                event
              ) =>
                setVendor(
                  event.target
                    .value
                )
              }
              fullWidth
            />

            <TextField
              label="Description"
              value={
                description
              }
              onChange={(
                event
              ) =>
                setDescription(
                  event.target
                    .value
                )
              }
              fullWidth
              required
            />

            <TextField
              label={
                isIngredient
                  ? 'Total Cost'
                  : 'Amount'
              }
              type="number"
              value={
                amount
              }
              onChange={(
                event
              ) =>
                setAmount(
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
                  min: 0.01,
                  step: 0.01,
                },
              }}
            />

            {/* COST PER UNIT */}
            {isIngredient &&
              quantityPurchased >
                0 &&
              amount > 0 && (
                <Box
                  sx={{
                    p: 2,

                    borderRadius:
                      2,

                    border:
                      '1px solid',

                    borderColor:
                      'divider',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    Cost per{' '}
                    {measurementUnit ===
                    'piece'
                      ? 'piece'
                      : measurementUnit ||
                        'unit'}
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
                    {costPerUnit.toFixed(
                      2
                    )}
                  </Typography>
                </Box>
              )}

            {/* PAYMENT METHOD */}
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

            {/* RECURRING */}
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
                    Recurring
                    expense
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    Use this for
                    expenses that
                    happen
                    regularly.
                  </Typography>
                </Box>

                <Switch
                  checked={
                    recurring
                  }
                  onChange={(
                    event
                  ) =>
                    setRecurring(
                      event.target
                        .checked
                    )
                  }
                />
              </Stack>
            </Box>

            {/* RECEIPT */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 1,

                  fontWeight:
                    600,
                }}
              >
                Receipt
              </Typography>

              <Stack
                spacing={
                  1.5
                }
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={
                    <AttachFileIcon />
                  }
                >
                  {receiptName
                    ? 'Change Receipt'
                    : 'Attach Receipt'}

                  <input
                    type="file"
                    hidden
                    accept="image/*,.pdf"
                    onChange={
                      handleReceiptChange
                    }
                  />
                </Button>

                {receiptName && (
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
                        color:
                          'text.secondary',
                      }}
                    >
                      {
                        receiptName
                      }
                    </Typography>

                    <Button
                      color="error"
                      onClick={
                        handleRemoveReceipt
                      }
                    >
                      Remove
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Box>

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
              !category ||
              !description.trim() ||
              amount <= 0 ||
              !paymentMethod ||
              !ingredientFieldsValid
            }
          >
            {editingExpense
              ? 'Save Changes'
              : 'Add Expense'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* IMPORT EXPENSES */}
      <Dialog
        open={
          importDialogOpen
        }
        onClose={
          handleCloseImport
        }
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          Import Expenses
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={3}
            sx={{
              mt: 1,
            }}
          >
            <Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight:
                    600,
                }}
              >
                Upload an Excel
                or CSV file
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,

                  color:
                    'text.secondary',
                }}
              >
                Only four columns
                are required:
                Category,
                Description,
                Amount, and
                Payment Method.
                All other columns
                are optional.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2.5,

                border:
                  '1px solid',

                borderColor:
                  'divider',

                borderRadius:
                  2,

                backgroundColor:
                  'background.default',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  mb: 1,

                  fontWeight:
                    600,
                }}
              >
                Required columns
              </Typography>

              <Stack
                spacing={1}
                sx={{
                  flexDirection:
                    'row',

                  flexWrap:
                    'wrap',

                  gap: 1,
                }}
              >
                <Chip
                  label="Category"
                />

                <Chip
                  label="Description"
                />

                <Chip
                  label="Amount"
                />

                <Chip
                  label="Payment Method"
                />
              </Stack>

              <Typography
                variant="body2"
                sx={{
                  mt: 2,

                  color:
                    'text.secondary',
                }}
              >
                Optional:
                Date, Vendor,
                Notes,
                Recurring,
                Receipt,
                Ingredient Name,
                Measurement Type,
                Quantity Purchased,
                and Unit.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              component="label"
              startIcon={
                <UploadFileIcon />
              }
            >
              Select Excel or CSV
              File

              <input
                type="file"
                hidden
                accept=".xlsx,.xls,.csv"
                onChange={
                  handleImportFile
                }
              />
            </Button>

            {importFileName && (
              <Typography
                variant="body2"
                sx={{
                  color:
                    'text.secondary',
                }}
              >
                File:{' '}
                <strong>
                  {
                    importFileName
                  }
                </strong>
              </Typography>
            )}

            {importError && (
              <Alert
                severity="error"
              >
                {
                  importError
                }
              </Alert>
            )}

            {importedExpenses.length >
              0 && (
              <>
                <Stack
                  spacing={1}
                  sx={{
                    flexDirection:
                      'row',

                    alignItems:
                      'center',

                    flexWrap:
                      'wrap',

                    gap: 1,
                  }}
                >
                  <Chip
                    label={`${validImportCount} valid`}
                    color="success"
                    variant="outlined"
                  />

                  {invalidImportCount >
                    0 && (
                    <Chip
                      label={`${invalidImportCount} invalid`}
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Stack>

                {invalidImportCount >
                  0 && (
                  <Alert
                    severity="warning"
                  >
                    Invalid rows
                    will not be
                    imported.
                  </Alert>
                )}

                <TableContainer
                  sx={{
                    maxHeight:
                      420,

                    border:
                      '1px solid',

                    borderColor:
                      'divider',

                    borderRadius:
                      2,
                  }}
                >
                  <Table
                    stickyHeader
                    size="small"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          Row
                        </TableCell>

                        <TableCell>
                          Status
                        </TableCell>

                        <TableCell>
                          Date
                        </TableCell>

                        <TableCell>
                          Category
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
                          Vendor
                        </TableCell>

                        <TableCell>
                          Issues
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {importedExpenses.map(
                        (
                          expense
                        ) => (
                          <TableRow
                            key={
                              expense.rowNumber
                            }
                          >
                            <TableCell>
                              {
                                expense.rowNumber
                              }
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  expense.valid
                                    ? 'Valid'
                                    : 'Invalid'
                                }
                                color={
                                  expense.valid
                                    ? 'success'
                                    : 'error'
                                }
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell>
                              {expense.date ||
                                '—'}
                            </TableCell>

                            <TableCell>
                              {
                                expense.category
                              }
                            </TableCell>

                            <TableCell>
                              {
                                expense.description
                              }
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              {expense.amount >
                              0
                                ? `$${expense.amount.toFixed(
                                    2
                                  )}`
                                : '—'}
                            </TableCell>

                            <TableCell>
                              {
                                expense.paymentMethod
                              }
                            </TableCell>

                            <TableCell>
                              {expense.vendor ||
                                '—'}
                            </TableCell>

                            <TableCell>
                              {expense.errors.length >
                              0
                                ? expense.errors.join(
                                    ', '
                                  )
                                : '—'}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
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
              handleCloseImport
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleConfirmImport
            }
            disabled={
              validImportCount ===
              0
            }
          >
            Import{' '}
            {validImportCount >
            0
              ? `${validImportCount} Expense${
                  validImportCount ===
                  1
                    ? ''
                    : 's'
                }`
              : 'Expenses'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION */}
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
          Delete Expense?
        </DialogTitle>

        <DialogContent>
          <Typography>
            You are about to
            delete{' '}
            <strong>
              {
                expenseToDelete?.description
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
            This action cannot
            be undone.
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
            Delete Expense
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}