const express = require('express')
const { authCheck } = require('../../helpers/auth')
const { getListEvent, createEvent, updateEvent, deleteEvent, getDetailEvent, getDetailActiveEvent } = require('./controller')
const route = express.Router()
const multer = require('multer')
const os = require('os')

route.get('', getListEvent)
route.get('/:id', getDetailEvent)
route.get('/active/:id', getDetailActiveEvent)
route.post('', multer({ dest: os.tmpdir() }).single('image'), createEvent)
route.put('/:id', multer({ dest: os.tmpdir() }).single('image'), authCheck, updateEvent)
route.delete('/:id', authCheck, deleteEvent)

module.exports = route
