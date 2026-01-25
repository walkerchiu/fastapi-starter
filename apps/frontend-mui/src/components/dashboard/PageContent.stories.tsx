import type { Meta, StoryObj } from '@storybook/react';
import { PageContent } from './PageContent';
import { PageSection } from './PageSection';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const meta: Meta<typeof PageContent> = {
  title: 'Dashboard/PageContent',
  component: PageContent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SampleSection = ({ title }: { title: string }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This is sample content for the section. It demonstrates how content is
        laid out within the PageContent component.
      </Typography>
    </CardContent>
  </Card>
);

export const Default: Story = {
  args: {
    children: (
      <>
        <SampleSection title="Section 1" />
        <SampleSection title="Section 2" />
        <SampleSection title="Section 3" />
      </>
    ),
  },
};

export const WithPageSections: Story = {
  args: {
    children: (
      <>
        <PageSection title="Profile Information">
          <Typography variant="body2" color="text.secondary">
            Your profile information is displayed here.
          </Typography>
        </PageSection>
        <PageSection title="Account Settings">
          <Typography variant="body2" color="text.secondary">
            Manage your account settings and preferences.
          </Typography>
        </PageSection>
        <PageSection title="Security">
          <Typography variant="body2" color="text.secondary">
            Update your password and security settings.
          </Typography>
        </PageSection>
      </>
    ),
  },
};

export const SingleSection: Story = {
  args: {
    children: <SampleSection title="Single Section" />,
  },
};

export const ManyItems: Story = {
  args: {
    children: (
      <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SampleSection key={i} title={`Section ${i}`} />
        ))}
      </>
    ),
  },
};
