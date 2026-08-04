/**
 * Domain services compose repositories and enforce business rules.
 * Feature modules will register concrete services in later steps.
 */

export type ServiceContext = {
  userId: string;
};
