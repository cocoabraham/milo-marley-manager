'use client';

import {
  useState,
  type ChangeEvent,
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
import ImageIcon from '@mui/icons-material/Image';

import AppShell from '@/components/AppShell';

import {
  useProducts,
  type Product,
} from '@/context/ProductsContext';

const categories = [
  'Dehydrated Treats',
  'Cookies',
  'Single Ingredient',
  'Chews',
  'Other',
];

export default function ProductsPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const [open, setOpen] = useState(false);

  const [
    editingProduct,
    setEditingProduct,
  ] = useState<Product | null>(null);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    productToDelete,
    setProductToDelete,
  ] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] =
    useState('');
  const [price, setPrice] = useState(0);
  const [active, setActive] =
    useState(true);
  const [
    description,
    setDescription,
  ] = useState('');
  const [photo, setPhoto] =
    useState('');

  const resetForm = () => {
    setName('');
    setSku('');
    setCategory('');
    setPrice(0);
    setActive(true);
    setDescription('');
    setPhoto('');
    setEditingProduct(null);
  };

  const handleAdd = () => {
    resetForm();
    setOpen(true);
  };

  const handleEdit = (
    product: Product
  ) => {
    setEditingProduct(product);

    setName(product.name);
    setSku(product.sku);
    setCategory(product.category);
    setPrice(product.price);
    setActive(product.active);
    setDescription(
      product.description
    );
    setPhoto(product.photo);

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handlePhotoChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        'string'
      ) {
        setPhoto(reader.result);
      }
    };

    reader.readAsDataURL(file);

    event.target.value = '';
  };

  const handleRemovePhoto = () => {
    setPhoto('');
  };

  const handleSave = () => {
    if (
      !name.trim() ||
      !sku.trim() ||
      !category ||
      price <= 0
    ) {
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: name.trim(),
        sku: sku.trim(),
        category,
        price,
        active,
        description:
          description.trim(),
        photo,
      });
    } else {
      addProduct({
        name: name.trim(),
        sku: sku.trim(),
        category,
        price,
        active,
        description:
          description.trim(),
        photo,
      });
    }

    setOpen(false);
    resetForm();
  };

  const handleDeleteRequest = (
    product: Product
  ) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (!productToDelete) {
      return;
    }

    deleteProduct(
      productToDelete.id
    );

    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  return (
    <AppShell>
      <Stack spacing={4}>
        {/* PAGE HEADER */}
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
              Products
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 0.5,
                color:
                  'text.secondary',
              }}
            >
              Add and manage Milo +
              Marley products and
              pricing.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Product
          </Button>
        </Stack>

        {/* PRODUCT TABLE */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
              }}
            >
              Product catalog
            </Typography>

            {products.length === 0 ? (
              <Box
                sx={{
                  py: 6,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  No products have
                  been added yet.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Photo
                      </TableCell>

                      <TableCell>
                        Product
                      </TableCell>

                      <TableCell>
                        SKU
                      </TableCell>

                      <TableCell>
                        Category
                      </TableCell>

                      <TableCell
                        align="right"
                      >
                        Price
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
                    {products.map(
                      (product) => (
                        <TableRow
                          key={
                            product.id
                          }
                        >
                          <TableCell>
                            {product.photo ? (
                              <Box
                                component="img"
                                src={
                                  product.photo
                                }
                                alt={
                                  product.name
                                }
                                sx={{
                                  display:
                                    'block',
                                  width: 64,
                                  height: 64,
                                  objectFit:
                                    'cover',
                                  borderRadius: 2,
                                  border:
                                    '1px solid',
                                  borderColor:
                                    'divider',
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 64,
                                  height: 64,
                                  borderRadius: 2,
                                  backgroundColor:
                                    'background.default',
                                  border:
                                    '1px solid',
                                  borderColor:
                                    'divider',
                                  display:
                                    'flex',
                                  alignItems:
                                    'center',
                                  justifyContent:
                                    'center',
                                  color:
                                    'text.secondary',
                                }}
                              >
                                <ImageIcon />
                              </Box>
                            )}
                          </TableCell>

                          <TableCell>
                            <Stack
                              spacing={
                                0.25
                              }
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                }}
                              >
                                {
                                  product.name
                                }
                              </Typography>

                              {product.description && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color:
                                      'text.secondary',
                                  }}
                                >
                                  {
                                    product.description
                                  }
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell>
                            {
                              product.sku
                            }
                          </TableCell>

                          <TableCell>
                            {
                              product.category
                            }
                          </TableCell>

                          <TableCell
                            align="right"
                          >
                            $
                            {product.price.toFixed(
                              2
                            )}
                          </TableCell>

                          <TableCell>
                            <Box
                              sx={{
                                display:
                                  'inline-flex',
                                px: 1.25,
                                py: 0.5,
                                borderRadius: 10,
                                backgroundColor:
                                  product.active
                                    ? 'success.light'
                                    : 'action.hover',
                                color:
                                  product.active
                                    ? 'success.dark'
                                    : 'text.secondary',
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {product.active
                                ? 'Active'
                                : 'Inactive'}
                            </Box>
                          </TableCell>

                          <TableCell
                            align="right"
                          >
                            <IconButton
                              aria-label={`Edit ${product.name}`}
                              onClick={() =>
                                handleEdit(
                                  product
                                )
                              }
                            >
                              <EditIcon />
                            </IconButton>

                            <IconButton
                              aria-label={`Delete ${product.name}`}
                              color="error"
                              onClick={() =>
                                handleDeleteRequest(
                                  product
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

      {/* ADD / EDIT PRODUCT */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingProduct
            ? 'Edit Product'
            : 'Add Product'}
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={3}
            sx={{ mt: 1 }}
          >
            {/* PHOTO */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 1.5,
                  fontWeight: 600,
                }}
              >
                Product Photo
              </Typography>

              <Stack
                spacing={2}
                sx={{
                  flexDirection: {
                    xs: 'column',
                    sm: 'row',
                  },
                  alignItems: {
                    xs: 'stretch',
                    sm: 'center',
                  },
                }}
              >
                {photo ? (
                  <Box
                    component="img"
                    src={photo}
                    alt="Product preview"
                    sx={{
                      width: 150,
                      height: 150,
                      objectFit:
                        'cover',
                      borderRadius: 2,
                      border:
                        '1px solid',
                      borderColor:
                        'divider',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: 2,
                      border:
                        '1px dashed',
                      borderColor:
                        'divider',
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                    }}
                  >
                    <Stack
                      spacing={1}
                      sx={{
                        alignItems:
                          'center',
                        color:
                          'text.secondary',
                      }}
                    >
                      <ImageIcon />

                      <Typography
                        variant="caption"
                      >
                        No photo
                        selected
                      </Typography>
                    </Stack>
                  </Box>
                )}

                <Stack
                  spacing={1.5}
                >
                  <Button
                    variant="outlined"
                    component="label"
                  >
                    {photo
                      ? 'Change Photo'
                      : 'Upload Photo'}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      hidden
                      onChange={
                        handlePhotoChange
                      }
                    />
                  </Button>

                  {photo && (
                    <Button
                      color="error"
                      onClick={
                        handleRemovePhoto
                      }
                    >
                      Remove Photo
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>

            <TextField
              label="Product Name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              fullWidth
              required
            />

            <TextField
              label="SKU"
              value={sku}
              onChange={(event) =>
                setSku(
                  event.target.value
                )
              }
              fullWidth
              required
            />

            <TextField
              select
              label="Category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              fullWidth
              required
            >
              {categories.map(
                (item) => (
                  <MenuItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </MenuItem>
                )
              )}
            </TextField>

            <TextField
              label="Selling Price"
              type="number"
              value={price}
              onChange={(event) =>
                setPrice(
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

            <Box
              sx={{
                p: 2,
                border:
                  '1px solid',
                borderColor:
                  'divider',
                borderRadius: 2,
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
                      fontWeight: 500,
                    }}
                  >
                    Active product
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    Inactive products
                    will not appear in
                    new sales.
                  </Typography>
                </Box>

                <Switch
                  checked={active}
                  onChange={(
                    event
                  ) =>
                    setActive(
                      event.target
                        .checked
                    )
                  }
                />
              </Stack>
            </Box>

            <TextField
              label="Description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
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
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              !name.trim() ||
              !sku.trim() ||
              !category ||
              price <= 0
            }
          >
            {editingProduct
              ? 'Save Changes'
              : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog
        open={deleteDialogOpen}
        onClose={
          handleDeleteCancel
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Delete Product?
        </DialogTitle>

        <DialogContent>
          <Typography>
            You are about to
            delete{' '}
            <strong>
              {
                productToDelete?.name
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
            Delete Product
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}