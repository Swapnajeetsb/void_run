const express = require("express");
const {
  dashboard,
  listRegistrations,
  updatePayment,
  addCoordinator,
  listCoordinators,
  createOfflineRegistration,
  exportExcel
} = require("../controllers/adminController");
const { auth, allow } = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/dashboard", allow("admin", "coordinator"), dashboard);
router.get("/registrations", allow("admin", "coordinator"), listRegistrations);
router.get("/export", allow("admin", "coordinator"), exportExcel);
router.patch("/registrations/:id/payment", allow("admin", "coordinator"), updatePayment);

router.post("/offline-registration", allow("admin", "coordinator"), createOfflineRegistration);

router.get("/coordinators", allow("admin"), listCoordinators);
router.post("/coordinators", allow("admin"), addCoordinator);

module.exports = router;
