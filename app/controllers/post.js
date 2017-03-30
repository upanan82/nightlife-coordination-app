'use strict';

$(document).ready(function() {
    nameFunc();
    if (window.location.pathname == '/') auto();
    if (window.location.pathname == '/my') myGoing();
    $(".list").on("click", "a.but", function() {
        var th = this,
            data = {};
        if (window.location.pathname == '/my') data = {
            url : $(this).prev('.tit').attr('href')
        };
        else data = {
            url : $(this).prev('.tit').attr('href'),
            name : $(this).prev('.tit').text()
        };
        $(this).html('Wait ...');
        $.ajax({
            type: 'POST',
            url: '/iamgo',
            data: JSON.stringify(data),
		    contentType: 'application/json',
            success: function(data) {
                if (data == 'error') alert('First, login!');
                else if (window.location.pathname == '/my') $(th).parent().remove();
                else $(th).html(data);
                if ($('.list').html() == '') $('.list').html('You will not go anywhere!');
            }
        });
    });
});

// View user name
function nameFunc() {
    $.ajax({
        type: 'POST',
        url: '/nameD',						
        success: function(data) {
            $('#display-name').html(data);
        }
    });
}

// View search results
function search() {
    $('.list').html('Loading ...');
    var data = {loc : $('#searchP').val()};
    $.ajax({
        type: 'POST',
        url: '/search',
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            if (data == "error") {
                $('.list').html('Did not find anything!');
                return false;
            }
            var arr = data.split('9B_mn2WZfTIYyUZeSvkZ_5IXBKU'),
                str = '';
            for (var i = 0; i < arr.length - 1; i = i + 4)
                str += '<li><table><tr><td><img class="img" src="' + arr[i + 3] + '"></td><td><a class="tit" target="_blank" href="' + arr[i] + '"><p class="title">' + arr[i + 1] + '</p></a><a class="but">0 GOING</a><br><br><p class="text">"' + arr[i + 2] + '"</p></td></tr></table></li>';
            $('.list').html(str);
            $.ajax({
                type: 'POST',
                url: '/going',
                success: function(data) {
                    var arr = data.split('9B_mn2WZfTIYyUZeSvkZ_5IXBKU');
                    for (var i = 0; i < arr.length - 1; i = i + 2)
                        $("a[href='" + arr[i] + "']").next(".but").html(arr[i + 1]);
                }
            });
        }
    });
}

// Auto authenticated search
function auto() {
    $.ajax({
        type: 'POST',
        url: '/auto',						
        success: function(data) {
            $('#searchP').val(data);
            search();
        }
    });
}

// View my going
function myGoing() {
    $.ajax({
        type: 'POST',
        url: '/myGoing',						
        success: function(data) {
            if (!data) $('.list').html('You will not go anywhere!');
            else {
                var arr = data.split('9B_mn2WZfTIYyUZeSvkZ_5IXBKU'),
                    str = '';
                for (var i = 0; i < arr.length - 1; i = i + 2)
                    str += '<li class="liMy"><a class="tit title tt" target="_blank" href="' + arr[i] + '">' + arr[i + 1] + '</a><a class="but ta">Remove</a></li>';
                $('.list').html(str);
            }
        }
    });
}