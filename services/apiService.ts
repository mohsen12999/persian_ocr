// A mock API service to simulate saving data to a database.
export const saveRowData = (row: (string | number | null)[], dataTypes: string[], processingDate: string): Promise<{ success: true }> => {
  console.log('Saving row:', { data: row, types: dataTypes, date: processingDate });
  // Simulate network latency and potential failure
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate a 1 in 3 chance of failure to test retry logic
      if (Math.random() < 0.33) {
        reject(new Error("Failed to save data to the server. Please check your connection."));
      } else {
        resolve({ success: true });
      }
    }, 500 + Math.random() * 500); // Random delay between 500ms and 1000ms
  });
};