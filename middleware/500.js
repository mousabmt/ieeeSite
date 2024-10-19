module.exports=(err,req,res)=>{
    
res.status(500).json({
    code:500,
    error:err.message
})
}