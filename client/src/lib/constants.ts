export const SORT_ORDERS = {
  ASC: "asc" as const,
  DESC: "desc" as const,
};

export const CREATE_TITLE = (item: string) => `Create New ${item}`;
export const UPDATE_TITLE = (item: string) => `Update ${item}`;
export const DELETE_TITLE = (item: string) => `Delete ${item}`;