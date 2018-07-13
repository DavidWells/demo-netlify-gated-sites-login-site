import fetch from 'node-fetch'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
// https://stackoverflow.com/questions/46333510/okta-sign-in-widget-mfa

exports.handler = (event, context, callback) => {
  const body = JSON.parse(event.body)

  console.log('Verify okta and set cookie')
  const baseURL = process.env.OKTA_BASE_URL

  const options = {
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `SSWS ${process.env.OKTA_API_TOKEN}`
    }
  }

  fetch(`${baseURL}/api/v1/sessions/${body.okta_id}`, options)
  .then(res => res.json())
  .then(data => {
    console.log('okta data', data)
    if (data.status !== "ACTIVE") {
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({
        	error: 'Session status was not active'
        })
      })
	  }

    // Okta session active. Make them a netlify nf_jwt Token
    var d = new Date(data.expiresAt);

    var calculatedExpiresIn = (((d.getTime()) + (60 * 60 * 1000)) - (d.getTime() - d.getMilliseconds()) / 1000);
    console.log('calculatedExpiresIn', calculatedExpiresIn)
    // Make new netlify token
    const netlifyTokenData = {
      sub: data.userId,
      exp: calculatedExpiresIn,
      email: data.login,
      "app_metadata": {
        "authorization": {
          "roles": ["admin", "editor"]
        }
      }
    }

    const netlifyToken = jwt.sign(netlifyTokenData, process.env.JWT_SECRET)

    const nf_jwtCookie = cookie.serialize('nf_jwt', netlifyToken, {
      secure: true,
      httpOnly: true,
      path: "/",
      expires: data.expiresAt
    })

    console.log('nf_jwtCookie', nf_jwtCookie)

    return callback(null, {
      statusCode: 200,
      headers: {
        'Set-Cookie': nf_jwtCookie
      },
      body: JSON.stringify({
      	data: data
      })
    })
  }).catch((e) => {
    console.log('promise error', e)
  })

  // do redirect & set cookie
  // return callback(null, {
  //   statusCode: 302,
  //   headers: {
  //     Location: process.env.URL,
  //     'Set-Cookie': myCookie,
  //     'Cache-Control': 'no-cache'
  //   }
  // })
}
