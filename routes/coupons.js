import express from "express";
import { supabase } from "../db/supabase.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello, from monk commerce!");
});

//creating new coupon
router.post("/coupons", async (req, res) => {
  const { code, type, description, usage_limit,discount_type,discount_value,threshold } = req.body;

  try {
    // inserting into coupons table
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code,
        type,
        description,
        usage_limit,
        discount_type,
        discount_value,
        threshold
      })
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Please try later!" });
    }
    

    return res.status(200).json({
      message: "Coupon added successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unexpected error!!!" });
  }
});


router.post("/add-product",async (req,res)=>{
    const {name,price}=req.body;
    try {
        const{data,error}=await supabase.from("products")
        .insert({
            name,
            price
        }
    )
    if(error){
      console.error(error)
      res.status(500).send(error.message)  
    }
    else{
        res.status(200).json({"message":"inserted product successfully!!"})
    }
    } catch (error) {
        console.error(error)
        return res.status(500).json({"message":"Unexpected Error!!!"})
    }
})

//fetch all coupons
router.get("/coupons",async (req,res)=>{
    try {
        const {data,error}=await supabase.from("coupons")
        .select()
        if(error){
            console.error(error)
            res.status(404).send(error.message)
        }
        else{
            res.status(200).send(data)
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({"message":"Unexpected error, comeback again later!!"})
    }
})

//fetch coupon by id
router.get("/coupon/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === 'PGRST116' || error.details?.includes('Results contain 0 rows')) {
                return res.status(404).json({ message: "Coupon not found." });
            }
            console.error("Database query error:", error);
            return res.status(500).json({ message: "Failed to fetch coupon. Please try again later." });
        }

        if (!data) {
            return res.status(404).json({ message: "Coupon not found." });
        }

        return res.status(200).json(data);

    } catch (err) {
        console.error("Unexpected error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
});

//deleting a coupon

router.delete("/delete-coupon/:id",async(req,res)=>{
  const id = parseInt(req.params.id, 10);
  console.log("Deleting coupon with id:", id);
  try {
    const {data,error}=await supabase.from("coupons")
    .delete()
    .eq("id",id)
    .select()
    if(error){
      console.error(error)
      return res.status(400).json({message:error.message})
    }
    console.log(data)
    if (data.length === 0) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    return res.status(200).json({"message":"Coupon deleted successfully!!!"})
  } catch (error) {
    console.error(error)
    return res.status(500).json({"message":"Unexpected error,Kindly contact the developer!!!!"})
  }
})

//updating a coupon
router.put("/update-coupon/:id",async(req,res)=>{
  const id=parseInt(req.params.id)
  const updateFields=req.body;
  try {
    const {data,error}=await supabase.from("coupons")
    .update(updateFields)
    .eq("id",id)
    .select()
    if(error){
      return res.status(400).json({message:error.message})
    }
    if(!data || data.length===0){
      return res.status(404).json({"message":"soupon not found!!!!"})
    }
    return res.status(200).json({"message":"coupon updated successfully!!"})
  } catch (error) {
    console.error(error)
    return res.status(500).json({"message":"Unexpected error, kindly contact the developer!!!!"})
  }
})
export default router;
