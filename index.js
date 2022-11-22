const { query } = require("express");
const express = require("express");
const { Op } = require("sequelize");
const Product = require("./models/product")
const app = express();

app.use(express.json());

app.get("/product/:page?", async(req,res)=>{
    const {search} = req.query;
    const {page} = req.params;
    let products = [];
    let pages;
    const offset = 5*(page-1) || 0;


    try{
        if(search){
            const count = await Product.count({
                where:{
                    [Op.or]:[
                        {name:{[Op.startsWith]:"%"+search+"%"}},
                        {brand:{[Op.startsWith]:"%"+search+"%"}},
                    ]
                }});
            pages = Math.ceil(count/5);

            products = await Product.findAll({
                where:{
                    [Op.or]:[
                        {name:{[Op.startsWith]:"%"+search+"%"}},
                        {brand:{[Op.startsWith]:"%"+search+"%"}},
                    ]
                },
                limit:5,
                offset});
            return res.send({products, pages});

        } else {
            const count = await Product.count();
            pages = Math.ceil(count/5);
            products = await Product.findAll({limit:5, offset});
            return res.send({products, pages});
           
        }
    }catch(err){
        return res.status(400).json({ message: err.message });
    }
})

app.post("/product", async(req,res)=>{
    const {name, brand, price} = await req.body;
    try{
        if(!name) throw new Error("Name needed to add a new element");
        if(!brand) throw new Error("Brand needed to add a new element");
        if(!price) throw new Error("Price needed to add a new element");
        
        const newProduct = await Product.create({
        name: req.body?.name,
        brand: req.body?.brand,
        price: Number(req.body?.price),
    });
        return res.send(newProduct);
    }catch(err){
        return res.status(400).json({ message: err.message });
    }

})

app.put("/product/:id", async(req,res)=>{
    const id = req.params.id;
    const values = req.body;
    const edit = await Product.findByPk(id);
    try{
        const edited = await edit.update({
            name:values?.name,
            brand:values?.brand,
            price:values?.price
            })

        return res.send(edited);
    }catch(err){
        return res.status(400).json({message: err.message});
    }
})

app.delete("/product/:id", async(req,res)=>{
    const id = req.params.id;
    const deleted = await Product.findByPk(id);
    try{
        await deleted.destroy();
        return res.send(deleted);
    }catch(err){
        return res.status(400).json({message: err.message});
    }
})

app.listen(3000);

// 1 - CREATE MIGRATION -> GIVES STRUCTURE TO THE DB TABLE.
// 2 - CREATE MODEL, EXPORT TO INDEX, AND CONNECT WITH DB ?
// 3 - 