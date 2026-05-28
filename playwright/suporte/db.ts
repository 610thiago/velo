import fs from 'fs'
import path from 'path'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg';
import crypto from 'crypto'


import { fileURLToPath } from 'url'

// Tenta carregar do .env se não estiver no process.env
if (!process.env.DATABASE_URL) {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const envPath = path.resolve(__dirname, '../../.env')
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const match = envContent.match(/DATABASE_URL=(.*)/)
    if (match && match[1]) {
      process.env.DATABASE_URL = match[1].trim()
    }
  } catch (e) {
    console.error('Falha ao ler .env manualmente', e)
  }
}



// console.log removido por questões de segurança

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

const colorSlugMap: Record<string, string> = {
  'Lunar White': 'lunar-white',
  'Midnight Black': 'midnight-black',
  'Racing Red': 'racing-red',
}

const wheelTypeMap: Record<string, string> = {
  'Sport Wheels': 'sport',
  'Aero Wheels': 'aero',
}

/**
 * Inserts an order from a fixture object directly, mapping display values to DB format.
 */
export async function insertOrder(order: {
  number: string
  status: string
  color: string
  wheels: string
  customer: { name: string; email: string }
  payment: string
  customer_phone: string
  customer_cpf: string
  total_price: string
  optionals: string[]
}) {
  return insertTestOrder({
    order_number: order.number,
    color: colorSlugMap[order.color] ?? order.color,
    wheel_type: wheelTypeMap[order.wheels] ?? order.wheels,
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer_phone,
    customer_cpf: order.customer_cpf,
    payment_method: order.payment,
    total_price: order.total_price,
    status: order.status,
    optionals: order.optionals,
  })
}
