const express = require("express");
const { body } = require("express-validator");
const { createRegistration } = require("../controllers/registrationController");
const { registrationFee } = require("../config");

const router = express.Router();

const memberRules = (prefix) => [
  body(`${prefix}.name`).trim().isLength({ min: 2, max: 80 }).withMessage(`${prefix} name is required.`),
  body(`${prefix}.email`).isEmail().withMessage(`${prefix} email is invalid.`),
  body(`${prefix}.mobile`).trim().matches(/^[0-9+\-\s]{10,15}$/).withMessage(`${prefix} mobile is invalid.`)
];

router.post(
  "/",
  [
    body("teamName").trim().isLength({ min: 2, max: 80 }).withMessage("Team name is required."),
    ...memberRules("member1"),
    ...memberRules("member2"),
    body("amount").optional().toFloat().custom((v) => Number(v || registrationFee) >= 0)
  ],
  createRegistration
);

router.get("/config", (req, res) => {
  res.json({
    success: true,
    registrationFee,
    upiId: require("../config").upiId,
    upiName: require("../config").upiName
  });
});

module.exports = router;
