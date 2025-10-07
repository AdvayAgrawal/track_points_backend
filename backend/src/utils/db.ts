import { ResultSetHeader } from "mysql2";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});


export async function SelectQuery<T>(query: string, params?: any[]): Promise<T[]> {
    const [results] = await pool.execute(query, params);
    return results as T[];
}

export async function ModifyQuery(query: string, params?: any[]): Promise<ResultSetHeader> {
    const [results] = await pool.execute(query, params);
    return results as ResultSetHeader;
}

