'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import AppShell from '@/components/AppShell';

const metrics = [
  {
    title: 'Revenue',
    value: '$0.00',
    description: 'This month',
  },
  {
    title: 'Expenses',
    value: '$0.00',
    description: 'This month',
  },
  {
    title: 'Net Profit',
    value: '$0.00',
    description: 'This month',
  },
  {
    title: 'Profit Margin',
    value: '0%',
    description: 'This month',
  },
];

export default function Home() {
  return (
    <AppShell>
      <Stack spacing={4}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            Dashboard
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 0.5,
              color: 'text.secondary',
            }}
          >
            Overview of Milo + Marley business activity.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {metrics.map((metric) => (
            <Grid
              key={metric.title}
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                      }}
                    >
                      {metric.title}
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 700,
                      }}
                    >
                      {metric.value}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {metric.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ minHeight: 360 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  Revenue vs. Expenses
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mt: 1,
                  }}
                >
                  Financial chart will appear here.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ minHeight: 360 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  Recent Activity
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mt: 1,
                  }}
                >
                  New sales and expenses will appear here.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </AppShell>
  );
}