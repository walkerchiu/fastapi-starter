/**
 * Placeholder GraphQL types and documents.
 * TODO: Replace with actual generated types from GraphQL codegen.
 */
import { gql } from 'urql';

// User type placeholder
export interface UserType {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Placeholder document for fetching current user
export const MeDocument = gql`
  query Me {
    me {
      id
      email
      name
      isActive
      isEmailVerified
      isTwoFactorEnabled
      createdAt
      updatedAt
    }
  }
`;

// Placeholder document for fetching users list
export const UsersDocument = gql`
  query Users($limit: Int) {
    users(limit: $limit) {
      id
      email
      name
      isActive
      isEmailVerified
      isTwoFactorEnabled
      createdAt
      updatedAt
    }
  }
`;
