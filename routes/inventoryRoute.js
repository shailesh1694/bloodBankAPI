const express = require("express")
const { inventoryController, getInventoriesRecord, getAllDonars, getAllBloodGroupData, getAllHospital, getDonarOrganization, getFilterController } = require("../controller/inventoryController")
const authMiddleware = require("../middlewares/authMiddleware")

const router = express.Router()

router.post("/add", authMiddleware, inventoryController)
router.get("/inventories", authMiddleware, getInventoriesRecord)
router.get("/all-donar", authMiddleware, getAllDonars)
router.get("/all-hospital", authMiddleware, getAllHospital)
router.get("/organisation-all-donar", authMiddleware, getDonarOrganization)
router.post("/filter", authMiddleware, getFilterController)
router.get("/blood-group-data", authMiddleware, getAllBloodGroupData)

module.exports = router
