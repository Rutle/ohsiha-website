

$(function () {
  $('#fetchData').on('submit', function (e) {
    console.log("pressed submit");
    e.preventDefault();
    $('#fetchDataSubmit').prop("disabled", true);
    $('#fetchDataSubmit').val('Please wait');
    $.ajax({
      type: 'POST',
      url: 'http://localhost:5000/dashboard',
      data: {form: 'fetchData'},
      dataType: 'json',
      success: function (data) {
        $('#fetchDataSubmit').prop("disabled", false);
        $('#fetchDataSubmit').val('Update/Fetch twitter data');
        alert(JSON.stringify(data));
        $('#fetchDataSubmit').trigger('blur');
      },
      error: function(jqXHR, textStatus, err) {
      //show error message
      alert('text status '+textStatus+', err '+err)
      }
  });
  });

});

/*
$(document).ready(function() {
  $('#home').click(function (e) {
    e.stopPropagation();
    $('#projects').removeClass('active');
    $('#contact').removeClass('active');
    $(this).addClass('active');
  });
});
*/
/*
$(document).ready(function() {
  $('#navbar nav a').click(function (event) {
    $('#navbar nav a').removeClass('active');
    $(this).addClass('active');
    console.log($(this));

  });
});
*/
/*
$(document).ready(function() {
$("#navbar ul li a").click(function () {
    $("#navbar ul li a").removeClass("active");
    $(this).addClass("active");
	console.log(this)
  });
});
*/
/*
$(document).ready(function() {
$("#navbar a").click(function () {
    $("#navbar a").removeClass("active");
    $(this).addClass("active");
  });
});
*/
/*
$(function() {
  if (location.pathname.split("/")[1] === "") {
    $('#home').addClass('active');
  } else {
    $('#navbarheader a[href^="/' + location.pathname.split("/")[1] + '"]').addClass('active');
  }

});
*/
/*
$(document).ready(function() {
  $('#hiraganaBtn').click(function () {


  });
});
*/

/*
$(document).ready(function () {
        $('nav.nav > a').click(function (e) {
            //e.preventDefault();
            $('nav.nav > a').removeClass('active');
            $(this).addClass('active');
        });
    });
*/

/*
$(function() {
    if ((location.pathname.split("/")[1]) !== ""){

        $('nav a[href^="/' + location.pathname.split("/")[1] + '"]').addClass('active');
    } else {
		$('nav a[href^="/' + location.pathname.split("/")[1] + '"]').addClass('active');
	}
});
*/
/*
$('nav').on('click', 'a', function() {
    $('.nav-list li.active').removeClass('active');
    $(this).addClass('active');
});
*/
/*
$(document).ready(function() {
	// get current URL path and assign 'active' class
	var pathname = window.location.pathname;
	$('#navbar nav a[href="'+pathname+'"]').parent().addClass('active');
})

*/
