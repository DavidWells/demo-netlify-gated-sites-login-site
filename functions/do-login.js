import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import parseURL from 'url-parse'

exports.handler = (event, context, callback) => {
  const siteUrl = process.env.URL
  const params = event.queryStringParameters
  const urlData = parseURL(params.url)
  const redirectBaseUrl = urlData.origin
  const redirectUrl = urlData.href

  const headers = event.headers
  let decodedToken
  if (headers.cookie) {
    const cookies = cookie.parse(headers.cookie)
    console.log('cookies', cookies)
    if (!cookies.nf_jwt) {
      // Do redirect back to login
      return callback(null, {
        statusCode: 302,
        headers: {
          Location: `${siteUrl}`,
          'Cache-Control': 'no-cache'
        }
      })
    }

    try {
      decodedToken = jwt.decode(cookies.nf_jwt, { complete: true })
      console.log('decodedToken', decodedToken)
    } catch (e) {
      console.log(e)
    }

    // If other auth provider than netlify identity
    // verify the JWT against your secret

    if (!decodedToken.payload) {
      return callback(null, {
        statusCode: 401,
        body: JSON.stringify({
          message: `Your token is invalid. Logout and log back in at ${siteUrl}`,
        })
      })
    }

    // Make new token
    const newTokenData = {
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
    }
    const yourSuperSecret = 'secret'
    const newToken = jwt.sign(newTokenData, yourSuperSecret)

    /* Return this instead of redirect for debugging
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        event: event,
        context: context,
        cookies: cookies,
        decodedToken: decodedToken,
        newToken: newToken,
        clientContext: context.clientContext,
        urlData: urlData
      })
    })
    /**/

    // Do redirect
    return callback(null, {
      statusCode: 302,
      headers: {
        Location: `${redirectBaseUrl}/.netlify/functions/set-cookie?token=${newToken}&url=${redirectUrl}`,
        'Cache-Control': 'no-cache'
      }
    })
  }

  // No cookies found. Redirect them back to login page
  return callback(null, {
    statusCode: 302,
    headers: {
      Location: `${siteUrl}?site=${redirectUrl}`,
      'Cache-Control': 'no-cache'
    }
  })
}
