$(document).ready(function() {

  $('#search-form').on('submit', function() {
    var characterName = $('#character-name');
    var serverName = $('#server-name');

    var searchInfo = {
      "name": characterName.val(),
      "server": serverName.val(),
      "characterUrl": "/us/" + this.name + '/' + this.server
    };

    window.location.href = searchInfo.characterUrl;
    
    return false;
  });

});
