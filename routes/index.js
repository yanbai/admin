
/*
 * GET home page.
 */
var crypto = require('crypto'),
    User = require('../models/user.js'),
	Post = require('../models/post.js');
	
module.exports = function(app) {
	
	app.get('/', function (req, res) {
		Post.getAll(null,function(err,posts){
			if(err){
			    posts = [];
			}
			console.log(posts);
			res.render('index', {
				title: '主页',
				user: req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		})
	
	});
	
    app.get('/reg', function (req, res) {
		res.render('reg', { 
			title: '注册',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString() 
		});
    });
	
    app.get('/login', function (req, res) {
		res.render('login', { 
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString() 
		});
    });
    
    app.get('/logout', function (req, res) {
    });
	
	app.get('/upload', function (req, res) {
	    res.render('upload', {
			title: '文件上传',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
	    });
	});
	
	
	
	app.get('/u/:name',function(req,res){
		User.get(req.params.name,function(err,user){
			if(!user){
				req.flash('error','用户不存在');
				return res.redirect('/');
			}
		})
	});
	
	
	app.get('/admin', function (req, res) {
	    res.render('admin_home', {
			title: '后台首页',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
	    });
	});
	
	app.get('/admin/post_new', function (req, res) {
		res.render('admin_post_new', {
			title: '发表',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
    });
	
	app.get('/admin/post_lists', function (req, res) {
		if(req.param('post_id')&&req.param('action') == 'edit'){
			Post.getById(req.param('post_id'),function(err,post){
				res.render('admin_post_edit', {
					title: '编辑文章',
					post: post,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			})
		}else if(req.param('post_id')&&req.param('action')=='delete'){
			Post.delete(req.param('post_id'),function(err){
				if(err)req.flash('error',err);
				req.flash('success','删除成功');
				res.redirect('/admin/post_lists');
			})
		}else{
			Post.getAll(null,function(err,posts){
				res.render('admin_post_lists', {
					title: '文章列表',
					posts: posts,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			})
		}
		
    });
	
	

    app.post('/reg', function (req, res) {
	    var name = req.body.name,
	    password = req.body.password,
	    password_re = req.body['password-repeat'];
	    //检验用户两次输入的密码是否一致
	    if (password_re != password) {
			req.flash('error', '两次输入的密码不一致!'); 
			return res.redirect('/reg');//返回注册页
	    }
	    //生成密码的 md5 值
	    var md5 = crypto.createHash('md5'),
		    password = md5.update(req.body.password).digest('hex');
	    var newUser = new User({
		    name: name,
		    password: password,
		    email: req.body.email
	    });
	    //检查用户名是否已经存在 
	    User.get(newUser.name, function (err, user) {
			if (user) {
			    req.flash('error', '用户已存在!');
			    return res.redirect('/reg');//返回注册页
			}
			//如果不存在则新增用户
			newUser.save(function (err, user) {
			    if (err) {
				    req.flash('error', err);
				    return res.redirect('/reg');//注册失败返回主册页
			    }
			    req.session.user = user;//用户信息存入 session
			    req.flash('success', '注册成功!');
			    res.redirect('/');//注册成功后返回主页
			});
	    });
    });
  
    app.post('/login', function (req, res) {
	    //生成密码的 md5 值
	    var md5 = crypto.createHash('md5'),
		    password = md5.update(req.body.password).digest('hex');
	    //检查用户是否存在
	    User.get(req.body.userName, function (err, user) {
			if (!user) {
				req.flash('error', '用户不存在!');
				return res.redirect('/login');//用户不存在则跳转到登录页
			}
			//检查密码是否一致
			if (user.password != password) {
				req.flash('error', '密码错误!');
				return res.redirect('/login');//密码错误则跳转到登录页
			}
			//用户名密码都匹配后，将用户信息存入 session
			req.session.user = user;
			req.flash('success', '登陆成功!');
			res.redirect('/');//登陆成功后跳转到主页
	    });
    });
	
    app.post('/admin/post_new', function (req, res) {
	    var currentUser = req.session.user,
	  	    post = new Post(currentUser.name,req.body.title,req.body.post);
	    post.save(function(err){
		    if(err){
			    req.flash('error',err);
			    return res.redirect('/');
		    }
		    req.flash('success','发布成功');
		    res.redirect('/');
	    })
    });
	
	app.post('/admin/post_lists',function(req,res){
		if(req.param('post_id')&&req.param('action') == 'edit'){
			Post.update(req.param('post_id'),req.param('title'),req.param('post'),function(err){
				if(err)req.flash('error',err);
				req.flash('success','修改成功');
				res.redirect('/admin/post_lists');
			})
		}
	})

    app.post('/upload', function (req, res) {
	    req.flash('success', '文件上传成功!');
	    res.redirect('/upload');
    });
};