import type { Credentials, Table, Column, RecordRow, AdvancedFilter, SortConfig, User } from '../types';

// IMPORTANT: The base URL for your API.
// Set to your local running backend URL
const API_BASE_URL = 'https://dynamic-db-backend-utsav.onrender.com'; 

// Helper function to throw errors with the message from the API response
async function handleResponse(response: Response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network or server error.' }));
        const message = errorData.message || response.statusText;
        throw new Error(message);
    }
    // Return empty object if status is 204 No Content
    if (response.status === 204) {
        return {};
    }
    return response.json();
}

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

    private getHeaders(contentType: boolean = true) {
        const headers: Record<string, string> = {};
        
        if (contentType) {
             headers['Content-Type'] = 'application/json';
        }

        if (this.currentUser?.token) {
            headers['Authorization'] = `Bearer ${this.currentUser.token}`;
        }
        return headers;
    }
    
    // --- AUTHENTICATION ---
    async login(credentials: Credentials): Promise<User> {
        console.log('Attempting login for:', credentials.username);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(credentials),
        });

        const user: User = await handleResponse(response);
        
        // Save user state on successful login
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        console.log('User logged out.');
    }

    // --- SCHEMA MANAGEMENT (TABLES) ---
    async getTables(): Promise<Table[]> {
        console.log('Fetching tables...');
        
        const response = await fetch(`${API_BASE_URL}/tables`, { 
            headers: this.getHeaders(false) // No Content-Type needed for GET requests
        });

        // The response contains the metadata stored in DynamicTable model
        return handleResponse(response) as Promise<Table[]>;
    }

    async createTable(tableName: string, columns: Column[]): Promise<void> {
        console.log(`Creating table ${tableName}`);
        
        const response = await fetch(`${API_BASE_URL}/tables`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ tableName, columns }),
        });
        
        // Expected Status 201 Created (no body needed)
        await handleResponse(response);
    }

    async deleteTable(tableName: string): Promise<void> {
        console.log(`Deleting table ${tableName}`);
        
        const response = await fetch(`${API_BASE_URL}/tables/${tableName}`, {
            method: 'DELETE',
            headers: this.getHeaders(false), // No Content-Type needed for DELETE
        });

        // Expected Status 204 No Content (no body needed)
        await handleResponse(response);
    }

    // --- DATA MANAGEMENT (RECORDS) ---
    async getRecords(tableName: string, filters?: AdvancedFilter, sort?: SortConfig, page: number = 1, limit: number = 20): Promise<{ records: RecordRow[], total: number }> {
        console.log(`Fetching records for ${tableName}`);
        
        // Construct query parameters
        const queryParams = new URLSearchParams({ 
            page: String(page), 
            limit: String(limit) 
        });

        if (filters) {
            // Backend expects filters and sort to be JSON strings
            queryParams.append('filters', JSON.stringify(filters));
        }
        if (sort) {
            queryParams.append('sort', JSON.stringify(sort));
        }
        
        const response = await fetch(`${API_BASE_URL}/tables/${tableName}/records?${queryParams.toString()}`, { 
            headers: this.getHeaders(false)
        });

        // Response structure: { records: RecordRow[], total: number }
        return handleResponse(response) as Promise<{ records: RecordRow[], total: number }>;
    }

    async createRecord(tableName: string, data: Omit<RecordRow, 'id'>): Promise<RecordRow> {
        // NOTE: created_by and modified_by are now handled fully by the backend using req.user.id
        const recordData = data; 

        console.log(`Creating record in ${tableName}`, recordData);
        
        const response = await fetch(`${API_BASE_URL}/tables/${tableName}/records`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(recordData),
        });

        // Response structure: { id, created_at, modified_at, created_by, modified_by, ...other fields }
        return handleResponse(response) as Promise<RecordRow>;
    }
    
    async updateRecord(tableName: string, recordId: number | string, data: RecordRow): Promise<RecordRow> {
        // NOTE: modified_by is handled fully by the backend using req.user.id
        
        console.log(`Updating record ${recordId} in ${tableName}`, data);
        
        const response = await fetch(`${API_BASE_URL}/tables/${tableName}/records/${recordId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            // Send the full record data, including the ID
            body: JSON.stringify(data), 
        });

        // Response structure: { id, modified_at, modified_by, ...other fields }
        return handleResponse(response) as Promise<RecordRow>;
    }

    async deleteRecord(tableName: string, recordId: number | string): Promise<void> {
        console.log(`Deleting record ${recordId} in ${tableName}`);
        
        const response = await fetch(`${API_BASE_URL}/tables/${tableName}/records/${recordId}`, {
            method: 'DELETE',
            headers: this.getHeaders(false),
        });

        // Expected Status 204 No Content
        await handleResponse(response);
    }
}

export const apiService = new ApiService();