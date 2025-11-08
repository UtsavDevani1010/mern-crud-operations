
import React, { useState } from 'react';
import type { Column, ColumnDataType } from '../types';
import { apiService } from '../services/apiService';
import { Spinner } from './Spinner';

interface CreateTableModalProps {
    onClose: () => void;
    onTableCreated: () => void;
}

const defaultColumns: Column[] = [
    { name: 'id', type: 'INT', isPrimaryKey: true, isAutoIncrement: true, isNullable: false },
    { name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP', isNullable: false },
    { name: 'modified_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP', isNullable: false }, // Logic for ON UPDATE should be in backend
    { name: 'created_by', type: 'INT', isNullable: true }, // Foreign key to users table
    { name: 'modified_by', type: 'INT', isNullable: true }, // Foreign key to users table
];

const DATA_TYPES: ColumnDataType[] = ['INT', 'VARCHAR', 'TEXT', 'DATE', 'TIMESTAMP', 'BOOLEAN', 'FLOAT', 'DECIMAL'];

export const CreateTableModal: React.FC<CreateTableModalProps> = ({ onClose, onTableCreated }) => {
    const [tableName, setTableName] = useState('');
    const [columns, setColumns] = useState<Column[]>([ { name: '', type: 'VARCHAR', isNullable: true } ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleColumnChange = (index: number, field: keyof Column, value: any) => {
        const newColumns = [...columns];
        (newColumns[index] as any)[field] = value;
        setColumns(newColumns);
    };

    const addColumn = () => {
        setColumns([...columns, { name: '', type: 'VARCHAR', isNullable: true }]);
    };
    
    const removeColumn = (index: number) => {
        setColumns(columns.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tableName || columns.some(c => !c.name || !c.type)) {
            setError("Table name and all column names/types are required.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const finalColumns = [...defaultColumns, ...columns];
            await apiService.createTable(tableName, finalColumns);
            onTableCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Create New Table</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col overflow-hidden">
                    {error && <div className="bg-red-500/50 text-white p-3 rounded-lg border border-red-500 mb-4">{error}</div>}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Table Name</label>
                        <input
                            type="text"
                            value={tableName}
                            onChange={e => setTableName(e.target.value)}
                            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Columns</h3>
                    <div className="overflow-y-auto pr-2 flex-1">
                        {/* Default columns */}
                        {defaultColumns.map(col => (
                             <div key={col.name} className="grid grid-cols-12 gap-2 mb-2 items-center text-sm p-2 bg-white/5 rounded-md">
                                <div className="col-span-4 text-gray-400">{col.name}</div>
                                <div className="col-span-3 text-gray-400">{col.type}</div>
                                <div className="col-span-5 text-gray-400 text-xs">
                                    {col.isPrimaryKey && 'PK '}{col.isAutoIncrement && 'AI '}{col.defaultValue}
                                </div>
                            </div>
                        ))}

                        {/* User-defined columns */}
                        {columns.map((col, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                <input type="text" placeholder="name" value={col.name} onChange={e => handleColumnChange(index, 'name', e.target.value)} className="col-span-4 px-2 py-1 bg-black/20 border border-white/20 rounded text-sm" />
                                <select value={col.type} onChange={e => handleColumnChange(index, 'type', e.target.value)} className="col-span-3 px-2 py-1 bg-black/20 border border-white/20 rounded text-sm">
                                    {DATA_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                                </select>
                                <input type="text" placeholder="default value" value={col.defaultValue || ''} onChange={e => handleColumnChange(index, 'defaultValue', e.target.value)} className="col-span-3 px-2 py-1 bg-black/20 border border-white/20 rounded text-sm" />
                                <button type="button" onClick={() => removeColumn(index)} className="col-span-2 text-red-500 hover:text-red-400 text-center">Remove</button>
                            </div>
                        ))}
                         <button type="button" onClick={addColumn} className="mt-2 text-sm text-blue-400 hover:text-blue-300">+ Add Column</button>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 mt-auto">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600/50 hover:bg-gray-700/50 rounded-lg">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded-lg flex items-center">
                            {isLoading && <Spinner small />}
                            Create Table
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
