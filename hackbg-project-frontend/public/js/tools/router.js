var Router = (function(){

	// url, callback, default
	var routes = [];

	var addRoute = function(route){
		routes.push(route);
		return this;
	}

	var init = function(){
		$(window).on("hashchange",function(){
			 url = location.hash.slice(1) || '/';
			 routes.forEach(function(route){
			 	if(route.url == url){
			 		route.callback();
			 	}
			 })
		});

		// trigger default route's callback
		routes.forEach(function(route){
			if(route.url === window.location.pathname && 
					route.default === true){
				route.callback();
			}
		})
	}

	return {
		addRoute: addRoute,
		init: init
	}

}());