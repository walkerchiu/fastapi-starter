'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  Select,
  Space,
  Typography,
} from 'antd';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { useCreateScheduledTask, useTaskTypes } from '@/hooks/api';

const { Title } = Typography;
const { TextArea } = Input;

interface TaskFormData {
  name: string;
  description: string;
  task_type: string;
  cron_expression: string;
  timezone: string;
  context: string;
  is_active: boolean;
}

export default function NewScheduledTaskPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: taskTypes, isLoading: typesLoading } = useTaskTypes();
  const createTaskMutation = useCreateScheduledTask();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    defaultValues: {
      name: '',
      description: '',
      task_type: '',
      cron_expression: '',
      timezone: 'UTC',
      context: '',
      is_active: true,
    },
  });

  const selectedTaskType = watch('task_type');

  const onSubmit = async (data: TaskFormData) => {
    setSubmitError(null);

    try {
      let contextParsed = null;
      if (data.context.trim()) {
        try {
          contextParsed = JSON.parse(data.context);
        } catch {
          setSubmitError('Invalid JSON in context field');
          return;
        }
      }

      await createTaskMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        task_type: data.task_type,
        cron_expression: data.cron_expression || undefined,
        timezone: data.timezone,
        context: contextParsed,
        is_active: data.is_active,
      });

      router.push('/admin/tasks');
    } catch (err) {
      console.error('Failed to create task:', err);
      setSubmitError('Failed to create task. Please try again.');
    }
  };

  return (
    <>
      <PageHeader
        title="Create Scheduled Task"
        description="Set up a new automated task"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Scheduled Tasks', href: '/admin/tasks' },
          { label: 'New Task' },
        ]}
        actions={
          <Space>
            <Button onClick={() => router.back()}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting || createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </Space>
        }
      />
      <PageContent>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <PageSection>
            <Card>
              <Form layout="vertical">
                {submitError && (
                  <Alert
                    type="error"
                    message={submitError}
                    style={{ marginBottom: 24 }}
                  />
                )}

                {/* Basic Info */}
                <Title level={5} style={{ marginBottom: 16 }}>
                  Basic Information
                </Title>

                <Form.Item
                  label="Name"
                  required
                  validateStatus={errors.name ? 'error' : undefined}
                  help={errors.name?.message}
                >
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <Input {...field} placeholder="Enter task name" />
                    )}
                  />
                </Form.Item>

                <Form.Item label="Description">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        {...field}
                        rows={3}
                        placeholder="Describe what this task does"
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label="Task Type"
                  required
                  validateStatus={errors.task_type ? 'error' : undefined}
                  help={
                    errors.task_type?.message ||
                    (selectedTaskType &&
                      taskTypes &&
                      taskTypes.find((t) => t.type === selectedTaskType)
                        ?.description)
                  }
                >
                  <Controller
                    name="task_type"
                    control={control}
                    rules={{ required: 'Task type is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select a task type"
                        loading={typesLoading}
                        options={taskTypes?.map((type) => ({
                          label: type.name,
                          value: type.type,
                        }))}
                      />
                    )}
                  />
                </Form.Item>

                <Divider />

                {/* Schedule */}
                <Title level={5} style={{ marginBottom: 16 }}>
                  Schedule
                </Title>

                <Form.Item
                  label="Cron Expression"
                  help="Examples: */5 * * * * (every 5 min), 0 * * * * (hourly), 0 0 * * * (daily)"
                >
                  <Controller
                    name="cron_expression"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="*/5 * * * *"
                        style={{ fontFamily: 'monospace' }}
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item label="Timezone">
                  <Controller
                    name="timezone"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={[
                          { label: 'UTC', value: 'UTC' },
                          {
                            label: 'America/New_York (EST)',
                            value: 'America/New_York',
                          },
                          {
                            label: 'America/Los_Angeles (PST)',
                            value: 'America/Los_Angeles',
                          },
                          {
                            label: 'Europe/London (GMT)',
                            value: 'Europe/London',
                          },
                          { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
                          { label: 'Asia/Taipei (CST)', value: 'Asia/Taipei' },
                          {
                            label: 'Asia/Shanghai (CST)',
                            value: 'Asia/Shanghai',
                          },
                        ]}
                      />
                    )}
                  />
                </Form.Item>

                <Divider />

                {/* Context */}
                <Title level={5} style={{ marginBottom: 16 }}>
                  Task Context
                </Title>

                <Form.Item
                  label="Context (JSON)"
                  help="Optional JSON object passed to the task handler"
                >
                  <Controller
                    name="context"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        {...field}
                        rows={5}
                        placeholder='{"key": "value"}'
                        style={{ fontFamily: 'monospace' }}
                      />
                    )}
                  />
                </Form.Item>

                <Divider />

                {/* Status */}
                <Title level={5} style={{ marginBottom: 16 }}>
                  Status
                </Title>

                <Form.Item>
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      >
                        Enable task immediately after creation
                      </Checkbox>
                    )}
                  />
                </Form.Item>
              </Form>
            </Card>
          </PageSection>
        </div>
      </PageContent>
    </>
  );
}
