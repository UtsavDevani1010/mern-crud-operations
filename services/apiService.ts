
import type { Credentials, Table, Column, RecordRow, AdvancedFilter, SortConfig, User } from '../types';

// IMPORTANT: The base URL for your API.
const API_BASE_URL = 'https://api.example.com'; 

class ApiService {
    private currentUser: User | null = null;

    constructor() {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
        }
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    private getHeaders() {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (this.currentUser?.token) {
            headers['Authorization'] = `Bearer ${this.currentUser.token}`;
        }
        return headers;
    }
    
    // --- AUTHENTICATION ---
    async login(credentials: Credentials): Promise<User> {
        console.log('Attempting login for:', credentials.username);
        // --- API CALL PLACEHOLDER ---
        // const response = await fetch(`${API_BASE_URL}/auth/login`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(credentials),
        // });
        // if (!response.ok) throw new Error('Invalid username or password.');
        // const user: User = await response.json();
        // 
        // --- EXPECTED API RESPONSE ---
        // {
        //   "id": 1,
        //   "username": "admin_user",
        //   "role": "Admin",
        //   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        // }
        // -----------------------------
        
        // Mocking API call
        await new Promise(resolve => setTimeout(resolve, 500));
        let mockUser: User;
        if (credentials.username === 'admin' && credentials.password === 'admin') {
            mockUser = { id: 1, username: 'admin', role: 'Admin', token: 'fake-admin-token' };
        } else if (credentials.username === 'user' && credentials.password === 'user') {
            mockUser = { id: 2, username: 'user', role: 'User', token: 'fake-user-token' };
        } else {
            throw new Error('Invalid credentials.');
        }

        this.currentUser = mockUser;
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        return mockUser;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        console.log('User logged out.');
    }

    // --- MOCK DATA ---
    private MOCK_TABLES: Table[] = [
        { name: 'users', columns: [ { name: 'id', type: 'INT', isPrimaryKey: true }, { name: 'username', type: 'VARCHAR' } ]},
        { name: 'products', columns: [ { name: 'id', type: 'INT', isPrimaryKey: true }, { name: 'name', type: 'VARCHAR' }, { name: 'price', type: 'DECIMAL' } ]},
    ];

    // --- SCHEMA MANAGEMENT (TABLES) ---
    async getTables(): Promise<Table[]> {
        console.log('Fetching tables...');
        // --- API CALL PLACEHOLDER ---
        // const response = await fetch(`${API_BASE_URL}/tables`, { headers: this.getHeaders() });
        // if (!response.ok) throw new Error('Failed to fetch tables.');
        // return response.json();
        //
        // --- EXPECTED API RESPONSE ---
        // [
        //   { 
        //     "name": "users", 
        //     "columns": [
        //       { "name": "id", "type": "INT", "isPrimaryKey": true, "isAutoIncrement": true },
        //       { "name": "username", "type": "VARCHAR" },
        //       ...
        //     ] 
        //   },
        //   ...
        // ]
        // -----------------------------
        await new Promise(resolve => setTimeout(resolve, 500));
        return Promise.resolve(this.MOCK_TABLES);
    }

    async createTable(tableName: string, columns: Column[]): Promise<void> {
        console.log(`Creating table ${tableName}`);
        // --- API CALL PLACEHOLDER ---
        // const response = await fetch(`${API_BASE_URL}/tables`, {
        //     method: 'POST',
        //     headers: this.getHeaders(),
        //     body: JSON.stringify({ tableName, columns }),
        // });
        // if (!response.ok) throw new Error('Failed to create table.');
        // --- EXPECTED API RESPONSE ---
        // Status 201 Created with no body, or { "message": "Table created successfully" }
        // -----------------------------
        await new Promise(resolve => setTimeout(resolve, 500));
        this.MOCK_TABLES.push({ name: tableName, columns });
        return Promise.resolve();
    }

    async deleteTable(tableName: string): Promise<void> {
        console.log(`Deleting table ${tableName}`);
        // --- API CALL PLACEHOLDER ---
        // const response = await fetch(`${API_BASE_URL}/tables/${tableName}`, {
        //     method: 'DELETE',
        //     headers: this.getHeaders(),
        // });
        // if (!response.ok) throw new Error('Failed to delete table.');
        // --- EXPECTED API RESPONSE ---
        // Status 204 No Content, or { "message": "Table deleted successfully" }
        // -----------------------------
        await new Promise(resolve => setTimeout(resolve, 500));
        this.MOCK_TABLES = this.MOCK_TABLES.filter(t => t.name !== tableName);
        return Promise.resolve();
    }

    // --- DATA MANAGEMENT (RECORDS) ---
    async getRecords(tableName: string, filters?: AdvancedFilter, sort?: SortConfig, page: number = 1, limit: number = 20): Promise<{ records: RecordRow[], total: number }> {
        console.log(`Fetching records for ${tableName}`);
        // --- API CALL PLACEHOLDER ---
        // const queryParams = new URLSearchParams({ page: String(page), limit: String(limit) });
        // ...
        // const response = await fetch(`${API_BASE_URL}/tables/${tableName}/records?${queryParams}`, { ... });
        // if (!response.ok) throw new Error('Failed to fetch records.');
        // return response.json();
        //
        // --- EXPECTED API RESPONSE ---
        // {
        //   "records": [
        //     { "id": 1, "username": "test", ... },
        //     { "id": 2, "username": "test2", ... }
        //   ],
        //   "total": 150
        // }
        // -----------------------------
        await new Promise(resolve => setTimeout(resolve, 500));
        const records = [{ id: 1, name: `Mock Record 1 for ${tableName}`}, { id: 2, name: `Mock Record 2 for ${tableName}`}];
        return Promise.resolve({ records, total: 2 });
    }

    async createRecord(tableName: string, data: Omit<RecordRow, 'id'>): Promise<RecordRow> {
        const recordData = { 
            ...data, 
            created_by: this.currentUser?.id,
            modified_by: this.currentUser?.id
        };
        console.log(`Creating record in ${tableName}`, recordData);
        // --- API CALL PLACEHOLDER ---
        // const response = await fetch(`${API_BASE_URL}/tables/${tableName}/records`, {
        //     method: 'POST',
        //     headers: this.getHeaders(),
        //     body: JSON.stringify(recordData),
        // });
        // if (!response.ok) throw new Error('Failed to create record.');
        // return response.json();
        //
        // --- EXPECTED API RESPONSE (the newly created record) ---
        // {
        //   "id": 123,
        //   "created_at": "2023-10-27T10:00:00Z",
        //   "modified_at": "2023-10-27T10:00:00Z",
        //   "created_by": 1,
        //   "modified_by": 1,
        //   ...other fields
        // }
        // -----------------------------
        await new Promise(resolve => setTimeout(resolve, 300));
        const newRecord = { ...recordData, id: Math.random() };
        return Promise.resolve(newRecord);
    }
    
    async updateRecord(tableName: string, recordId: number | string, data: RecordRow): Promise<RecordRow> {
        const recordData = { 
            ...data,
            modified_by: this.currentUser?.id
        };
        console.log(`Updating record ${recordId} in ${tableName}`, recordData);
        // --- API CALL PLACEHOLDER ---
        // const response = await fetch(`${API_BASE_URL}/tables/${tableName}/records/${recordId}`, {
        //     method: 'PUT',
        //     headers: this.getHeaders(),
        //     body: JSON.stringify(recordData),
        // });
        // if (!response.ok) throw new Error('Failed to update record.');
        // return response.json();
        //
        // --- EXPECTED API RESPONSE (the updated record) ---
        // {
        //   "id": 123,
        //   ...
        //   "modified_at": "2023-10-27T12:30:00Z",
        //   "modified_by": 1,
        //   ...other fields
        // }
        // -----------------------------
        await new Promise(resolve => setTimeout(resolve, 300));
        return Promise.resolve({ ...recordData, id: recordId });
    }

    async deleteRecord(tableName: string, recordId: number | string): Promise<void> {
        console.log(`Deleting record ${recordId} in ${tableName}`);
        // --- API CALL PLACEHOLDER ---
        // const response = await fetch(`${API_BASE_URL}/tables/${tableName}/records/${recordId}`, {
        //     method: 'DELETE',
        //     headers: this.getHeaders(),
        // });
        // if (!response.ok) throw new Error('Failed to delete record.');
        // --- EXPECTED API RESPONSE ---
        // Status 204 No Content
        // -----------------------------
        await new Promise(resolve => setTimeout(resolve, 300));
        return Promise.resolve();
    }
}

export const apiService = new ApiService();
