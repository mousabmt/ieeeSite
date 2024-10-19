module.exports=(req,res,next)=>{
    console.log("Time and Date");
    
    const currentTimeDate= new Date();
const date = currentTimeDate.toLocaleDateString();
const time = currentTimeDate.toLocaleTimeString();
req.stamper={date,time};

next();
}