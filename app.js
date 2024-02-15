const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

const userRouter = require('./routes/user/router')
const customerRouter = require('./routes/customer/router')
const eventRouter = require('./routes/event/router')
const transactionRouter = require('./routes/transaction/router')

const app = express()
app.use(cors())

const URL = '/api/v1'

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(`${URL}/user`, userRouter)
app.use(`${URL}/customer`, customerRouter)
app.use(`${URL}/event`, eventRouter)
app.use(`${URL}/transaction`, transactionRouter)

app.use('/', (req, res) => {
  return res.status(200).json({
    status: 200,
    message: 'Server Is Running Well'
  })
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
