$(document).ready(function() {
	load_tracks({});

	$("#track_add_button").click(function(ev) {
		$.get("/genres/", {})
		.done(function(data){
			$("#genre_create_selection").empty();
			add_create_select();
			if (data['success'] == 1){
				$.each(data['genres'], function(index, element){
					template = create_genre_select_entry(element);
					$("#genre_select").append(template);
				});
				$("#genre_select").multiselect();
			}
		});
		$("#track_form").find("input[name=name]").val('');
		rating_template = '<input type="number" class="detail_rating" name="rating" value="0" />';
		$("#track_create_rating").html(rating_template);
		$("#track_create_rating").find(".detail_rating").each(function(){
			$(this).rating();
		});
		$("#track_add").modal();
	});

	// $("#genre_select").multiselect();

	$("#save_track_button").click(function(ev) {
		var data = {};
		data['name'] = $("#track_form").find('input[name="name"]').val();
		data['rating'] = $("#track_form").find('input[name="rating"]').val();
		data['genre'] = $("#genre_select").val();
		if (!data['genre']){
			data['genre'] = [];
		}
		form_data = JSON.stringify(data);
		$.ajax({
			type: 'POST',
			url: '/tracks/',
			data: form_data,
			success: function(success_data) {
				if (success_data['success'] == 1) {
					$("#track_add").modal("hide");
					load_tracks({});
				} else {
					console.log(success_data);
				}
			},
			dataType: 'json',
			contentType: 'application/json'
		});
	});

	$("#save_genre_button").click(function(ev) {
		var data = {};
		data['name'] = $("#genre_form").find('input[name="name"]').val();
		form_data = JSON.stringify(data);
		$.ajax({
			type: 'POST',
			url: '/genres/',
			data: form_data,
			success: function(success_data) {
				if (success_data['success'] == 1) {
					$("#genre_add").modal("hide");
					load_genres();
				} else {
					console.log(success_data);
				}
			},
			dataType: 'json',
			contentType: 'application/json'
		});
	});

	$("#track_search").keydown(function(ev) {
		if (ev.keyCode == 13) {
			ev.preventDefault();
			data = {"keyword": $("#track_search").val()}
			load_tracks(data);
		}
	});

	$("#genre_add_button").click(function() {
		$("#genre_form").find('input[name="name"]').val('');
		$("#genre_add").modal();
	});
});

var load_tracks = function(key) {
	$.get("/tracks/", key)
	.done(function(data){
		$("#tracks").empty();
		if (data['success'] == 1){
			$.each(data['tracks'], function(index, element){
				template = create_track_entry(element);
				$("#tracks").append(template);
			});
			$(".ratings").each(function(){
				$(this).rating();
			});
			if (data['count'] <= 5) {
				$("#track_pagination").empty();
			}
			else if (!key.page) {
				create_pagination(key, data['count']);
			}
		}
	});
}

var create_pagination = function(key, count) {
	$("#track_pagination").empty();
	for (i = 1; i <= count/5+1; i++){
		if (key.keyword) {
			page_template = '<li><a href="#" onclick="load_page(event, '+i+", '"+key.keyword+"'"+');">'+i+'</a></li>';
		} else {
			page_template = '<li><a href="#" onclick="load_page(event, '+i+', null);">'+i+'</a></li>';
		}
		$("#track_pagination").append(page_template);
	}
}

var load_page = function(ev, page, keyword) {
	ev.preventDefault();
	data = {"page": page}
	if (keyword) {
		data["keyword"] = keyword;
	}
	load_tracks(data);
}

var load_genres = function() {
	$.get("/genres/", {})
	.done(function(data){
		$("#genres").empty();
		if (data['success'] == 1){
			$.each(data['genres'], function(index, element){
				template = create_genre_entry(element);
				$("#genres").append(template);
			});
		}
	});
}

var create_genre_select_entry = function(element) {
	return '<option value="'+element['id']+'">'+element['name']+'</option>'
}

var create_genre_selected_entry = function(element) {
	return '<option selected="selected" value="'+element['id']+'">'+element['name']+'</option>'
}

var create_track_entry = function(element) {
	return '<li class="list-group-item"><span><a class="track_name" href="#" onclick="get_track_detail(event, '+element['id']+');">'+element['name']+'</a>('+element['genre_label']+')'+'</span><input type="number" class="ratings" value='+element['rating']+' data-readonly /></li>'
}

var get_track_detail = function(ev, track) {
	ev.preventDefault();
	$(".component").hide();
	url = '/tracks/' + track + '/';
	$.get(url, {})
	.done(function(data){
		if (data['success'] == 1){
			$("#track_name").html(data['track']['name']);
			$("#track_genre").html(data['track']['genre_label']);
			rating_template = '<input type="number" class="detail_rating" name="rating" value="'+data['track']['rating']+'" data-readonly />'
			$("#track_rating").html(rating_template);
			$("#track_rating").find(".detail_rating").each(function(){
				$(this).rating();
			});
			$("#delete_track").attr("onclick", "delete_track("+data['track']['id']+");");
			$("#edit_track").attr("onclick", "load_track_edit_popup("+data['track']['id']+");");
			$("#track_detail").show();
		}
	});
}

var load_track_edit_popup = function(track){
	url = '/tracks/' + track + '/';
	$.get(url, {})
	.done(function(tracks){
		if (tracks['success'] == 1){
			$("#track_edit_form").find("input[name=name]").val(tracks['track']['name']);
			$("#update_track_button").attr("onclick", "update_track("+tracks['track']['id']+");")
			$.get("/genres/", {})
			.done(function(result){
				$("#genre_edit_selection").empty();
				add_select();
				if (result['success'] == 1){
					$.each(result['genres'], function(index, element){
						console.log(element['id']);
						console.log($.inArray(element['id'], tracks['track']['genre']));
						if ($.inArray(element['id'], tracks['track']['genre']) >= 0) {
							template = create_genre_selected_entry(element);
						} else {
							template = create_genre_select_entry(element);
						}
						console.log(template);
						$("#genre_edit_select").append(template);
					});
					$("#genre_edit_select").multiselect();
				}
			});
			rating_template = '<input type="number" class="detail_rating" name="rating" value="'+tracks['track']['rating']+'" />'
			$("#track_edit_rating").html(rating_template);
			$("#track_edit_rating").find(".detail_rating").each(function(){
				$(this).rating();
			});
			$("#track_edit_popup").modal();
		}
	});
}

var add_select = function() {
	template = '<select id="genre_edit_select" multiple="multiple" name="genre"></select>'
	$("#genre_edit_selection").html(template);
}

var add_create_select = function() {
	template = '<select id="genre_select" multiple="multiple" name="genre"></select>'
	$("#genre_create_selection").html(template);
}

var delete_track = function(track){
	$.ajax({
		url: "/tracks/"+track+"/",
		type: "DELETE",
		success: function(data) {
			if (data['success'] == 1){
				$("#tracks").empty();
				load_tracks({});
				$(".component").hide();
				$("#track").show();
			}
		}
	});
}

var update_track = function(track) {
	data = {};
	data['name'] = $("#track_edit_form").find('input[name="name"]').val();
	data['rating'] = $("#track_edit_form").find('input[name="rating"]').val();
	data['genre'] = $("#genre_edit_select").val();
	if (!data['genre']){
		data['genre'] = [];
	}
	form_data = JSON.stringify(data);
	$.ajax({
		url: "/tracks/"+track+"/",
		type: "PUT",
		data: form_data,
		success: function(success_data) {
			if (success_data['success'] == 1) {
				$("#track_name").html(success_data['track']['name']);
				$("#track_genre").html(success_data['track']['genre_label']);
				rating_template = '<input type="number" class="detail_rating" name="rating" value="'+success_data['track']['rating']+'" data-readonly />'
				$("#track_rating").html(rating_template);
				$("#track_rating").find(".detail_rating").each(function(){
					$(this).rating();
				});
				$("#track_edit_popup").modal("hide");
			} else {
				console.log(success_data);
			}
		},
		dataType: 'json',
		contentType: 'application/json'
	});
}

var get_genre_detail = function(ev, genre) {
	ev.preventDefault();
	$(".component").hide();
	url = '/genres/' + genre + '/';
	$.get(url, {})
	.done(function(data){
		if (data['success'] == 1){
			$("#genre_name").html(data['genre']['name']);
			$("#delete_genre").attr("onclick", "delete_genre("+data['genre']['id']+");");
			$("#edit_genre").attr("onclick", "load_genre_edit_popup("+data['genre']['id']+");");
			$("#genre_detail").show();
		}
	})
}

var load_genre_edit_popup = function(genre) {
	url = '/genres/' + genre + '/';
	$.get(url, {})
	.done(function(data){
		if (data['success'] == 1){
			$("#genre_edit_form").find("input[name=name]").val(data['genre']['name']);
			$("#update_genre_button").attr("onclick", "update_genre("+data['genre']['id']+");")
			$("#genre_edit_popup").modal();
		}
	});
}

var update_genre = function(genre) {
	data = {};
	data['name'] = $("#genre_edit_form").find('input[name="name"]').val();
	form_data = JSON.stringify(data);
	$.ajax({
		url: "/genres/"+genre+"/",
		type: "PUT",
		data: form_data,
		success: function(success_data) {
			if (success_data['success'] == 1) {
				$("#genre_name").html(success_data['genre']['name']);
				$("#genre_edit_popup").modal("hide");
			} else {
				console.log(success_data);
			}
		},
		dataType: 'json',
		contentType: 'application/json'
	});
}

var delete_genre = function(genre){
	$.ajax({
		url: "/genres/"+genre+"/",
		type: "DELETE",
		success: function(data) {
			if (data['success'] == 1){
				$("#genres").empty();
				load_genres({});
				$(".component").hide();
				$("#genre").show();
			}
		}
	});
}

var activate_genre = function(ev) {
	ev.preventDefault();
	$(".track").removeClass("active");
	$(".genre").addClass("active");
	// $("#tracks").empty();
	$("#genres").empty();
	$.get("/genres/", {})
	.done(function(data){
		if (data['success'] == 1){
			$.each(data['genres'], function(index, element){
				template = create_genre_entry(element);
				$("#genres").append(template);
			});
		}
		$(".component").hide();
		$("#genre").show();
	});
}

var create_genre_entry = function(element) {
	return '<li class="list-group-item"><a class="genre_name" href="#" onclick="get_genre_detail(event, '+element['id']+');">'+element["name"]+'</a></li>'
}

var activate_track = function(ev) {
	ev.preventDefault();
	$(".genre").removeClass("active");
	$(".track").addClass("active");
	$("#tracks").empty();
	load_tracks({});
	$(".component").hide();
	$("#track").show();
}