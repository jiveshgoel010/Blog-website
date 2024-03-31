const express = require('express');
const router = express.Router();
const post = require('../models/post');

//Routes

// GET / HOME
router.get('/', async(req,res)=>{
    
    try {
        
        const locals = {
            title: 'NodeJS blog',
            desc: 'Simple blog website'
        }
        
        let perPage = 5;
        let page = req.query.page || 1;

        const data = await post.aggregate([ {$sort:{createdAt:-1}}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await post.countDocuments();
        const nextPage = parseInt(page)+1;
        const hasNextPage = nextPage <= Math.ceil(count/perPage);

        res.render('index', 
        { locals, 
          data,
          current: page,
          nextPage: hasNextPage ? nextPage : null
        });
    } 
    catch (error) {
        console.log(error);
    }
});

// GET / POST
router.get('/post/:id', async(req,res)=>{
    try {
        
        let slug = req.params.id;
        
        const data = await post.findById({_id: slug});

        const locals = {
            title: data.title,
            desc: 'Simple blog website'
        }
        res.render('post', {locals, data});
    } catch (error) {
        console.log(error);
    }
});



// POST / search
router.post('/search', async(req,res)=>{
    try {
        const locals = {
            title: 'Search',
            desc: 'Simple blog website'
        }
        
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
        
        const data = await post.find({
            $or: [
                {title : {$regex: new RegExp(searchNoSpecialChar, 'i')}},
                {body : {$regex: new RegExp(searchNoSpecialChar, 'i')}}
            ]
        });

        res.render('search', {data,locals});

    } catch (error) {
        console.log(error);
    }
});



//Routes to other pages
router.get('/about', (req,res)=>{
    res.render('about')
});

router.get('/contact', (req,res)=>{
    res.render('contact')
});



/*
// Without pagination
router.get('/', async(req,res)=>{
    const locals = {
        title: 'NodeJS blog',
        desc: 'Simple blog website'
    }

    try {
        const data = await post.find();
        res.render('index', {locals, data});
    } catch (error) {
        console.log(error);
    }

});
*/

// function insertPostData(){
//     post.insertMany([
//         {
//             title: "Building a blog1",
//             body: "This is the body text1"
//         },
//         {
//             title: "Building a blog2",
//             body: "This is the body text2"
//         },
//         {
//             title: "Building a blog3",
//             body: "This is the body text3"
//         },
//         {
//             title: "Building a blog4",
//             body: "This is the body text4"
//         },
//         {
//             title: "Building a blog5",
//             body: "This is the body text5"
//         },
//     ])
// }

// insertPostData();

module.exports = router;