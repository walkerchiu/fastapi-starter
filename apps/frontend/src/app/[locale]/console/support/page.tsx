'use client';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Badge, Button, Card, CardBody } from '@/components/ui';

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
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      default:
        return 'neutral';
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
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          ticket.priority === 'High'
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            : ticket.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {ticket.id} - {ticket.subject}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {ticket.customer} • {ticket.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          getPriorityVariant(ticket.priority) as
                            | 'error'
                            | 'warning'
                            | 'neutral'
                        }
                      >
                        {ticket.priority}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-600 text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-500 dark:hover:bg-amber-900/20"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </PageSection>
      </PageContent>
    </>
  );
}
