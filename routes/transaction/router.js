const express = require('express')
const { authCheck } = require('../../helpers/auth')
const { getListTransaction, createTransaction, updateTransaction, deleteTransaction, getDetailTransaction, getDetailPaymentTransaction, getDashboardTransaction } = require('./controller')
const route = express.Router()
const multer = require('multer')
const os = require('os')

route.get('', getListTransaction)
route.get('/dashboard', getDashboardTransaction)
route.get('/:id', authCheck, getDetailTransaction)
route.get('/payment/:id', getDetailPaymentTransaction)
route.post('', createTransaction)
route.put('/:id', multer({ dest: os.tmpdir() }).single('image'), updateTransaction)
route.delete('/:id', authCheck, deleteTransaction)

module.exports = route
