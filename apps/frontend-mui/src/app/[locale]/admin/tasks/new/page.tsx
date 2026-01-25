'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { useCreateScheduledTask, useTaskTypes } from '@/hooks/api';

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
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </Stack>
        }
      />
      <PageContent>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <PageSection>
            <Card>
              <CardContent>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  {submitError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {submitError}
                    </Alert>
                  )}

                  {/* Basic Info */}
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Stack spacing={3} sx={{ mb: 4 }}>
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: 'Name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Name"
                          required
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          placeholder="Enter task name"
                        />
                      )}
                    />

                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Description"
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Describe what this task does"
                        />
                      )}
                    />

                    <Controller
                      name="task_type"
                      control={control}
                      rules={{ required: 'Task type is required' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.task_type}>
                          <InputLabel required>Task Type</InputLabel>
                          <Select
                            {...field}
                            label="Task Type"
                            disabled={typesLoading}
                          >
                            <MenuItem value="">Select a task type</MenuItem>
                            {taskTypes?.map((type) => (
                              <MenuItem key={type.type} value={type.type}>
                                {type.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.task_type && (
                            <FormHelperText>
                              {errors.task_type.message}
                            </FormHelperText>
                          )}
                          {selectedTaskType && taskTypes && (
                            <FormHelperText>
                              {
                                taskTypes.find(
                                  (t) => t.type === selectedTaskType,
                                )?.description
                              }
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  {/* Schedule */}
                  <Typography variant="h6" gutterBottom>
                    Schedule
                  </Typography>
                  <Stack spacing={3} sx={{ mb: 4 }}>
                    <Controller
                      name="cron_expression"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Cron Expression"
                          fullWidth
                          placeholder="*/5 * * * *"
                          helperText="Examples: */5 * * * * (every 5 min), 0 * * * * (hourly), 0 0 * * * (daily)"
                          InputProps={{
                            sx: { fontFamily: 'monospace' },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="timezone"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Timezone</InputLabel>
                          <Select {...field} label="Timezone">
                            <MenuItem value="UTC">UTC</MenuItem>
                            <MenuItem value="America/New_York">
                              America/New_York (EST)
                            </MenuItem>
                            <MenuItem value="America/Los_Angeles">
                              America/Los_Angeles (PST)
                            </MenuItem>
                            <MenuItem value="Europe/London">
                              Europe/London (GMT)
                            </MenuItem>
                            <MenuItem value="Asia/Tokyo">
                              Asia/Tokyo (JST)
                            </MenuItem>
                            <MenuItem value="Asia/Taipei">
                              Asia/Taipei (CST)
                            </MenuItem>
                            <MenuItem value="Asia/Shanghai">
                              Asia/Shanghai (CST)
                            </MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  {/* Context */}
                  <Typography variant="h6" gutterBottom>
                    Task Context
                  </Typography>
                  <Stack spacing={3} sx={{ mb: 4 }}>
                    <Controller
                      name="context"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Context (JSON)"
                          fullWidth
                          multiline
                          rows={5}
                          placeholder='{"key": "value"}'
                          helperText="Optional JSON object passed to the task handler"
                          InputProps={{
                            sx: { fontFamily: 'monospace' },
                          }}
                        />
                      )}
                    />
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  {/* Status */}
                  <Typography variant="h6" gutterBottom>
                    Status
                  </Typography>
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        }
                        label="Enable task immediately after creation"
                      />
                    )}
                  />
                </Box>
              </CardContent>
            </Card>
          </PageSection>
        </Box>
      </PageContent>
    </>
  );
}
