$(document).ready(function() {

  $('search-form').on('submit', function() {
    var characterName = $('character-name');
    var serverName = $('server-name');

    var searchInfo = {
      "name": characterName.value(),
      "server": serverName.value(),
      "characterUrl": "../us/" + this.name + '/' + this.server
    };

    $.ajax({
      type: 'POST',
      url: searchInfo.characterUrl,
      success: function(searchInfo){
        window.location.href = searchInfo.characterUrl;
      }
    });
  });

});
