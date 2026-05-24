import fs from 'fs'
import path from 'path'
import { Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'
import crypto from 'crypto'
const { Pool } = pg

// Tenta carregar do .env se não estiver no process.env
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), '.env')
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const match = envContent.match(/DATABASE_URL=(.*)/)
    if (match && match[1]) {
      process.env.DATABASE_URL = match[1].trim()
    }
  } catch (e) {
    console.error('Falha ao ler .env manualmente', e)
  }
}

let connectionString = process.env.DATABASE_URL;

console.log('--- DATABASE_URL no db.ts ---', connectionString)

// Types matching the orders table schema
export interface OrdersTable {
  id: string
  order_number: string
  color: string
  wheel_type: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_cpf: string
  payment_method: string
  total_price: string | number
  status: string
  created_at?: Date | string
  updated_at?: Date | string
  optionals?: string[]
}

export interface Database {
  orders: OrdersTable
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1')
        ? false 
        : { rejectUnauthorized: false },
    }),
  }),
})

export type TestOrderInput = Omit<OrdersTable, 'id' | 'created_at' | 'updated_at'>

/**
 * Inserts a new order into the database for testing purposes.
 * It automatically generates a UUID for the id.
 */
export async function insertTestOrder(orderData: TestOrderInput) {
  const newOrder = await db
    .insertInto('orders')
    .values({
      id: crypto.randomUUID(),
      ...orderData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return newOrder
}

/**
 * Exclui um pedido do banco de dados pelo seu número.
 */
export async function deleteOrderByNumber(orderNumber: string) {
  await db
    .deleteFrom('orders')
    .where('order_number', '=', orderNumber)
    .execute()
}

