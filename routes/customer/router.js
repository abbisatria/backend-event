const express = require('express')
const { authCheck } = require('../../helpers/auth')
const { getListCustomer, createCustomer, updateCustomer, deleteCustomer, getDetailCustomer } = require('./controller')
const route = express.Router()

route.get('', getListCustomer)
route.get('/:id', authCheck, getDetailCustomer)
route.post('', createCustomer)
route.put('/:id', authCheck, updateCustomer)
route.delete('/:id', authCheck, deleteCustomer)

module.exports = route
