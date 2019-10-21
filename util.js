const jwt = require("jwt-simple");
const request = require("request");

const getDecodedToken = encoded => jwt.decode(encoded, null, true);

const getPrettyString = obj => {
  if (!obj) {
    return null;
  }

  return JSON.stringify(obj, null, 2);
};

const getDecodedPrettyString = obj => {
  if (!obj) {
    return null;
  }

  return JSON.stringify(getDecodedToken(obj), null, 2);
};

module.exports = { getDecodedToken, getDecodedPrettyString, getPrettyString };
