import { type ReactNode } from 'react';
import { Form } from 'antd';
import type { FormItemProps } from 'antd';

export interface FormFieldProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  name?: string;
}

export function FormField({
  label,
  error,
  description,
  required,
  children,
  className,
  name,
}: FormFieldProps) {
  const formItemProps: FormItemProps = {
    label,
    required,
    className,
    name,
    help: error,
    validateStatus: error ? 'error' : undefined,
    extra: !error && description ? description : undefined,
  };

  return <Form.Item {...formItemProps}>{children}</Form.Item>;
}
