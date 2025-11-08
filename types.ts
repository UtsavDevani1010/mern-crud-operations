
export interface Credentials {
    username: string;
    password?: string;
}

export interface User {
    id: number;
    username: string;
    role: 'Admin' | 'User';
    token: string; // A JWT or session token from the API
}

export type ColumnDataType = 'INT' | 'VARCHAR' | 'TEXT' | 'DATE' | 'TIMESTAMP' | 'BOOLEAN' | 'FLOAT' | 'DECIMAL';

export interface Column {
    name: string;
    type: ColumnDataType;
    isPrimaryKey?: boolean;
    isAutoIncrement?: boolean;
    defaultValue?: string | null;
    isNullable?: boolean;
}

export interface Table {
    name: string;
    columns: Column[];
}

export type RecordRow = Record<string, any>;

export type TextFilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith';
export type NumberFilterOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte';
export type DateFilterOperator = 'on' | 'before' | 'after' | 'between';

export type FilterOperator = TextFilterOperator | NumberFilterOperator | DateFilterOperator;

export interface Filter {
    id: string;
    column: string;
    operator: FilterOperator;
    value: any;
}

export type FilterGroupLogic = 'AND' | 'OR';

export interface FilterGroup {
    id: string;
    logic: FilterGroupLogic;
    filters: Filter[];
}

export interface AdvancedFilter {
    logic: FilterGroupLogic;
    groups: FilterGroup[];
}

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}
