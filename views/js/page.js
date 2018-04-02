// Custom scripts for the website

$(function () {
  $('#fetchData').on('submit', function (e) {
    e.preventDefault();
	  // var formID = $(this).parents("form").attr("name");
    // var form = $(this).closest('form');
	// Disable the button for the duration of data fetching.
    $('#fetchDataSubmit').prop("disabled", true);
    $('#fetchDataSubmit').val('Please wait');

	// Ajax post call to make server side fetch the tweet data for current user.
    $.ajax({
      type: 'POST',
      url: 'http://localhost:5000/dashboard',
      data: {form: 'fetchData'},
      dataType: 'json',
      success: function (data) {
		// Make submit button pressable and change the text back.
        $('#fetchDataSubmit').prop("disabled", false);
        $('#fetchDataSubmit').val('Update/Fetch twitter data');

		// Remove focus on the submit button.
        $('#fetchDataSubmit').trigger('blur');
      },
      error: function(jqXHR, textStatus, err) {
      // Perhaps send error message from server side and load it into the warning box.
      alert('text status '+textStatus+', err '+err)
      }
    });
  });
  /*
  $('#generatePost').on('submit', function(e) {
    e.preventDefault();

    $('#generatePostSubmit').prop('disabled', true);
    $('#generatePostSubmit').val('Please wait');

    $.ajax({
      type: 'POST',
      url: 'http://localhost:5000/dashboard',
      data: {form: 'generatePost'}
    })

  })
  */


});
