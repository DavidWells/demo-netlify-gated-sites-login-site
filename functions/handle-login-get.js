import jwt from 'jsonwebtoken'
import cookie from 'cookie'

exports.handler = (event, context, callback) => {
  const body = event.body ? JSON.parse(event.body) : {}
  const { identity, user } = context.clientContext;
  const params = event.queryStringParameters

  let decodedToken
  try {
    decodedToken = jwt.decode(params.token, { complete: true })
    console.log('decodedToken', decodedToken)
  } catch (e) {
    console.log(e)
  }

  // Make new token
  var newToken = jwt.sign({
    sub: decodedToken.payload.sub,
    exp: decodedToken.payload.exp,
    email: decodedToken.payload.email,
    "app_metadata": {
      ...decodedToken.payload.app_metadata,
      "authorization": {
        "roles": ["admin", "editor"]
      }
    },
    user_metadata: decodedToken.payload.user_metadata
  }, 'secret');

  // Do redirect
  return callback(null, {
    statusCode: 302,
    headers: {
      Location: `${params.url}.netlify/functions/set-cookie?token=${newToken}&url=${params.url}`,
      'Cache-Control': 'no-cache'
    }
  })
}
