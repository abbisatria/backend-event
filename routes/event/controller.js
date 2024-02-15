const { Op } = require('sequelize')
const response = require('../../helpers/response')
const { Event, DetailEvent, sequelize } = require('../../models')
const path = require('path')
const fs = require('fs')
const moment = require('moment')

module.exports = {
  createEvent: async (req, res) => {
    try {
      const payload = req.body

      const existingEvent = await Event.findOne({ where: { title: payload.title } })

      if (!existingEvent) {
        if (req.file) {
          const tmpPathPhoto = req.file.path
          const originalExtPhoto = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]
          const photo = req.file.filename + '.' + originalExtPhoto
          const targetPathPhoto = path.resolve(path.resolve(__dirname, '../../'), `public/images/photo/${photo}`)

          const srcPhoto = fs.createReadStream(tmpPathPhoto)
          const destPhoto = fs.createWriteStream(targetPathPhoto)

          srcPhoto.pipe(destPhoto)
          srcPhoto.on('end', async () => {
            const result = await Event.create({
              title: payload.title,
              image: photo
            })
            if (result) {
              const typeTicket = JSON.parse(payload.events).map(val => {
                return {
                  ...val,
                  id_event: result.dataValues.id
                }
              })
              const finalResult = await DetailEvent.bulkCreate(typeTicket)
              if (finalResult) {
                return response(res, 200, true, 'Perolehan Suara berhasil diupload')
              } else {
                return response(res, 400, false, 'Perolehan Suara gagal diupload')
              }
            } else {
              return response(res, 400, false, 'Event gagal dibuat')
            }
          })
        } else {
          return response(res, 400, false, 'Anda wajib mengupload photo event')
        }
      } else {
        return response(res, 400, false, 'Event tersebut sudah terdaftar')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  updateEvent: async (req, res) => {
    try {
      const payload = req.body
      const { id } = req.params

      const existingEvent = await Event.findOne({ where: { id } })

      if (existingEvent) {
        if (req.file) {
          const tmpPathPhoto = req.file.path
          const originalExtPhoto = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]
          const photo = req.file.filename + '.' + originalExtPhoto
          const targetPathPhoto = path.resolve(path.resolve(__dirname, '../../'), `public/images/photo/${photo}`)

          const srcPhoto = fs.createReadStream(tmpPathPhoto)
          const destPhoto = fs.createWriteStream(targetPathPhoto)

          srcPhoto.pipe(destPhoto)
          srcPhoto.on('end', async () => {
            const currentImage = path.resolve(path.resolve(__dirname, '../../'), `public/images/photo/${existingEvent.image}`)
            if (fs.existsSync(currentImage)) {
              fs.unlinkSync(currentImage)
            }
            const result = await Event.update({ title: payload.title, image: photo }, { where: { id: Number(id) } })
            await JSON.parse(payload.events).forEach(async (val) => {
              await DetailEvent.update({ ...val, id_event: Number(id) }, { where: { id: val.id } })
            })
            if (result) {
              return response(res, 200, true, 'Event berhasil diupdate')
            } else {
              return response(res, 400, false, 'Event gagal diupdate')
            }
          })
        } else {
          const result = await Event.update({
            title: payload.title
          }, { where: { id: Number(id) } })
          await JSON.parse(payload.events).forEach(async (val) => {
            await DetailEvent.update({ ...val, id_event: Number(id) }, { where: { id: val.id } })
          })
          if (result) {
            return response(res, 200, true, 'Event berhasil diupdate')
          } else {
            return response(res, 400, false, 'Event gagal diupdate')
          }
        }
      } else {
        return response(res, 404, false, 'Event tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  getListEvent: async (req, res) => {
    try {
      const { page, limit = 10, search = '', all = false } = req.query

      const offset = (Number(page) > 1) ? (Number(page) * limit) - limit : 0

      if (all) {
        const [result] = await sequelize.query(`select
            e.id,
            e.title,
            e.image,
            de.*
        from
            "DetailEvents" de
        left join
            "Events" e
        on
            e.id = de.id_event;`)

        return response(res, 200, true, 'List Event', result)
      } else {
        const result = await Event.findAndCountAll({
          where: {
            title: {
              [Op.iLike]: `%${search}%`
            }
          },
          include: [
            {
              model: DetailEvent
            }
          ],
          order: [['id', 'DESC']],
          limit: Number(limit),
          offset: Number(offset)
        })

        const finalResult = {
          count: result.count,
          pageCount: Math.ceil(result.count / Number(limit)) || 0,
          data: result.rows
        }

        return response(res, 200, true, 'List Event', finalResult)
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  getDetailEvent: async (req, res) => {
    try {
      const { id } = req.params

      const existingNews = await Event.findOne({
        where: { id },
        include: [
          {
            model: DetailEvent
          }
        ]
      })

      if (existingNews) {
        let result = existingNews?.dataValues

        result = {
          ...result,
          DetailEvents: result.DetailEvents.map(val => {
            return {
              ...val.dataValues,
              start_date: moment(val.start_date).format('YYYY-MM-DD'),
              end_date: moment(val.end_date).format('YYYY-MM-DD')
            }
          })
        }
        return response(res, 200, true, 'Detail Event', result)
      } else {
        return response(res, 404, false, 'Event tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  getDetailActiveEvent: async (req, res) => {
    try {
      const { id } = req.params

      const [[existing]] = await sequelize.query(`select
          e.id,
          e.title,
          e.image,
          de.*
      from
          "DetailEvents" de
      left join
          "Events" e
      on
          e.id = de.id_event
      where
          de.id = ${id};`)

      if (existing) {
        return response(res, 200, true, 'Detail Event', existing)
      } else {
        return response(res, 404, false, 'Event tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  },
  deleteEvent: async (req, res) => {
    try {
      const { id } = req.params

      const existingEvent = await Event.findOne({ where: { id } })

      if (existingEvent) {
        await Event.destroy({ where: { id } })
        const currentNews = path.resolve(path.resolve(__dirname, '../../'), `public/images/photo/${existingEvent.image}`)
        if (fs.existsSync(currentNews)) {
          fs.unlinkSync(currentNews)
        }

        return response(res, 200, true, 'Event berhasil dihapus')
      } else {
        return response(res, 404, false, 'Event tidak ditemukan')
      }
    } catch (err) {
      return response(res, 400, false, `${err.message || 'Bad Request'}`)
    }
  }
}
