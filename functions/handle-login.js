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
  const claims = context.clientContext && context.clientContext.user;
  if (!claims) {
    return callback(null, {
      statusCode: 401,
      body: "You must be signed in to call this function"
    });
  }
  let decoded
  // try {
  //   decoded = jwt.verify(identity.token, 'secret')
  //   console.log('decoded', decoded) // bar
  // } catch (e) {
  //   console.log(e)
  // }


  // const claims = context.clientContext && context.clientContext.user;
  // if (!claims) {
  //   return callback(null, {
  //     statusCode: 401,
  //     body: "You must be signed in to call this function"
  //   });
  // }
  // 1. Read JWT

  // 2. Validate User

  // 3. If valid, send back to redirect URL with cookie set

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
    	event: event,
      context: context,
      decoded: decoded
    })
  })
}
