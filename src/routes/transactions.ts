import crypto from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

/* type MyRequest = FastifyRequest<{
  Body: {
    id?: string | null
    title: string
    amount: number
    type: string
  }
}> */

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select()
    return { transactions }
  })

  app.get('/:id', async (request) => {
    const getTransactionParamSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamSchema.parse(request.params)

    const transaction = await knex('transactions').where('id', id).first()

    return { transaction }
  })

  // app.post('/', async (request: MyRequest, reply: FastifyReply) => {
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    // const { title, amount, type } = request.body

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return reply.status(201).send({
      ok: true,
      msg: 'Transaction successfully created!',
    })
  })
}
