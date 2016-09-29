$(document).ready(function() {

  $('#search-form').on('submit', function() {
    var characterName = $('#character-name').val();
    var serverName = $('#server-name').val();
    var region = $('#region-name').val();

    var characterUrl = "/" + region + "/" + serverName + '/' + characterName;

    window.location.href = characterUrl;

    return false;
  });

  $('.raid-instance-title').on('click', function() {
    var current = $(this);
    toggleBossList(current);
  });
});

function toggleBossList(current) {
  current.parent('.raid-instance').find('.raid-bosses').toggleClass('hidden');
 if(current.find('.collapse').hasClass('fa-plus')) {
    current.find('.collapse').removeClass('fa-plus').addClass('fa-minus');
  } else {
   current.find('.collapse').removeClass('fa-minus').addClass('fa-plus');
  }
}
