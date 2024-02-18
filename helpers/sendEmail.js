const mailer = require('nodemailer')
const fs = require('fs')
const mustache = require('mustache')
const path = require('path')

module.exports = async (email, subject, message, data) => {
  const template = fs.readFileSync(path.resolve(__dirname, './template.html'), 'utf-8')
  const templateSuccess = fs.readFileSync(path.resolve(__dirname, './templateSuccess.html'), 'utf-8')
  const templateAdmin = fs.readFileSync(path.resolve(__dirname, './templateAdmin.html'), 'utf-8')

  const transporter = mailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: 'quartereventkrw6@gmail.com',
      pass: 'eenfmghorlrdfgro'
    }
  })

  const results = {
    subject,
    message,
    data
  }

  const mailOptions = {
    from: 'abbisatria30@gmail.com',
    to: email,
    subject,
    html: subject === 'Pembayaran diterima' ? mustache.render(templateSuccess, { ...results }) : subject === 'Ada Transaksi Masuk' ? mustache.render(templateAdmin, { ...results }) : mustache.render(template, { ...results })
  }

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) throw err
    console.log('Email sent: ' + info.response)
  })
}
