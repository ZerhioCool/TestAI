import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Usamos driver de postgres.js. En un entorno serverless (Next.js route handlers)
// es buena idea mantener la conexión optimizada.
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
