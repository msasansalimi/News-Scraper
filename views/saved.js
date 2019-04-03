$(document).ready(function() {
  $.getJSON("/savedarticles", function(data) {
    // For each one 
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#savedArt").append(
        "<p data-id='" +
          data[i]._id +
          "'>" +
          data[i].note.title +
          "<br />" +
          data[i].note.body +
          "<br />" +
          data[i].title +
          "<br />" +
          "www.nytimes.com" +
          data[i].link +
          "<br />" +
          "<button data-id='" +
          data[i]._id +
          "' id='deletenote'>Delete Note</button>" +
          "</p>"
      );
    }
  });
 // Triggering the delete button to delete the saved Article.
  $(document).on("click", "button", function() {
    alert("You are deleting");

    var thisId = $(this).attr("data-id");
    //console.log(thisId);
    $.ajax({
      type: "DELETE",
      url: "/savedarticles/" + thisId
    }).then(function() {
      location.reload();
    });
  });
});
