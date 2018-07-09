const jwt = require('jsonwebtoken')
const secret = 'secret'
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzEwOTAzNjIsInN1YiI6ImZiYWQzNjMyLWY3MGEtNDFiYi04OWVjLTM2Y2NjZGZmMTk2MyIsImVtYWlsIjoiZGF2aWRncmVnb3J5d2VsbHNAZ21haWwuY29tIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwifSwidXNlcl9tZXRhZGF0YSI6eyJmdWxsX25hbWUiOiJEYXZpZCJ9fQ.Hq95G9nbCaTxUfbWZfR0lXkC6vRsu-9lnRkX0bHX3M8'

  // invalid token - synchronous
  try {
    var valid = jwt.verify(token, secret);
    console.log('valid', valid)
  } catch(err) {
    console.log('verify error', err)
    console.log(err.name)
    console.log(err.message)
    /*
      err = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
        expiredAt: 1408621000
      }
    */
  }
