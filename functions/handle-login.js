import jwt from 'jsonwebtoken'
import cookie from 'cookie'

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
    "app_metadata": {
      "authorization": {
        "roles": ["admin", "editor"]
      }
    }
  }, 'secret');

  console.log('newToken', newToken)
  /*
  {
    "app_metadata": {
      "authorization": {
        "roles": ["admin", "editor"]
      }
    }
  }*/

  const response = {
    statusCode: 301,
    headers: {
      Location: `${params.url}.netlify/functions/auth-two?token=${newToken}`,
      // Set no cache
      'Cache-Control': 'no-cache'
    }
  }
  console.log('do redirect', response)
  return callback(null, response)

  if (!event.headers.authorization) {
    console.log('event.headers.authorization missing')
    return callback(null, {
      statusCode: 401,
      body: JSON.stringify({
      	message: 'missing event.headers.authorization. You must be signed in to call this function',
      })
    })
  }

  const authToken = event.headers.authorization.substring(7)

  if (!user) {
    return callback(null, {
      statusCode: 401,
      body: JSON.stringify({
      	message: 'You must be signed in to call this function',
      })
    });
  }



  // invalid token - synchronous
  try {
    var valid = jwt.verify(authToken, 'secret');
    console.log('valid')
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


  // if (user) {
  //
  //   const myCookie = cookie.serialize('nf_jwt', authToken, {
  //     secure: true,
  //     httpOnly: true,
  //     path: "/",
  //     maxAge: 60 * 60 * 24 * 7
  //     //expires: expiresValue
  //   })
  //
  //   // var cookieString = "myCookie="+cookieVal+"; domain=my.domain; expires="+date.toGMTString()+";";
  //   const cookieResponse = {
  //     "statusCode": 302,
  //     "Location" : body.url,
  //     "headers": {
  //       "Set-Cookie": myCookie
  //     },
  //     "body": "..."
  //   }
  //   console.log('cookieResponse', cookieResponse)
  //
  //   return callback(null, cookieResponse);
  // }
  // 1. Read JWT

  // 2. Validate User

  // 3. If valid, send back to redirect URL with cookie set

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
    	event: event,
      context: context,
      decodedToken: decodedToken
    })
  })
}
