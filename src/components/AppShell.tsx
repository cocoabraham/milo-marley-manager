'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';

const drawerWidth = 260;

type AppShellProps = {
  children: React.ReactNode;
};

const navigation = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <DashboardOutlinedIcon />,
  },
  {
    section: 'FINANCES',
  },
  {
    label: 'Sales',
    href: '/sales',
    icon: <PointOfSaleOutlinedIcon />,
  },
  {
    label: 'Expenses',
    href: '/expenses',
    icon: <ReceiptLongOutlinedIcon />,
  },
  {
    section: 'CATALOG',
  },
  {
    label: 'Products',
    href: '/products',
    icon: <Inventory2OutlinedIcon />,
  },
  {
    section: 'ANALYTICS',
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <BarChartOutlinedIcon />,
  },
  {
    section: 'MANAGEMENT',
  },
  {
    label: 'Users',
    href: '/users',
    icon: <GroupOutlinedIcon />,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <SettingsOutlinedIcon />,
  },
];

export default function AppShell({ children }: AppShellProps) {
  const theme = useTheme();
  const pathname = usePathname();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen((previous) => !previous);
  };

  const activeItem = navigation.find(
    (item) => item.href && item.href === pathname
  );

  const pageTitle = activeItem?.label ?? 'Milo + Marley';

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: 3,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PetsOutlinedIcon />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Milo + Marley
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
            }}
          >
            Business Manager
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ px: 2, py: 2, flexGrow: 1 }}>
        <List disablePadding>
          {navigation.map((item, index) => {
            if (item.section) {
              return (
                <Typography
                  key={`${item.section}-${index}`}
                  variant="overline"
                  sx={{
                    display: 'block',
                    px: 2,
                    pt: index === 1 ? 2 : 3,
                    pb: 1,
                    color: 'text.secondary',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  {item.section}
                </Typography>
              );
            }

            const selected = pathname === item.href;

            return (
              <ListItemButton
                key={item.label}
                component={Link}
                href={item.href ?? '/'}
                selected={selected}
                onClick={() => {
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,

                  '&.Mui-selected': {
                    backgroundColor: 'rgba(61, 35, 18, 0.08)',
                    color: 'primary.main',

                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },

                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(61, 35, 18, 0.12)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: selected
                      ? 'primary.main'
                      : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: 14,
                        fontWeight: selected ? 600 : 500,
                      },
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* Logged-in user */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 38,
            height: 38,
            fontSize: 14,
          }}
        >
          JH
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Jorge
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
            }}
          >
            Administrator
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* Top bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: {
            md: `calc(100% - ${drawerWidth}px)`,
          },
          ml: {
            md: `${drawerWidth}px`,
          },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={toggleDrawer}
              sx={{
                mr: 2,
                color: 'primary.main',
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
              }}
            >
              {pageTitle}
            </Typography>
          </Box>

          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 34,
              height: 34,
              fontSize: 13,
            }}
          >
            JH
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,

            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            md: `calc(100% - ${drawerWidth}px)`,
          },
          pt: '64px',
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}