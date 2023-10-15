import express, { json } from "express";
import { Usermodel } from "../Mongoose/model.js";
import { v4 } from "uuid";
import bcrypt from "bcrypt"


const userRoutes = express.Router()

userRoutes.use(json())


userRoutes.post("/register", async (req, res) => {
    try {
        const payload = req.body
        const isUser = await Usermodel.findOne({ email: payload.email })

        if(!payload){
            return res.status(400).send("Email is required");
        }
        
        if (isUser) {
            return res.status(409).send("user already exists")
        }
        bcrypt.hash(payload.password, 10, async (err, hash) => {
            const newUser = new Usermodel({ ...payload, id: v4(), password: hash })
            await newUser.save()
            res.status(201).send("Registered success")
        })


    } catch (err) {
        res.status(500).send(err.message)
    }
})

userRoutes.post("/login", async (req, res) => {
    try {
        const payload = req.body;
        const user = await Usermodel.findOne({ email: payload.email });
        if (!user) {
            return res.status(404).send("no user found")
        }
        bcrypt.compare(payload.password, user.password, async (err, result) => {
            if (!result) {
                return res.status(400).send("invalid credentials")
            } else {
                const response = user.toJSON()
                delete response.password
                res.status(201).send(response)
            }
        })
    } catch (err) {
        res.status(500).send(err.message)
    }
})




export default userRoutes