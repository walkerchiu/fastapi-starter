'use client';

import { Avatar, Box, Button, Chip, Paper, Typography } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const tickets = [
  {
    id: '#567',
    subject: 'Order not received',
    customer: 'John Doe',
    priority: 'High',
    time: '2 hours ago',
  },
  {
    id: '#568',
    subject: 'Wrong item shipped',
    customer: 'Jane Smith',
    priority: 'Medium',
    time: '4 hours ago',
  },
  {
    id: '#569',
    subject: 'Refund request',
    customer: 'Bob Wilson',
    priority: 'Low',
    time: '1 day ago',
  },
];

export default function SupportPage() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <>
      <PageHeader
        title="Support Tickets"
        description="Customer support requests"
        breadcrumbs={[
          { label: 'Console', href: '/console' },
          { label: 'Support', href: '/console/support' },
          { label: 'Tickets' },
        ]}
      />
      <PageContent>
        <PageSection>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tickets.map((ticket) => (
              <Paper key={ticket.id} sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor:
                          ticket.priority === 'High'
                            ? 'error.light'
                            : ticket.priority === 'Medium'
                              ? 'warning.light'
                              : 'grey.200',
                        color:
                          ticket.priority === 'High'
                            ? 'error.dark'
                            : ticket.priority === 'Medium'
                              ? 'warning.dark'
                              : 'grey.600',
                      }}
                    >
                      <ConfirmationNumberIcon />
                    </Avatar>
                    <Box>
                      <Typography fontWeight="medium">
                        {ticket.id} - {ticket.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.customer} • {ticket.time}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={ticket.priority}
                      size="small"
                      color={
                        getPriorityColor(ticket.priority) as
                          | 'error'
                          | 'warning'
                          | 'default'
                      }
                    />
                    <Button variant="contained" size="small" color="warning">
                      View
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </PageSection>
      </PageContent>
    </>
  );
}
