const express = require("express");
const request = require("request");
const fs = require("fs");
const whiskers = require("whiskers");
const util = require("./util");

// use `dotenv` package to load app configuration to environment vars
require("dotenv").config();

const config = {
  app: {
    port: process.env.APP_PORT,
    allowSelfSignedCerts: process.env.ALLOW_SELF_SIGNED_CERTS,
    corsOrigin: process.env.CORS_ORIGIN
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

// allow CORS from specified resources
if (config.app.corsOrigin) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", config.app.corsOrigin);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
}

app.use("/public", express.static("public"));

app.get(config.oauth.redirectPath, (req, res) => {
  if (req.query["ref"] === "estmk") {
    console.log(`received ref callback`, req.query);

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
        return res.status(500).send(err);
      }

      const data = JSON.parse(body);

      fs.readFile("./public/index.html", "utf8", (err, fileData) => {
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }

        const renderedTemplate = whiskers.render(fileData, {
          raw: util.getPrettyString(data),
          accessToken:
            util.getDecodedPrettyString(data.access_token) ||
            "No access token received",
          refreshToken:
            util.getDecodedPrettyString(data.refresh_token) ||
            "No refresh token received",
          idToken:
            util.getDecodedPrettyString(data.id_token) || "No ID token received"
        });
        return res.status(200).send(renderedTemplate);
      });
    });
  } else {
    res.status(200).send();
  }
});

const port = config.app.port;
app.listen(port, () => {
  console.log(`🚀 Demo app running on port ${port} 🚀\n`);
  console.log(
    `OAuth redirect callback listening on 👉 http://localhost:${port}${config.oauth.redirectPath} 👈`
  );
});
