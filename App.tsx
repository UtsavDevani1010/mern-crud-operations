
import React, { useState, useCallback, useEffect } from 'react';
import type { User, Table } from './types';
import { apiService } from './services/apiService';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { TableView } from './components/TableView';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(apiService.getCurrentUser());
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAppLoading, setIsAppLoading] = useState(true);

    const fetchTables = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        setError(null);
        try {
            const fetchedTables = await apiService.getTables();
            setTables(fetchedTables);
            setSelectedTable(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            // Potentially handle token expiry here by logging out
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);
    
    useEffect(() => {
        // On initial load, if a user is found, fetch their tables
        if (currentUser) {
            fetchTables();
        }
        setIsAppLoading(false);

        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [currentUser, fetchTables]);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        apiService.logout();
        setCurrentUser(null);
        setTables([]);
        setSelectedTable(null);
    };

    const handleTableSelect = (table: Table) => {
        setSelectedTable(table);
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };
    
    const handleTableCreated = () => {
        fetchTables();
    };

    const handleTableDeleted = (tableName: string) => {
        fetchTables().then(() => {
            if(selectedTable?.name === tableName) {
                setSelectedTable(null);
            }
        });
    };
    
    if (isAppLoading) {
        return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
    }

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar 
                user={currentUser}
                tables={tables}
                selectedTable={selectedTable}
                onTableSelect={handleTableSelect}
                onLogout={handleLogout}
                onTableCreated={handleTableCreated}
                onTableDeleted={handleTableDeleted}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <main className="flex-1 flex flex-col transition-all duration-300 ease-in-out" style={{ marginLeft: isSidebarOpen ? (window.innerWidth < 768 ? '0' : '256px') : '0'}}>
                <div className="p-4 md:p-6 flex-1 overflow-auto">
                    {isLoading && tables.length === 0 && <div className="flex items-center justify-center h-full"><Spinner /></div>}
                    {selectedTable ? (
                        <TableView key={selectedTable.name} table={selectedTable} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-center">
                            <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg">
                                <h2 className="text-2xl font-bold mb-2">Welcome, {currentUser.username}!</h2>
                                <p className="text-gray-300">Select a table from the sidebar to view its records or create a new one.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
             <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-transform duration-300"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
    );
};

export default App;
