// Custom scripts for the website
$(function () {
  drawWordCloud(wordcloudData);

  
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

      },
      error: function(jqXHR, textStatus, err) {
      // Perhaps send error message from server side and load it into the warning box.
      alert('text status '+textStatus+', err '+err)
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
        //wordcloudData = data.wordcloudData;
        //console.log(wordcloudData);
        //drawWordCloud(wordcloudData);

      },
      error: function(jqXHR, textStatus, errorThrown, data) {
        console.log(errorThrown);
        console.log(jqXHR);
        console.log(textStatus);
        console.log(jqXHR.responseText);
        $('#gAlertMessage').empty();
        $('#gAlertMessage').removeAttr('hidden');
        $('#gAlertMessage').text(jqXHR.responseText);
      }
    })

  })
  $('#cancelBtn').on('click', function(e) {
    e.preventDefault();

    $('#title').attr('placeholder', "");
    $('#author').attr('placeholder', "");
    $('#generatedPost').attr('placeholder', "");
    $('#articlepreview').attr('hidden', true);

  })

});
