// Minimal mock database for Playwright tests
// Provides the subset of API used by orderRepository.ts
// insertInto('orders').values(data).execute()
// deleteFrom('orders').where(...).execute()

export const db = {
  insertInto: (table) => {
    return {
      values: (data) => {
        return {
          execute: async () => {
            // No-op: In test environment we don't persist data
          },
        };
      },
    };
  },
  deleteFrom: (table) => {
    return {
      where: (field, _op, _value) => {
        return {
          execute: async () => {
            // No-op deletion
          },
        };
      },
    };
  },
};
