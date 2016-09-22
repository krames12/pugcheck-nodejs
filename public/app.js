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
  if($('.raid-bosses').hasClass('hidden')) {
    $('.raid-bosses').removeClass('hidden').addClass('visible');
    $('.collapse').removeClass('icon-plus').addClass('icon-minus');
  } else {
    $('.raid-bosses').removeClass('visible').addClass('hidden');
    $('.collapse').removeClass('icon-minus').addClass('icon-plus');
  }
}
