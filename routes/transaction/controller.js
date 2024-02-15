const { Op } = require('sequelize')
const response = require('../../helpers/response')
const { Transaction, Customer, DetailEvent, Event, User, sequelize } = require('../../models')
const path = require('path')
const fs = require('fs')
const sendEmail = require('../../helpers/sendEmail')
const formatNumber = require('../../helpers/formatNumber')

module.exports = {
  createTransaction: async (req, res) => {
    try {
      const payload = req.body

      const existingTransaction = await Transaction.findOne({ where: { id_detail_event: payload.id_detail_event } })

      const existingCustomer = await Customer.findOne({ where: { email: payload.email } })

      if (existingTransaction) {
        if (existingCustomer) {
          return response(res, 400, false, 'Anda Sudah Melakukan Transaksi Pada Event ini')
        } else {
          const result = await Customer.create({
            email: payload.email,
            name: payload.name,
            gender: payload.gender,
            no_whatsapp: payload.no_whatsapp
          })
          const finalResult = await Transaction.create({ id_detail_event: payload.id_detail_event, quantity: payload.quantity, id_customer: result.dataValues.id, status: 'PENDING' })
          if (result && finalResult) {
            sendEmail(payload.email, 'Tinggal selangkah lagi', 'Menunggu Pembayaran', {
              name: payload.name,
              quantity: payload.quantity,
              type_ticket: payload.type_ticket,
              price: formatNumber(payload.price * payload.quantity),
              total: formatNumber((payload.price * payload.quantity) + 3000),
              url: `https://quarter.syntechsia.com/payment/${finalResult.dataValues.id}`
            })
            return response(res, 200, true, 'Transaksi berhasil')
          } else {
            return response(res, 400, false, 'Transaksi gagal')
          }
        }
      } else {
        const result = await Customer.create({
          email: payload.email,
          name: payload.name,
          gender: payload.gender,
          no_whatsapp: payload.no_whatsapp
        })
        const finalResult = await Transaction.create({ id_detail_event: payload.id_detail_event, quantity: payload.quantity, id_customer: result.dataValues.id, status: 'PENDING' })
        if (result && finalResult) {
          sendEmail(payload.email, 'Tinggal selangkah lagi', 'Menunggu Pembayaran', {
            name: payload.name,
            quantity: payload.quantity,
            type_ticket: payload.type_ticket,
            price: formatNumber(payload.price * payload.quantity),
            total: formatNumber((payload.price * payload.quantity) + 3000),
            url: `https://quarter.syntechsia.com/payment/${finalResult.dataValues.id}`
          })
          return response(res, 200, true, 'Transaksi berhasil')
        } else {
          return response(res, 400, false, 'Transaksi gagal')
        }
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  updateTransaction: async (req, res) => {
    try {
      const payload = req.body
      const { id } = req.params

      const isExists = await Transaction.findOne({ where: { id } })

      if (isExists) {
        if (req.file) {
          const tmpPathPhoto = req.file.path
          const originalExtPhoto = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]
          const photo = req.file.filename + '.' + originalExtPhoto
          const targetPathPhoto = path.resolve(path.resolve(__dirname, '../../'), `public/images/transaction/${photo}`)

          const srcPhoto = fs.createReadStream(tmpPathPhoto)
          const destPhoto = fs.createWriteStream(targetPathPhoto)

          srcPhoto.pipe(destPhoto)
          srcPhoto.on('end', async () => {
            const currentImage = path.resolve(path.resolve(__dirname, '../../'), `public/images/transaction/${isExists.image}`)
            if (fs.existsSync(currentImage)) {
              fs.unlinkSync(currentImage)
            }
            const result = await Transaction.update({ ...payload, upload_proof_transaction: photo }, { where: { id } })
            if (payload.status === 'WAITING') {
              sendEmail('quarter758@gmail.com', 'Ada Transaksi Masuk', {
                name: payload.name,
                type_ticket: payload.type_ticket,
                title: payload.title
              })
            }
            if (result) {
              return response(res, 200, true, 'Transaksi berhasil diupdate')
            } else {
              return response(res, 400, false, 'Transaksi gagal diupdate')
            }
          })
        } else {
          function makeid (length) {
            let result = ''
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            const charactersLength = characters.length
            let counter = 0
            while (counter < length) {
              result += characters.charAt(Math.floor(Math.random() * charactersLength))
              counter += 1
            }
            return result
          }
          let payloadFinish = { ...payload }
          if (payload.status === 'SUCCESS') {
            const code = makeid(6)
            sendEmail(payload.email, 'Pembayaran diterima', 'Pembayaran diterima', {
              name_event: payload.name_event,
              code
            })
            payloadFinish = { ...payloadFinish, code }
          }
          const result = await Transaction.update(payloadFinish, { where: { id } })
          if (result) {
            return response(res, 200, true, 'Transaksi Berhasil diupdate')
          } else {
            return response(res, 400, false, 'Transaksi gagal diupdate')
          }
        }
      } else {
        return response(res, 400, false, 'Transaksi tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  getListTransaction: async (req, res) => {
    try {
      const { page, limit = 10, search = '', status = '', all = false } = req.query

      const offset = (Number(page) > 1) ? (Number(page) * limit) - limit : 0

      if (all) {
        const result = await Transaction.findAll()

        return response(res, 200, true, 'List Transaksi', result)
      } else {
        const result = await Transaction.findAndCountAll({
          include: [
            {
              model: Customer,
              where: {
                name: {
                  [Op.iLike]: `%${search}%`
                }
              }
            },
            {
              model: DetailEvent,
              include: [
                {
                  model: Event
                }
              ]
            },
            {
              model: User
            }
          ],
          where: {
            status: {
              [Op.iLike]: `%${status}%`
            }
          },
          order: [['id', 'DESC']],
          limit: Number(limit),
          offset: Number(offset)
        })

        const finalResult = {
          count: result.count,
          pageCount: Math.ceil(result.count / Number(limit)) || 0,
          data: result.rows
        }

        return response(res, 200, true, 'List Transaksi', finalResult)
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  getDetailTransaction: async (req, res) => {
    try {
      const { id } = req.params

      const existingNews = await Transaction.findOne({ where: { id } })

      if (existingNews) {
        return response(res, 200, true, 'Detial Transaksi', existingNews)
      } else {
        return response(res, 404, false, 'Transaksi tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  getDetailPaymentTransaction: async (req, res) => {
    try {
      const { id } = req.params

      const [[existing]] = await sequelize.query(`select
          t.id,
          t.id_customer,
          c.email,
          c."name",
          c.gender,
          c.no_whatsapp,
          t.quantity * e.price as total,
          e.type_ticket,
          e2.title,
          t.quantity
      from
          "Transactions" t
      left join
          "DetailEvents" e
      on
          e.id = t.id_detail_event
      left join
          "Events" e2
      on
          e2.id = e.id_event
      left join
          "Customers" c 
      on c.id = t.id_customer
      where
          t.id = ${id};`)

      if (existing) {
        return response(res, 200, true, 'Detial Payment', existing)
      } else {
        return response(res, 404, false, 'Payment tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  deleteTransaction: async (req, res) => {
    try {
      const { id } = req.params

      const existingTransaction = await Transaction.findOne({ where: { id } })

      if (existingTransaction) {
        await Transaction.destroy({ where: { id } })

        return response(res, 200, true, 'Transaksi berhasil dihapus')
      } else {
        return response(res, 404, false, 'Transaksi tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  getDashboardTransaction: async (req, res) => {
    try {
      const [status] = await sequelize.query(`select
          t.status,
          count(t.*)
      from
          "Transactions" t
      group by t.status;`)

      return response(res, 200, true, 'Dashboard', status)
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  }
}
