import express from "express";
import { supabase } from "../db/supabase.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello, from monk commerce!");
});

router.post("/coupons", async (req, res) => {
  const { code, type, description, usage_limit, threshold, discount_percent } = req.body;

  try {
    // inserting into coupons table
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code,
        type,
        description,
        usage_limit,
      })
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Please try later!" });
    }

    const coupon = data[0]; // inserted coupon row

    //  inserting into specific type of coupon table
    if (type === "cart-wise") {
      const { error: cwError } = await supabase
        .from("cart_wise_coupons")
        .insert({
          coupon_id: coupon.id,
          threshold: threshold,
          discount_percent: discount_percent,
        });

      if (cwError) {
        console.error(cwError);
        return res.status(500).json({ message: "Failed to insert cart-wise coupon details" });
      }
    }

    

    return res.status(200).json({
      message: "Coupon added successfully",
      coupon,
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

export default router;
