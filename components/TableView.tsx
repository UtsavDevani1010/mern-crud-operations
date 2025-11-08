
import React, { useState, useEffect, useCallback } from 'react';
import type { Table, RecordRow, SortConfig, AdvancedFilter } from '../types';
import { apiService } from '../services/apiService';
import { Spinner } from './Spinner';
import { RecordModal } from './RecordModal';

interface TableViewProps {
    table: Table;
}

const ROWS_PER_PAGE = 15;

export const TableView: React.FC<TableViewProps> = ({ table }) => {
    const [records, setRecords] = useState<RecordRow[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<RecordRow | null>(null);

    const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);

    const fetchRecords = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { records: fetchedRecords, total } = await apiService.getRecords(table.name, undefined, sortConfig, currentPage, ROWS_PER_PAGE);
            setRecords(fetchedRecords);
            setTotalRecords(total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch records.');
        } finally {
            setIsLoading(false);
        }
    }, [table.name, sortConfig, currentPage]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };
    
    const handleRecordSave = () => {
        fetchRecords();
        setIsModalOpen(false);
        setSelectedRecord(null);
    };

    const handleDelete = async (record: RecordRow) => {
        const pkColumn = table.columns.find(c => c.isPrimaryKey)?.name || 'id';
        const recordId = record[pkColumn];
        if (!recordId) {
            alert("Could not determine the primary key for this record.");
            return;
        }

        if (window.confirm(`Are you sure you want to delete record with ${pkColumn} = ${recordId}?`)) {
            try {
                await apiService.deleteRecord(table.name, recordId);
                fetchRecords();
            } catch (err) {
                 alert(`Error deleting record: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }
    }
    
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-4 sm:p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">{table.name}</h2>
                <button
                    onClick={() => { setSelectedRecord(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                    Add Record
                </button>
            </div>
            
            {/* TODO: Add filtering UI here */}

            {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>}

            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full"><Spinner /></div>
                ) : (
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-200 uppercase bg-white/5 sticky top-0 backdrop-blur-sm">
                            <tr>
                                {table.columns.map(col => (
                                    <th key={col.name} scope="col" className="px-4 py-3 cursor-pointer" onClick={() => handleSort(col.name)}>
                                        <div className="flex items-center">
                                            {col.name}
                                            {sortConfig?.key === col.name && (
                                                <span className="ml-1">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                <th scope="col" className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr key={index} className="border-b border-gray-700 hover:bg-white/5">
                                    {table.columns.map(col => (
                                        <td key={col.name} className="px-4 py-3 whitespace-nowrap">
                                            {String(record[col.name])}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => { setSelectedRecord(record); setIsModalOpen(true); }} className="font-medium text-blue-400 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(record)} className="font-medium text-red-400 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                 {records.length === 0 && !isLoading && <div className="text-center py-8 text-gray-400">No records found.</div>}
            </div>
             {/* Pagination */}
             <div className="flex justify-between items-center pt-4 mt-auto">
                <span className="text-sm text-gray-400">
                    Showing {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, totalRecords)} to {Math.min(currentPage * ROWS_PER_PAGE, totalRecords)} of {totalRecords}
                </span>
                <div className="flex items-center space-x-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
                    <span className="text-sm">{currentPage} / {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
            </div>

            {isModalOpen && (
                <RecordModal
                    table={table}
                    record={selectedRecord}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleRecordSave}
                />
            )}
        </div>
    );
};
