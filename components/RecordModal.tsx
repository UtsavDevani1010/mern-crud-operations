
import React, { useState } from 'react';
import type { Table, RecordRow, Column } from '../types';
import { apiService } from '../services/apiService';
import { Spinner } from './Spinner';

interface RecordModalProps {
    table: Table;
    record: RecordRow | null; // null for creating, object for editing
    onClose: () => void;
    onSave: () => void;
}

const getInitialState = (table: Table, record: RecordRow | null) => {
    const initialState: RecordRow = {};
    table.columns.forEach(col => {
        initialState[col.name] = record ? record[col.name] : '';
    });
    return initialState;
};

const renderInputField = (col: Column, value: any, handleChange: (name: string, value: any) => void) => {
    const commonClasses = "w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition";
    
    switch (col.type) {
        case 'BOOLEAN':
            return <input type="checkbox" checked={!!value} onChange={e => handleChange(col.name, e.target.checked)} className="h-5 w-5 rounded bg-black/20 border-white/20 text-blue-500 focus:ring-blue-500" />;
        case 'DATE':
             return <input type="date" value={value ? new Date(value).toISOString().split('T')[0] : ''} onChange={e => handleChange(col.name, e.target.value)} className={commonClasses} />;
        case 'TIMESTAMP':
            return <input type="datetime-local" value={value ? new Date(value).toISOString().slice(0, 16) : ''} onChange={e => handleChange(col.name, e.target.value)} className={commonClasses} />;
        case 'INT':
        case 'DECIMAL':
        case 'FLOAT':
            return <input type="number" value={value} onChange={e => handleChange(col.name, e.target.value)} className={commonClasses} />;
        case 'TEXT':
            return <textarea value={value} onChange={e => handleChange(col.name, e.target.value)} className={commonClasses} rows={3}></textarea>;
        default:
            return <input type="text" value={value} onChange={e => handleChange(col.name, e.target.value)} className={commonClasses} />;
    }
};

const HIDDEN_COLUMNS = ['created_at', 'modified_at', 'created_by', 'modified_by'];

export const RecordModal: React.FC<RecordModalProps> = ({ table, record, onClose, onSave }) => {
    const [formData, setFormData] = useState<RecordRow>(getInitialState(table, record));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = record !== null;
    const pkColumn = table.columns.find(c => c.isPrimaryKey)?.name || 'id';

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (isEditing) {
                const recordId = record[pkColumn];
                await apiService.updateRecord(table.name, recordId, formData);
            } else {
                await apiService.createRecord(table.name, formData);
            }
            onSave();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{isEditing ? `Edit Record in ${table.name}` : `Create Record in ${table.name}`}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {error && <div className="bg-red-500/50 text-white p-3 rounded-lg border border-red-500">{error}</div>}
                    {table.columns.filter(col => !col.isAutoIncrement && !HIDDEN_COLUMNS.includes(col.name)).map(col => (
                        <div key={col.name}>
                            <label className="block text-sm font-medium text-gray-300 mb-1">{col.name} ({col.type})</label>
                            {renderInputField(col, formData[col.name], handleChange)}
                        </div>
                    ))}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600/50 hover:bg-gray-700/50 rounded-lg transition">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg transition flex items-center">
                            {isLoading && <Spinner small />}
                            {isEditing ? 'Save Changes' : 'Create Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
