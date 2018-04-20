// Custom scripts for the website
$(function () {

  $('#fetchData').on('submit', function (e) {
    e.preventDefault();
	  // var formID = $(this).parents("form").attr("name");
    // var form = $(this).closest('form');
	// Disable the button for the duration of data fetching.
    $('#fetchDataSubmit').prop("disabled", true);
    $('#fetchDataSubmit').val('Please wait');
    $('#title').attr('placeholder', "");
    $('#author').attr('placeholder', "");
    $('#generatedPost').attr('placeholder', "");
    $('#articlepreview').attr('hidden', true);

	// Ajax post call to make server side fetch the tweet data for current user.
    $.ajax({
      type: 'POST',
      url: 'http://localhost:5000/dashboard',
      //url: 'https://ohsiha-webmc.herokuapp.com/dashboard',
      data: {form: 'fetchData'},
      dataType: 'json',
      success: function (data) {
		// Make submit button pressable and change the text back.
        $('#fetchDataSubmit').prop("disabled", false);
        $('#fetchDataSubmit').val('Update/Fetch twitter data');

		// Remove focus on the submit button.
        $('#fetchDataSubmit').trigger('blur');
        $('#generatePostSubmit').prop('disabled', false);
        $('#gAlertMessage').text('There is data to generate a post.');
        $('#gAlertMessage').removeClass('alert-danger');
        $('#gAlertMessage').addClass('alert-success');

        // Web storage usage:
        sessionStorage.setItem('generateWC', '1');

      },
      error: function(jqXHR, textStatus, err) {
      // Perhaps send error message from server side and load it into the warning box.
      alert('text status '+textStatus+', err '+err)
      sessionStorage.setItem('generateWC', '0');
      }
    });
  });

  $('#generatePost').on('submit', function(e) {
    e.preventDefault();

    $('#generatePostSubmit').prop('disabled', true);
    $('#generatePostSubmit').val('Please wait');

    $.ajax({
      type: 'POST',
      url: 'http://localhost:5000/dashboard',
      //url: 'https://ohsiha-webmc.herokuapp.com/dashboard',
      data: {form: 'generatePost'},
      dataType: 'json',
      success: function(data) {
        console.log("title: ", data.title);
        console.log(JSON.stringify(data));
        $('#gAlertMessage').text("There is data to generate a post.");
        $('#title').attr('value', data.title);
        $('#author').attr('value', data.author);
        $('#generatedPost').val(data.data);
        $('#articlepreview').removeAttr('hidden');
        $('#generatePostSubmit').val('Generate');
        $('#generatePostSubmit').prop('disabled', false);
        $('#generatePostSubmit').trigger('blur');


      },
      error: function(jqXHR, textStatus, errorThrown, data) {
        $('#gAlertMessage').empty();
        $('#gAlertMessage').removeAttr('hidden');
        if(jqXHR.responseText === undefined) {
          $('#gAlertMessage').text("Something went wrong.");
        } else {
          $('#gAlertMessage').text(jqXHR.responseText);
        }
        $('#generatePostSubmit').prop('disabled', false);
        $('#generatePostSubmit').trigger('blur');
        $('#generatePostSubmit').val('Generate');
        $('#gAlertMessage').removeClass('alert-success');
        $('#gAlertMessage').addClass('alert-danger');
      }
    });

  });
  $('#cancelBtn').on('click', function(e) {
    e.preventDefault();

    $('#title').attr('placeholder', "");
    $('#author').attr('placeholder', "");
    $('#generatedPost').attr('placeholder', "");
    $('#articlepreview').attr('hidden', true);

  });

  $('#dashboardTab a[href="#stats"]').on('shown.bs.tab', function (e) {

    // Generate new wordcloud because new data was fetched.
    $('#wcMessage').prop("hidden", true);
    $("#spinner1").show();
    $(this).tab('show');
    //console.log("Session storage fetched on " +sessionStorage.generateWC);
    //console.log(this);
    if(sessionStorage.generateWC === '1') {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/dashboard',
        //url: 'https://ohsiha-webmc.herokuapp.com/dashboard',
        data: {form: 'generateWordCloud'},
        dataType: 'json',
        success: function(data) {
          $('#wcMessage').prop("hidden", true);
          $('#spinner').hide();

          d3.select("svg").remove();
          drawWordCloud(data.wordData)
          sessionStorage.setItem('generateWC', '0');

        },
        error: function(jqXHR, textStatus, errorThrown, data) {
          console.log("error text", jqXHR.responseText);

          $('#wcMessage').empty();
          $('#wcMessage').removeAttr('hidden');
          $("#spinner").hide();
          $('#wcMessage').text(jqXHR.responseText);
        }
      });
    }
  });
});
