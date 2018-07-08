import jwt from 'jsonwebtoken'


// Set cookie

/*
https://github.com/netlify/verify-okta/blob/master/main.go#L136
http.Cookie{
		Name:     "nf_jwt",
		Value:    ss,
		Path:     "/",
		Expires:  time.Now().Add(expiration),
		Secure:   true,
		HttpOnly: true,
	}
*/

exports.handler = (event, context, callback) => {
  console.log('context', context)
  console.log('event.headers', event.headers)

  if (!event.headers.authorization) {
    console.log('event.headers.authorization missing')
    return callback(null, {
      statusCode: 401,
      body: "You must be signed in to call this function"
    })
  }
  const authToken = event.headers.authorization.substring(7)

  const claims = context.clientContext && context.clientContext.user;
  console.log('claims', claims)
  if (!claims) {
    return callback(null, {
      statusCode: 401,
      body: "You must be signed in to call this function"
    });
  }

  let decodedToken
  try {
    decodedToken = jwt.decode(authToken, { complete: true })
    console.log('decodedToken', decodedToken) // bar
  } catch (e) {
    console.log(e)
  }

  // invalid token - synchronous
  try {
    var valid = jwt.verify(authToken, 'secret');
    console.log('valid')
  } catch(err) {
    console.log('verify error', err)
    /*
      err = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
        expiredAt: 1408621000
      }
    */
  }

  // 1. Read JWT

  // 2. Validate User

  // 3. If valid, send back to redirect URL with cookie set

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
    	event: event,
      context: context,
      decoded: decodedToken
    })
  })
}
