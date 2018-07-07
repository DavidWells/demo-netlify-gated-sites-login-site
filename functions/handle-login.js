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

  // 1. Read JWT

  // 2. Validate User

  // 3. If valid, send back to redirect URL with cookie set

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
    	event: event,
      context: context
    })
  })
}
