
import React, { useState } from 'react';
import type { Table, User } from '../types';
import { CreateTableModal } from './CreateTableModal';
import { apiService } from '../services/apiService';

interface SidebarProps {
    user: User;
    tables: Table[];
    selectedTable: Table | null;
    onTableSelect: (table: Table) => void;
    onLogout: () => void;
    onTableCreated: () => void;
    onTableDeleted: (tableName: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, tables, selectedTable, onTableSelect, onLogout, onTableCreated, onTableDeleted, isOpen, setIsOpen }) => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const isAdmin = user.role === 'Admin';

    const handleDelete = async (tableName: string) => {
        if (window.confirm(`Are you sure you want to delete the table "${tableName}"? This action cannot be undone.`)) {
            try {
                await apiService.deleteTable(tableName);
                onTableDeleted(tableName);
            } catch (error) {
                alert(`Error deleting table: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }

    return (
        <>
            <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-black/30 backdrop-blur-xl border-r border-white/10 w-64`}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Tables</h2>
                     <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-300 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {tables.map(table => (
                        <div key={table.name} className="group flex items-center justify-between rounded-md">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onTableSelect(table); }}
                                className={`flex-1 block px-3 py-2 text-sm font-medium rounded-md transition-colors ${selectedTable?.name === table.name ? 'bg-blue-500/30 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                            >
                                {table.name}
                            </a>
                            {isAdmin && (
                                <button onClick={() => handleDelete(table.name)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10 space-y-2">
                     {isAdmin && (
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="w-full flex items-center justify-center py-2 px-4 bg-green-600/80 hover:bg-green-700/80 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Table
                        </button>
                     )}
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center py-2 px-4 bg-red-600/80 hover:bg-red-700/80 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>
            {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}

            {isCreateModalOpen && (
                <CreateTableModal
                    onClose={() => setCreateModalOpen(false)}
                    onTableCreated={() => {
                        setCreateModalOpen(false);
                        onTableCreated();
                    }}
                />
            )}
        </>
    );
};
