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
    toggleBossList();
  });

});

function toggleBossList() {
  if($('.raid-bosses').hasClass('hidden')) {
    $('.raid-bosses').removeClass('hidden').addClass('visible');
    $('.collapse').removeClass('fa-plus').addClass('fa-minus');
  } else {
    $('.raid-bosses').removeClass('visible').addClass('hidden');
    $('.collapse').removeClass('fa-minus').addClass('fa-plus');
  }
}
