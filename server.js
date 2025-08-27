import express from "express"
import bodyParser from "body-parser"
import router from "./routes/coupons.js"

const app=express()

app.use(express.json())
app.use("/",router)

app.listen(3000,()=>{
    console.log("server is running on 3000..")
})