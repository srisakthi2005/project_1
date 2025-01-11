// const express= require("express");
// const app = express()


// const port=3000;
// const data=[{id:1,name:"abc",address:"aaa"},
//     {id:2,name:"def",address:"bbb"},
//     {id:3,name:"ghi",address:"ccc"},
// ];
// app.get('/students/details',(req,res)=>{
//     res.json(data);
// });

// app.listen(port,()=>{
//     console.log(`server is running on http://localhost:${port}`);
//     });

//     app.get("/api/singledata",(req,res)=>{
//         const{name,id}=req.query;

//     if(name)
//     {
//         const result=data.find(item => item.name===String(name))&& item.id==Number(id);
//         if(result)
//         {
//             res.json(result);
//         }
//         else{
//             res.status(400).json({error:"Data not found for the given name"})
//         }
//     }
//     else{
//         res.json(data);
//     }
//     });



const express = require("express");
const mongoose = require("mongoose");
const app = express()

const port = 3000;
const mongourl = "mongodb://localhost:27017/local";
mongoose.connect(mongourl)
    .then(() => {
        console.log("Connected to MongoDB...")
        app.listen(port, () => {
            console.log(`server is running on port ${port}`);
        })
    })
    .catch((err) => console.log(err))

const expenseschema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true }
})
const expense = mongoose.model("expense", expenseschema)

app.get("/api/expenses", async (req, res) => {
    try {
        const ex = await expense.find();
        res.status(200).json(ex);
    } catch (err) {
        res.status(500).json({ error: "Error fetching expenses" })
    }
});

const { v4: uuidv4 } = require("uuid");
app.post("/api/expenses", async (req, res) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });
    req.on("end", async () => {
        const data = JSON.parse(body);
        const newexpense = new expense({
            id: uuidv4(),
            title: data.title,
            amount: data.amount,
        });
        const savedexpenses = await newexpense.save();
        res.status(200).json(savedexpenses);

    });

});

// update
app.use(express.json())
app.put("/api/expenses/:id", async (req, res) => {
    const { id } = req.params;
    const { title, amount } = req.body;
    console.log({ title })
    try {
        const updateExpense = await expense.findOneAndUpdate({ id },
            { title, amount }
        );
        if (!updateExpense) {
            return res.status(404).json({ error: "Expense not found" })
        }

        res.status(200).json({title, amount});
    } catch (error) {
        res.status(500).json({ error: "Error updating expense" })
    }
})

