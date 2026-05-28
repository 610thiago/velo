import { db, OrdersTable } from '../db';

import { OrderDetails } from '../actions/orderLookupActions';

import crypto from 'crypto';

/** Remove formatting and lower case a string */
export function normalizeValue(value: string): string {
  if (!value) return '';
  return value
    .normalize('NFD') // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\s+/g, '') // remove espaços
    .toLowerCase(); // lowercase
}

/** Insert an order record for test purposes */
export async function insertOrder(order: OrderDetails): Promise<void> {
  const data: Omit<OrdersTable, 'created_at' | 'updated_at'> = {
    id: crypto.randomUUID(),
    order_number: order.number,
    color: order.color.toLowerCase().replace(' ', '-'),
    wheel_type: order.wheels.replace(/ ?[Ww]heels/, '').trim().toLowerCase(),
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: (order.customer as any).phone ?? '',
    customer_cpf: (order.customer as any).document ?? '',
    payment_method: normalizeValue(order.payment),
    total_price: (order as any).total_price ?? '0',
    status: order.status,
    optionals: [],
  };
  await db
    .insertInto('orders')
    .values({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .execute();
}

/** Delete an order by its numeric code */
export async function deleteOrderByNumber(orderNumber: string): Promise<void> {
  await db.deleteFrom('orders').where('order_number', '=', orderNumber).execute();
}

/** Delete an order by the customer's e‑mail */
export async function deleteOrderByEmail(email: string): Promise<void> {
  await db.deleteFrom('orders').where('customer_email', '=', email).execute();
}


