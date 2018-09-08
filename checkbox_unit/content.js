var add_checkbox = function(source){
	var time_position = source.getElementsByClassName("_5pcp _5lel _2jyu _232_");
	var checkbox_positive = document.createElement("input");
	checkbox_positive.type = "checkbox";
	checkbox_positive.name = "positive_box";
	
	var checkbox_negative = document.createElement("input");
	checkbox_negative.type = "checkbox";
	checkbox_negative.name = "negative_box";

	var label_positive = document.createElement("label");
	label_positive.appendChild(document.createTextNode("Is the article relevant?"));
	var label_negative = document.createElement("label");
	label_negative.appendChild(document.createTextNode("Is the article irrelevant?"));
	
	time_position[0].appendChild(checkbox_positive);
	time_position[0].appendChild(label_positive);
	time_position[0].appendChild(checkbox_negative);
	time_position[0].appendChild(label_negative);
	
	if (checkbox_positive.checked){
		
	}
	
	if (checkbox_negative.checked){
		
	}
}

var posts = new Set();
var find_post = function(){
	var new_posts = document.getElementsByClassName("_4-u2 mbm _4mrt _5jmm _5pat _5v3q _4-u8");
	for (var i=0; i<new_posts.length; i++){
		var a_post = new_posts[i];
		if (!posts.has(a_post)){
			posts.add(a_post);
			
			var mains = a_post.getElementsByClassName("_1dwg _1w_m _q7o");
			var post = mains[0];

			
			var shared = post.getElementsByClassName("mtm _5pcm");
			if (!shared.length==0){
				add_checkbox(shared[0]);
			}
			
			
			
			var multiple_shared = post.getElementsByClassName("_5ya");
						
			
			
			if (shared.length==0 && multiple_shared.length==0){
				add_checkbox(post);
			}
		}
	}
}

setInterval(find_post, 1000);