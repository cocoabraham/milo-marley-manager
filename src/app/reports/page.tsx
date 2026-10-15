'use client';

import {
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';

import AppShell from '@/components/AppShell';

export default function ReportsPage() {
  return (
    <AppShell>
      <Stack spacing={4}>
        <div>
          <Typography
            variant="h4"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
            }}
          >
            Reports
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 0.5,
              color: 'text.secondary',
            }}
          >
            Analyze sales, expenses, and business performance.
          </Typography>
        </div>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Reports
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: 'text.secondary',
              }}
            >
              Financial and operational reports will appear here.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </AppShell>
  );
}