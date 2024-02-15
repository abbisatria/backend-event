const response = require('../../helpers/response')
const { User } = require('../../models')
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
  createUser: async (req, res) => {
    try {
      const payload = req.body

      const existingUser = await User.findOne({ where: { username: payload.username } })

      if (!existingUser) {
        const salt = await bcrypt.genSalt()
        const encryptedPassword = payload.password ? await bcrypt.hash(payload.password, salt) : ''
        const result = await User.create({ ...payload, password: encryptedPassword })
        if (result) {
          return response(res, 200, true, 'User berhasil ditambahkan')
        } else {
          return response(res, 400, false, 'User gagal ditambahkan')
        }
      } else {
        return response(res, 400, false, 'User sudah terdaftar')
      }
    } catch (err) {
      console.log('err', err)
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  updateUser: async (req, res) => {
    try {
      let payload = req.body
      const { id } = req.params

      const isExists = await User.findOne({ where: { id } })

      if (isExists) {
        if (payload.password) {
          const salt = await bcrypt.genSalt()
          const encryptedPassword = await bcrypt.hash(payload.password, salt)
          payload = { ...payload, password: encryptedPassword }
        }
        const result = await User.update(payload, { where: { id } })
        if (result) {
          return response(res, 200, true, 'User Berhasil diupdate')
        } else {
          return response(res, 400, false, 'User gagal diupdate')
        }
      } else {
        return response(res, 400, false, 'User tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  getListUser: async (req, res) => {
    try {
      const { page, limit = 10, search = '', all = false } = req.query

      const offset = (Number(page) > 1) ? (Number(page) * limit) - limit : 0

      if (all) {
        const result = await User.findAll()

        return response(res, 200, true, 'List User', result)
      } else {
        const result = await User.findAndCountAll({
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

        return response(res, 200, true, 'List User', finalResult)
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  getDetailUser: async (req, res) => {
    try {
      const { id } = req.params

      const existingNews = await User.findOne({ where: { id } })

      if (existingNews) {
        return response(res, 200, true, 'Detial User', existingNews)
      } else {
        return response(res, 404, false, 'User tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params

      const existingUser = await User.findOne({ where: { id } })

      if (existingUser) {
        await User.destroy({ where: { id } })

        return response(res, 200, true, 'User berhasil dihapus')
      } else {
        return response(res, 404, false, 'User tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  login: async (req, res) => {
    try {
      const { username, password } = req.body

      const existingUser = await User.findOne({ where: { username } })

      if (existingUser) {
        const compare = bcrypt.compareSync(password, existingUser.password)
        const token = jwt.sign(existingUser.dataValues, 'Ev3nt889912')
        if (compare) {
          return response(res, 200, true, 'Login berhasil', { token })
        } else {
          return response(res, 401, false, 'Password yang anda masukan salah')
        }
      } else {
        return response(res, 400, true, 'Username tidak terdaftar')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  }
}
