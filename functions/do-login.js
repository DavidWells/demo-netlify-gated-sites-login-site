import fetch from 'node-fetch'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import parseURL from 'url-parse'

function parseJsonResponse(response) {
  return response.json().then(json => {
    if (!response.ok) {
      return Promise.reject({ status: response.status, json })
    }

    return json
  })
}

function request(apiURL, options = {}) {
  const optionHeaders = options.headers || {}
  const headers = {
    "Content-Type": "application/json",
    ...optionHeaders
  }
  return fetch(apiURL, { ...options, headers }).then(response => {
    const contentType = response.headers.get("Content-Type")

    if (contentType && contentType.match(/json/)) {
      return parseJsonResponse(response)
    }

    if (!response.ok) {
      return response.text().then(data => {
        return Promise.reject({
          status: response.status,
          data: data
        })
      })
    }

    return response.text().then(data => {
      data
    })

  })
}

exports.handler = (event, context, callback) => {
  const siteUrl = process.env.URL
  const params = event.queryStringParameters
  const urlData = parseURL(params.site)

  const redirectUrl = params.site.replace(/\/$/, "")
  console.log(event)
  console.log(context)
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
    const yourSuperSecret = 'secret'
    const newToken = jwt.sign({
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
    }, yourSuperSecret);

    // Do redirect
    // return callback(null, {
    //   statusCode: 302,
    //   headers: {
    //     Location: `${redirectUrl}/.netlify/functions/set-cookie?token=${newToken}&site=${params.url}`,
    //     'Cache-Control': 'no-cache'
    //   }
    // })

    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        data: 'foo',
        event: event,
        context: context,
        cookies: cookies,
        decodedToken: decodedToken,
        newToken: newToken,
        clientContext: context.clientContext,
        urlData: urlData
      })
    })
  }

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
    	data: 'foo',
      event: event,
      context: context,
      clientContext: context.clientContext
    })
  })
}

/*

exports.handler = (event, context, callback) => {
  const { identity, user } = context.clientContext
  const payload = JSON.parse(event.body)

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
    })
  }

  let decodedToken
  try {
    decodedToken = jwt.decode(authToken, { complete: true })
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
  }, 'secret')

  console.log('newToken', newToken)

  // invalid token - synchronous
  try {
    var valid = jwt.verify(authToken, 'secret')
    console.log('valid')
  } catch(err) {
    console.log('verify error', err)
    console.log(err.name)
    console.log(err.message)
  }
  console.log('payload.url', payload.url)
  const apiURL = 'https://gated-sites-demo-site1.netlify.com/.netlify/functions/set-cookie-post'
  const reqOptions = {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${newToken}`
    },
    body: JSON.stringify({
      oldToken: authToken,
      newToken: newToken,
      user: user
    })
  }

  request(apiURL, reqOptions).then(() => {
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        event: event,
        context: context,
        decodedToken: decodedToken,
        newToken: newToken
      })
    })
  }).catch((e) => {
    return callback(null, {
      statusCode: e.statusCode,
      body: JSON.stringify({
        error: e.message
      })
    })
  })
}
*/
