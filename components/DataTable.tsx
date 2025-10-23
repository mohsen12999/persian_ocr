import React from 'react';
import { ExtractedData } from '../types';

interface DataTableProps {
  data: ExtractedData;
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const { headers, rows } = data;

  if (!headers || headers.length === 0 || !rows || rows.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No data to display. The model might not have found a table in the image.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-gray-800 rounded-lg shadow-xl animate-fade-in">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="bg-gray-700 text-xs text-gray-300 uppercase">
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col" className="px-6 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
              {headers.map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4" dir="rtl">
                  {row[colIndex] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};