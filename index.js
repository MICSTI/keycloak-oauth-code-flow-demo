const express = require("express");
const request = require("request");
const jwt = require("jwt-simple");

// use `dotenv` package to load app configuration to environment vars
require("dotenv").config();

const config = {
  app: {
    port: process.env.APP_PORT,
    allowSelfSignedCerts: process.env.ALLOW_SELF_SIGNED_CERTS
  },
  oauth: {
    redirectPath: process.env.OAUTH_REDIRECT_PATH,
    redirectUri: process.env.OAUTH_REDIRECT_URI
  },
  keycloak: {
    baseUrl: process.env.KEYCLOAK_BASE_URL,
    realm: process.env.KEYCLOAK_REALM,
    clientId: process.env.KEYCLOAK_CLIENT_ID
  }
};

// OAuth endpoints
const { baseUrl, realm, clientId } = config.keycloak;

const tokenEndpoint = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;
const userInfoEndpoint = `${baseUrl}/auth/realms/${realm}/protocol/openid-connect/userinfo`;
const logoutEndpoint = `${baseUrl}/auth/realms/${realm}/protocol/openid-connect/logout`;

const app = express();
app.get(config.oauth.redirectPath, (req, res) => {
  console.log(`received callback`, req.query);

  const { code } = req.query;

  const formData = {
    grant_type: "authorization_code",
    client_id: config.keycloak.clientId,
    redirect_uri: config.oauth.redirectUri,
    scope: "openid profile User",
    code
  };

  const requestConfig = {
    url: tokenEndpoint,
    form: formData,
    agentOptions: {}
  };

  if (config.app.allowSelfSignedCerts === "yes") {
    requestConfig.agentOptions["rejectUnauthorized"] = false;
  }

  request.post(requestConfig, (err, response, body) => {
    if (err) {
      console.error(err);
      return;
    }

    const data = JSON.parse(body);

    console.log("got data", data);

    res.status(200).json(data);
  });
});

const port = config.app.port;
app.listen(port, () => {
  console.log(`🚀 Demo app running on port ${port} 🚀\n`);
  console.log(
    `OAuth redirect callback listening on 👉 http://localhost:${port}${config.oauth.redirectPath} 👈`
  );
});
