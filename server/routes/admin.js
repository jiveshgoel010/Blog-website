const express = require('express');
const router = express.Router();
const post = require('../models/post');
const user = require('../models/user');
const bcrypt = require('bcrypt'); //encrypt and decrypt
const jwt = require('jsonwebtoken');



const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// check login
const authMiddleware = (req,res,next) =>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:'Unauthorized'});
    }
    
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch(error){
        return res.status(401).json({message:'Unauthorized'});
    }
}


// GET / Admin - login page
router.get('/admin', async(req,res)=>{
    try {
        const locals = {
            title: "Admin",
            desc: 'Simple blog website'
        }
        res.render('admin/index', {locals, layout : adminLayout});
    } catch (error) {
        console.log(error);
    }
})


// POST / Admin - check login
router.post('/admin', async(req,res)=>{
    try {
        const {username, password} = req.body;

        const users = await user.findOne({username});
        if(!users){
            return res.status(401).json({message: 'Invalid credentials'});
        }
        
        const isPasswordValid = await bcrypt.compare(password, users.password);
        
        if(!isPasswordValid){
            return res.status(401).json({message: 'Invalid credentials'});
        }

        const token = jwt.sign({userId : users._id}, jwtSecret);
        res.cookie('token', token, {httpOnly: true});

        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
})



// GET / Admin Dashboard
router.get('/dashboard', authMiddleware,async(req,res)=>{
    try {
        const locals = {
            title: "Admin",
            desc: 'Simple blog website'
        }
        const data = await post.find();
        res.render('admin/dashboard', {locals, data, layout : adminLayout});
    } catch (error) {
        console.log(error);
    }
})

// GET / Admin - New post 
router.get('/add-post',authMiddleware, async(req,res)=>{
    try {
        const locals = {
            title: "Add Post",
            desc: 'Simple blog website'
        }
        const data = await post.find();
        res.render('admin/add-post', {locals, layout : adminLayout});
    } catch (error) {
        console.log(error);
    }
})

// POST / Admin - post 
router.post('/add-post',authMiddleware, async(req,res)=>{
    try {
        try {
            const newPost = new post({
                title: req.body.title,
                body: req.body.body
            });
            
            await post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }
        
    } catch (error) {
        console.log(error);
    }
})

// GET / Admin - Edit post 
router.get('/edit-post/:id',authMiddleware, async(req,res)=>{
    try {
        const locals = {
            title: "Edit Post",
            desc: 'Simple blog website'
        }
        const data = await post.findOne({_id:req.params.id});
        
        res.render('admin/edit-post',{
            data, 
            layout: adminLayout,
            locals
        })
    } catch (error) {
        console.log(error);
    }
})

// PUT / Admin - Edit post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        
        await post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
    });
    res.redirect('/dashboard');
  
    // res.redirect(`/edit-post/${req.params.id}`);
  
    } catch (error) {
      console.log(error);
    }
  
  });


// DELETE / Admin - Delete post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await post.deleteOne({_id: req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  });
  
  
//GET / Logout
router.get('/logout', authMiddleware, async (req, res) => {
    res.clearCookie('token');
    // res.json({message: 'You have logged out'})
    res.redirect('/');
});


// POST / Register
router.post('/register', async(req,res)=>{
    try {
        const {username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const users = await user.create({username, password:hashedPassword});
            res.status(201).json({message:'User created', users});
        } catch (error){
            console.log(error);
        }
        
    } catch (error) {
        if(error.code === 11000){
            res.status(409).json({message: 'User already in use'});
        } 
        res.status(500).json({message: 'Internal server error'});
    }
})

module.exports = router;