const errorMiddleware = require("../middlewares/errorMiddleware")
const Registeruser = require("../models/authModel")
const Inventories = require('../models/inventoryModel')
const mongoose = require("mongoose")
const CustomeError = require("../utils/customeError")


async function inventoryController(req, res, next) {
    const error = new Error()
    try {
        //verify token user 
        const tokenuser = await Registeruser.findById(req.user.userId)
        if (tokenuser.role !== "organisation") {
            const error = new CustomeError("You are not Organization to collet Blood", 400)
            return next(error)
        }

        const user = await Registeruser.findOne({ email: req.body.email })
        if (!user) {
            const error = new CustomeError("User Not found Register first !", 400)
            return next(error)
        }
        if (req.body.inventoryType === "in" && user.role !== "donar") {
            const error = new CustomeError("This email is not register as Donor", 400)
            return next(error)
        }

        if (req.body.inventoryType === "out" && user.role !== "hospital") {
            const error = new CustomeError("This email is not register as hospital", 400)
            return next(error)
        }

        if (req.body.inventoryType === "out") {
            req.body.hospital = user._id

            const organisation = tokenuser._id

            const Quntityin = await Inventories.aggregate([
                {
                    $match: {
                        organisation,
                        inventoryType: "in",
                        bloodgroup: req.body.bloodgroup
                    }
                },
                {
                    $group: {
                        _id: "$bloodgroup",
                        totalQuntity: {
                            $sum: "$quntity"
                        }
                    }
                }
            ])

            const totalInQuntity = Quntityin?.[0]?.totalQuntity || 0

            const Quntityout = await Inventories.aggregate([
                {
                    $match: {
                        organisation,
                        inventoryType: "out",
                        bloodgroup: req.body.bloodgroup
                    }
                },
                {
                    $group: {
                        _id: "$bloodgroup",
                        totalQuntity: {
                            $sum: "$quntity"
                        }
                    }
                }
            ])

            const totaloutQuntity = Quntityout?.[0]?.totalQuntity || 0

            const totalAvailable = totalInQuntity - totaloutQuntity

            if (totalAvailable < Number(req.body.quntity)) {
                const error = new CustomeError(`${totalAvailable === 0 ? "No blood Group" : totalAvailable} Available in inventory`, 400)
                return next(error)
            }

        } else {
            req.body.donar = user._id
        }

        req.body.organisation = tokenuser._id

        const invetory = new Inventories(req.body)
        await invetory.save()

        res.status(201).send({
            success: true,
            msg: "blood inventory updated successfull"
        })

    } catch (error) {
        const err = new Error(error.message)
        err.status = 500
        next(err)
    }
}

async function getInventoriesRecord(req, res) {
    try {
        const data = await Inventories.find({ organisation: req.user.userId }).sort({ createdAt: -1 }).populate("donar hospital", "-password")
        res.status(200).send({ success: true, data: data })
    } catch (error) {
        const err = new Error(error.message)
        err.status = 500
        next(err)
    }
}

async function getAllDonars(req, res, next) {

    try {

        //below is aggregate method 

        const data = await Inventories.aggregate([
            {
                $match: {
                    inventoryType: "in",
                    organisation: new mongoose.Types.ObjectId(req.user.userId),
                }
            }, {
                $group: {
                    _id: "$donar"
                }
            }
        ])

        //below distinct method to get unique data

        // const data = await Inventories.distinct("donar", { organisation: new mongoose.Types.ObjectId(req.user.userId) })

        const donar = await Registeruser.find({ _id: { $in: data } }, "-password -mobile")
        res.status(200).send({ success: true, data: donar })
    } catch (error) {
        const err = new CustomeError(error.message, 500)
        next(err)
    }
}

async function getAllHospital(req, res, next) {

    try {
        const data = await Inventories.aggregate([
            {
                $match: {
                    inventoryType: "out",
                    organisation: new mongoose.Types.ObjectId(req.user.userId),
                }
            }, {
                $group: {
                    _id: "$hospital"
                }
            }
        ])
        const hospita = await Registeruser.find({ _id: { $in: data } }, "-password -mobile")
        res.status(200).send({ success: true, data: hospita })

    } catch (error) {
        const err = new CustomeError(error.message, 500)
        next(err)
    }
}

async function getDonarOrganization(req, res, next) {
    const error = new Error()
    try {
        const currentUser = await Registeruser.findById(req.user.userId)

        if (currentUser.role !== "donar") {
            error.message = "Id Not Register as User !"
            error.status = 404
            next(error)
        }

        const data = await Inventories.aggregate([
            {
                $match: {
                    donar: new mongoose.Types.ObjectId(req.user.userId),
                }
            }, {
                $group: {
                    _id: "$organisation"
                }
            }
        ])
        const organisation = await Registeruser.find({ _id: { $in: data } }, "-password -mobile")
        res.status(200).send({ success: true, data: organisation })

    } catch (error) {
        const err = new CustomeError(error.message, 500)
        next(err)
    }
}


async function getFilterController(req, res) {

    try {
        const data = await Inventories.find(req.body.filter).sort({ createdAt: -1 }).populate("hospital", "-password ").populate("organisation", "-password ").populate("donar", "-password ")
        res.status(200).send({ success: true, data: data })
    } catch (error) {
        const err = new CustomeError(error.message, 500)
        next(err)
    }
}


async function getAllBloodGroupData(req, res, next) {

    const bloodGroup = ["A+", "A-", "AB+", "AB-", "O+", "O-", "B+", "B-"]
    const organisation = new mongoose.Types.ObjectId(req.user.userId)
    let bloodgroupData = []

    try {

        await Promise.all(
            bloodGroup.map(async (blood, index) => {
                const totalin = await Inventories.aggregate([
                    {
                        $match: {
                            organisation,
                            inventoryType: "in",
                            bloodgroup: blood
                        }
                    }, {
                        $group: {
                            _id: null,
                            total: {
                                $sum: "$quntity"
                            }
                        }
                    }
                ])
                const totalOut = await Inventories.aggregate([
                    {
                        $match: {
                            organisation,
                            inventoryType: "out",
                            bloodgroup: blood
                        }
                    }, {
                        $group: {
                            _id: null,
                            total: {
                                $sum: "$quntity"
                            }
                        }
                    }
                ])

                const available = Number(totalin[0]?.total || 0) - Number(totalOut[0]?.total || 0)

                bloodgroupData.push({
                    BloodGroup: blood,
                    TotalIn: (totalin[0]?.total || 0),
                    totalOut: (totalOut[0]?.total || 0),
                    totalAvailable: available

                })
            })
        )

        res.status(200).send({
            success: true,
            msg: "Blood Group Data get",
            data: bloodgroupData
        })

    } catch (error) {
        const err = new CustomeError(error.message, 500)
        next(err)
    }
}

module.exports = { inventoryController, getInventoriesRecord, getAllDonars, getAllHospital, getDonarOrganization, getFilterController, getAllBloodGroupData }