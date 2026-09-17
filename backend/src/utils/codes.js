const { randomBytes } = require("crypto");

function shortCode(prefix = "VR") {
  return `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function registrationId() {
  return `VR-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

module.exports = { shortCode, registrationId };
