const { Op } = require('sequelize')
const response = require('../../helpers/response')
const { Customer, Transaction } = require('../../models')

module.exports = {
  createCustomer: async (req, res) => {
    try {
      const payload = req.body

      const result = await Customer.create({ ...payload })
      if (result) {
        const existingTransaction = await Event.findOne({ where: { title: payload.id_event } })

        if (!existingTransaction) {
          const finalResult = await Transaction.create({ ...payload, id_user: result?.dataValues?.id, status: 'PENDING' })
          if (finalResult) {
            return response(res, 200, true, 'Transaksi berhasil')
          } else {
            return response(res, 400, false, 'Transaksi gagal')
          }
        } else {
          return response(res, 400, false, 'Anda Sudah Melakukan Transaksi Pada Event ini')
        }
      } else {
        return response(res, 400, false, 'Customer gagal')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  updateCustomer: async (req, res) => {
    try {
      const payload = req.body
      const { id } = req.params

      const isExists = await Customer.findOne({ where: { id } })

      if (isExists) {
        const result = await Customer.update(payload, { where: { id } })
        if (result) {
          return response(res, 200, true, 'Customer Berhasil diupdate')
        } else {
          return response(res, 400, false, 'Customer gagal diupdate')
        }
      } else {
        return response(res, 400, false, 'Customer tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  getListCustomer: async (req, res) => {
    try {
      const { page, limit = 10, search = '', all = false } = req.query

      const offset = (Number(page) > 1) ? (Number(page) * limit) - limit : 0

      if (all) {
        const result = await Customer.findAll()

        return response(res, 200, true, 'List Customer', result)
      } else {
        const result = await Customer.findAndCountAll({
          where: {
            name: {
              [Op.iLike]: `%${search}%`
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

        return response(res, 200, true, 'List Customer', finalResult)
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  getDetailCustomer: async (req, res) => {
    try {
      const { id } = req.params

      const existingNews = await Customer.findOne({ where: { id } })

      if (existingNews) {
        return response(res, 200, true, 'Detial Customer', existingNews)
      } else {
        return response(res, 404, false, 'Customer tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  deleteCustomer: async (req, res) => {
    try {
      const { id } = req.params

      const existingCustomer = await Customer.findOne({ where: { id } })

      if (existingCustomer) {
        await Customer.destroy({ where: { id } })

        return response(res, 200, true, 'Customer berhasil dihapus')
      } else {
        return response(res, 404, false, 'Customer tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  }
}
