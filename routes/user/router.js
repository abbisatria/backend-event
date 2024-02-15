const express = require('express')
const { authCheck } = require('../../helpers/auth')
const { getListUser, createUser, updateUser, deleteUser, login, getDetailUser } = require('./controller')
const route = express.Router()

route.get('', authCheck, getListUser)
route.get('/:id', authCheck, getDetailUser)
route.post('', createUser)
route.post('/login', login)
route.put('/:id', authCheck, updateUser)
route.delete('/:id', authCheck, deleteUser)

module.exports = route
