module.exports=(req,res)=>{
    
res.status(404).json({
    code:404,
    path:req.originalUrl,
    homeLink:"/"
})
}