export const getHeaderClass = (column) => {
  if (column.value === 'actions') {
    return 'text-right bg-gray-100 px-4 py-2';
  }
  return 'text-left bg-gray-100 px-4 py-2';
};