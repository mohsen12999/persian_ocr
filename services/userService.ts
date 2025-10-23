import { User } from '../types';

// A mock user database. In a real application, this would be an API call.
const mockUsers: User[] = [
  { id: 101, name: 'علی رضایی' },
  { id: 102, name: 'مریم حسینی' },
  { id: 103, name: 'احمد محمدی' },
  { id: 104, name: 'فاطمه کریمی' },
  { id: 105, name: 'حسین جعفری' },
];

/**
 * Fetches a list of users.
 * @returns A promise that resolves to an array of User objects.
 */
export const fetchUsers = (): Promise<User[]> => {
  console.log('Fetching users from API...');
  // Simulate network latency
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockUsers);
    }, 300);
  });
};
