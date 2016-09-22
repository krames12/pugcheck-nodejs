$(document).ready(function() {

  $('#search-form').on('submit', function() {
    var characterName = $('#character-name').val();
    var serverName = $('#server-name').val();
    var region = $('#region-name').val();

    var characterUrl = "/" + region + "/" + serverName + '/' + characterName;

    window.location.href = characterUrl;

    return false;
  });

  

});
