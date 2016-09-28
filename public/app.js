$(document).ready(function() {

  $('#search-form').on('submit', function() {
    var characterName = $('#character-name').val();
    var serverName = $('#server-name').val();
    var region = $('#region-name').val();

    var characterUrl = "/" + region + "/" + serverName + '/' + characterName;

    window.location.href = characterUrl;

    return false;
  });

  $('.raid-instance').on('click', function() {
    toggleBossList();
  });
});

function toggleBossList() {
  $('.raid-bosses').toggleClass('hidden');
 if($('.collapse').hasClass('fa-plus')) {
    $('.collapse').removeClass('fa-plus').addClass('fa-minus');
  } else {
   $('.collapse').removeClass('fa-minus').addClass('fa-plus');
  }
}
