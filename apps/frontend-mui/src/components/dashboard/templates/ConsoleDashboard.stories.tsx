import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ConsoleDashboard } from './ConsoleDashboard';
import { PageHeader, PageContent, PageSection } from '../index';

const meta: Meta<typeof ConsoleDashboard> = {
  title: 'Dashboard/Templates/ConsoleDashboard',
  component: ConsoleDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConsoleDashboard>;

const SampleContent = () => (
  <>
    <PageHeader
      title="Operations Dashboard"
      description="Monitor and manage daily operations"
      breadcrumbs={[
        { label: 'Console', href: '/console' },
        { label: 'Dashboard' },
      ]}
    />
    <PageContent>
      <PageSection title="Today's Overview">
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
          }}
        >
          {[
            { label: 'Pending Orders', value: '24', color: 'warning' },
            { label: 'Open Tickets', value: '8', color: 'error' },
            { label: 'Pending Reviews', value: '15', color: 'info' },
            { label: 'Processed Today', value: '142', color: 'success' },
          ].map((stat) => (
            <Paper key={stat.label} sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                color={`${stat.color}.main`}
                sx={{ mt: 0.5 }}
              >
                {stat.value}
              </Typography>
            </Paper>
          ))}
        </Box>
      </PageSection>
      <PageSection title="Recent Activity">
        <Paper>
          <List disablePadding>
            {[
              {
                action: 'Order #1234 processed',
                time: '5 min ago',
                type: 'order',
                icon: <ShoppingCartIcon />,
              },
              {
                action: 'Ticket #567 resolved',
                time: '12 min ago',
                type: 'ticket',
                icon: <ConfirmationNumberIcon />,
              },
              {
                action: 'Review approved for Product A',
                time: '25 min ago',
                type: 'review',
                icon: <CheckCircleIcon />,
              },
              {
                action: 'Refund issued for Order #1198',
                time: '1 hour ago',
                type: 'refund',
                icon: <RefreshIcon />,
              },
            ].map((activity, index) => (
              <ListItem key={index} divider={index < 3}>
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor:
                        activity.type === 'order'
                          ? 'warning.light'
                          : activity.type === 'ticket'
                            ? 'info.light'
                            : activity.type === 'review'
                              ? 'success.light'
                              : 'error.light',
                      color:
                        activity.type === 'order'
                          ? 'warning.dark'
                          : activity.type === 'ticket'
                            ? 'info.dark'
                            : activity.type === 'review'
                              ? 'success.dark'
                              : 'error.dark',
                      width: 36,
                      height: 36,
                    }}
                  >
                    {activity.icon}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={activity.action}
                  secondary={activity.time}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </PageSection>
    </PageContent>
  </>
);

export const Default: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    activeMenuKey: 'dashboard',
  },
};

export const WithSearch: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    showSearch: true,
    onSearch: (query) => console.log('Search:', query),
    activeMenuKey: 'dashboard',
  },
};

export const WithAvatar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
      avatar: 'https://i.pravatar.cc/150?u=operator',
    },
    activeMenuKey: 'dashboard',
  },
};

export const CollapsedSidebar: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    sidebarCollapsed: true,
    activeMenuKey: 'dashboard',
  },
};

export const OrdersPage: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Pending Orders"
          description="Orders awaiting processing"
          breadcrumbs={[
            { label: 'Console', href: '/console' },
            { label: 'Orders', href: '/console/orders' },
            { label: 'Pending' },
          ]}
          actions={
            <Button variant="contained" color="warning">
              Process All
            </Button>
          }
        />
        <PageContent>
          <PageSection>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      id: '#1234',
                      customer: 'John Doe',
                      amount: '$299.00',
                      status: 'Pending',
                    },
                    {
                      id: '#1235',
                      customer: 'Jane Smith',
                      amount: '$149.00',
                      status: 'Processing',
                    },
                    {
                      id: '#1236',
                      customer: 'Bob Wilson',
                      amount: '$599.00',
                      status: 'Pending',
                    },
                  ].map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          color={
                            order.status === 'Pending' ? 'warning' : 'info'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" color="warning">
                          Process
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </PageSection>
        </PageContent>
      </>
    ),
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    activeMenuKey: 'pending',
  },
};

export const TicketsPage: Story = {
  args: {
    children: (
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
              {[
                {
                  id: '#567',
                  subject: 'Order not received',
                  priority: 'High',
                  time: '2 hours ago',
                },
                {
                  id: '#568',
                  subject: 'Wrong item shipped',
                  priority: 'Medium',
                  time: '4 hours ago',
                },
                {
                  id: '#569',
                  subject: 'Refund request',
                  priority: 'Low',
                  time: '1 day ago',
                },
              ].map((ticket) => (
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
                          {ticket.time}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                    >
                      <Chip
                        label={ticket.priority}
                        size="small"
                        color={
                          ticket.priority === 'High'
                            ? 'error'
                            : ticket.priority === 'Medium'
                              ? 'warning'
                              : 'default'
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
    ),
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    activeMenuKey: 'tickets',
  },
};

export const NoFooter: Story = {
  args: {
    children: <SampleContent />,
    user: {
      name: 'Sarah Operator',
      email: 'sarah@example.com',
      role: 'Operations Manager',
    },
    showFooter: false,
    activeMenuKey: 'dashboard',
  },
};
