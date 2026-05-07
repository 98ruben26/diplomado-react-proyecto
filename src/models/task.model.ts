import { z } from 'zod';

export interface Task {
  id: number;
  name: string;
  done: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const schemaTask = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .trim(),
});

export type TaskFormValues = z.infer<typeof schemaTask>;