
var init = function() {
	$(".div-a").click(function() {
		$(this).toggleClass("gold");
	});

	$(".div-b").click(function() {
		$(this).toggleClass("silver");
	});

	var timer;
	$(".rac-box").click(function() {
		console.log("Box is clicked");
		var self = $(this);
		if ( timer === undefined ) {
			console.log("Timer START");
			timer = setInterval( moveBox, 10 );	
		}
		else {
			console.log("Timer STOP");
			clearInterval(timer);
			timer = undefined;
		}
		function moveBox() {
			//console.log("Timer tick");
			//self.text("fred");
			//self.toggleClass("silver");
			var p = self.offset();
			p.left += 1;
			self.offset(p);
		}
	});
}

$(document).ready(init);
