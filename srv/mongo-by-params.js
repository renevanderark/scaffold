var url = require("url");
var querystring = require("qs");
var ObjectID = require("mongodb").ObjectID;
var db;
var req;
var res;
var path;
var method;
var resource;
var action;
var params;
var format;
var verbose;

var routeRequest = function(dbSet, request, response, path, opts) {
	db = dbSet;
	req = request;
	res = response;
	path = path;
	method = request.method;
	resource = null;
	action = null;
	params = {};
	format = opts && opts["format"] ? opts["format"] : "json";
	verbose = opts && opts["verbose"] ? true : false;

	var parts = path.split("/");
	resource = parts[2];
	if(!resource || !resource.match(/^[a-zA-Z_][0-9a-zA-Z\._]*[0-9a-zA-Z]$/)) {
		failInvalidParams();
  } else {

		action = parts[3];

		if(method == "POST") {
			var dataChunks = '';
			req.addListener("data", function(chunk) {
				dataChunks += chunk;
			});
		} else {
			var rawparams = url.parse(req.url).query;
			params = querystring.parse(rawparams);
		}
	
		req.addListener("end", function() {
			if(method == "GET") {
				action = "find";
				find(); 
			} else {
				params = querystring.parse(dataChunks);
				if(action == "delete") {
					remove();
				} else if(action == "create") {
					create();
				} else {
					action = "upsert";
					upsert();
				}
			}
		});
	}
}

var queryMongo = function(args) {
	if(resource && args && args.action && args.params && args.params.length > 2) {
		var coll = db.collection(resource)
		if(args.params && args.params.length == 3)
			coll[args.action](args.params[0], args.params[1], args.params[2]);
		else if(args.params && args.params.length == 4)
			coll[args.action](args.params[0], args.params[1], args.params[2], args.params[3]);

		if(args.callback)
			args.callback();
	} else
		failInvalidParams();
}

var failInvalidParams = function() {
	failResponse(
		{success: false, reason: 'invalid parameters'},
		{message: 'invalid route'},
		400
	);
}

var create = function() {
	queryMongo({
		action: "save",
		params: [
			parseParams(params),
			{safe: true},
			function(err, docs) {
				if(err && err.message.indexOf('E11000 ') !== -1) failResponse({success: false, reason: "id exists"});
				if(err) failResponse({ success: false, reason: err.message}, err);
				endResponse({success: true, docs: docs}, true);
			}
		]
	});
}
	

var upsert = function() {
	if(params.upsert && params.set) {
		if(verbose) {
			console.log("QUERY: " + JSON.stringify(params.upsert));
			console.log("SET: " + JSON.stringify(params.set));
		}
		queryMongo({
			action: "update",
			params: [
				parseParams(params.upsert),
				{$set: parseParams(params.set)},
				{safe:true, upsert:true},
				function(err) {
					if(err) failResponse({ success: false, reason: err.message}, err);
				}
			],
			callback: function() { endResponse({success: true}, true); }
		});
	} else
		failInvalidParams();
}

var remove = function() {
	if(resource) {
		queryMongo({
			action: "remove",
			params: [parseParams(), {safe: true}, function(err) {
				if(err) failResponse({ success: false, reason: err.message}, err);
			}],
			callback: function() { endResponse({success:true}, true); }
		});
	} else
		failInvalidParams();
}
	
var find = function() {
	if(resource) {
		var searchParams = {};
		var fields = {};
		rawFields = params && params.fields ? params.fields : [];

		for(var i = 0; i < rawFields.length; ++i)
			fields[rawFields[i]] = true;

		for(key in params) {
			if(key != "fields") 
				searchParams[key] = parseParam(key, params[key]);
		}
		var coll = new db.collection(resource);
		jsonHeader(200);
		res.write("[");
		coll.find(searchParams, fields).forEach(function(err, doc) {
			if(doc) {
				writeResponse(doc, false, {postFix: ","});
			} else {
				endResponse(null, false, {postFix: "]"});
			}
		});
	} else
		failInvalidParams();
}

var parseParam = function(k,v) {
	if(typeof(v) == "object") {
		for(kk in v) {
			v[kk] = parseParam(kk, v[kk]);
		}
	} else if(k == "_id")
		return new ObjectID(v);
	else if(v == "true")
		return true;
	else if(v == "false")
		return false;
	else if(v == "null")
		return null;
	else if(v.match && v.match(/^\-?[0-9]+$/))
		return parseInt(v);
	else if(v.match && v.match(/^\-?[0-9]+\.[0-9]+$/))
		return parseFloat(v);
	// TODO: date parse

	return v;
}

var parseParams = function(localParams) {
	if(!localParams)
		localParams = params;
	for(k in localParams)
		localParams[k] = parseParam(k,localParams[k]);

	return localParams;
}
	
var jsonHeader = function(code) {
	res.writeHead(code, {'Content-Type': 'application/json'});
}
	
var failResponse = function(responseData, err, code) {
	if(format == "json") {
		jsonHeader(code ? code : 500);
		if(verbose) {
			console.warn("Mongo failure: " + err.message);
			console.warn("Collection: " + resource);
			console.warn("Parameters: " + JSON.stringify(params));
			console.warn("Action: " + action);
		}
		res.end(JSON.stringify(responseData));
	}
}
	
var endResponse = function(responseData, withHeader, opts) {
	var postFix = opts && opts["postFix"] ? opts["postFix"] : "";
	if(format == "json") {
		if(withHeader)
			jsonHeader(200);
		res.end(JSON.stringify(responseData) + postFix);
	}
}
	
var writeResponse = function(responseData, withHeader, opts) {
	var postFix = opts && opts["postFix"] ? opts["postFix"] : "";
	if(format == "json") {
		if(withHeader)
			jsonHeader(200); 
		res.write(JSON.stringify(responseData) + postFix);
	}
}
exports.routeRequest = routeRequest;
