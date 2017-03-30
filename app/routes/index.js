'use strict';

var path = process.cwd();

module.exports = function (app, passport, session, client, urli, MongoClient, ObjectId, bodyParser) {

	// Authorized or not
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) return next();
		else res.sendFile(path + '/public/login.html');
	}
	
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.route('/auth/github').get(passport.authenticate('github'));
	app.route('/auth/github/callback').get(passport.authenticate('github', {successRedirect: '/', failureRedirect: '/'}));

	// Include home page
	app.route('/').get(isLoggedIn, function (req, res) {
		res.sendFile(path + '/public/index.html');
	});
	
	// Include my going page
	app.route('/my').get(isLoggedIn, function (req, res) {
		res.sendFile(path + '/public/my.html');
	});

	// Logout
	app.route('/logout').get(function (req, res) {
		req.logout();
		res.redirect('/');
	});
    
    // View user name
    app.post('/nameD', function(req, res) {
    	if (req.isAuthenticated()) {
			MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('nightlife-users').find({_id : ObjectId(req.session.passport.user.toString())}).toArray(function(err, data) {
    				if (err) return 0;
    				else res.end(data[0].github.displayName);
    				db.close();
				});
    		});
    	}
    	else res.end('Nightlife Coordination App');
    });
    
    // Add to 'My Going'
    app.post('/iamgo', function(req, res) {
    	var url = req.body.url,
    		name = req.body.name;
    	if (req.isAuthenticated()) {
    		var user = req.session.passport.user;
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('nightlife-search').find({url : url}).toArray(function(err, data) {
    				if (err) return 0;
    				else if (data && data.length) {
    					var j = 0;
    					for (var i = 0; i < data[0].who.length; i++)
    						if (data[0].who[i] == user) {
    							j = 1;
    							break;
    						}
    					if (j == 0) db.collection('nightlife-search').findOneAndUpdate({url : url}, { $inc: {num : 1}, $push: {who: user}}, function (err, docs) {
    						if (err) return 0;
    						else res.end((docs.value.num + 1) + ' GOING');
    					});
    					else db.collection('nightlife-search').findOneAndUpdate({url : url}, { $inc: {num : -1}, $pull: {who: user}}, function (err, docs) {
    						if (err) return 0;
    						else res.end((docs.value.num - 1) + ' GOING');
    					});
    				}
    				else db.collection('nightlife-search').insertMany([{url : url, name : name, num : 1, who: [user]}], function (err, docs) {
    					if (err) return 0;
						else res.end('1 GOING');
    				});
    				db.close();
    			});
    		});
    	}
    	else res.end('error');
    });
    
	// Search function
    app.post('/search', function(req, res) {
    	var loc = req.body.loc,
    		str = '';
    	client.search({category_filter: "bars", terms: "bar", location: loc}).then(function (data) {
    		if (req.isAuthenticated()) {
    			MongoClient.connect(urli, function(err, db) {
					if (err) return 0;
    				else db.collection('nightlife-users').findOneAndUpdate({_id : ObjectId(req.session.passport.user.toString())}, { $set: {location : loc}});
    				db.close();
				});
    		}
    		for (var i = 0; i < data.businesses.length; i++) {
				str += data.businesses[i].url + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + data.businesses[i].name + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + data.businesses[i].snippet_text + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU';
				if (data.businesses[i].image_url) str += data.businesses[i].image_url + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU';
				else str += '/public/img/logo.png' + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU';
			}
			res.end(str);
		}).catch(function (err) {
			if (err) res.end("error");
		});
    });
    
    // Auto authenticated search
    app.post('/auto', function(req, res) {
    	if (req.isAuthenticated()) {
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('nightlife-users').find({_id : ObjectId(req.session.passport.user.toString())}).toArray(function(err, data) {
    				if (err) return 0;
    				res.end(data[0].location.toString());
    				db.close();
    			});
    		});
    	}
    });
    
    // View my going
    app.post('/myGoing', function(req, res) {
    	if (req.isAuthenticated()) {
    		var str = '';
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('nightlife-search').count(function (e, count) {
    				var k = 0;
					if (count && count > 0) {
    					db.collection('nightlife-search').find().forEach(function(obj) {
    						if (obj.who == req.session.passport.user) str += obj.url + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + obj.name + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU';
    						k++;
    						if (k == count) res.end(str);
						});
    				}
					else res.end('');
					db.close();
    			});
    		});
    	}
    });
    
    // Search GOING
    app.post('/going', function(req, res) {
    	var str = '';
		MongoClient.connect(urli, function(err, db) {
			if (err) return 0;
    		else db.collection('nightlife-search').count(function (e, count) {
    			var k = 0;
    			db.collection('nightlife-search').find().forEach(function(obj) {
    				if (err) return 0;
    				else if (obj.url) str += obj.url + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + obj.num + ' GOING' + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU';
    				k++;
    				if (k == count) {
						res.end(str);
						db.close();
					}
    			});
    		});
		});
    });
};