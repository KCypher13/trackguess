$(function(){

// PLAYER AUDIO
var music = document.getElementById('music'); // id for audio element
var duration; // Duration of audio clip
var countDown;
var curseur = document.getElementById('curseur'); // curseur

var timeline = document.getElementById('timeline'); // timeline
// timeline width adjusted for curseur
var timelineWidth = timeline.offsetWidth - curseur.offsetWidth;

// timeupdate event listener
music.addEventListener("timeupdate", timeUpdate, false);

// returns click as decimal (.77) of the total timelineWidth
function clickPercent(e) {
    return (e.pageX - timeline.offsetLeft) / timelineWidth;
}

function timeUpdate() {
    countDown = Math.floor(duration - music.currentTime);

    var playPercent = timelineWidth * (music.currentTime / duration);

    curseur.style.marginLeft = playPercent + "px";

    $('.timer').html(countDown);

	if(countDown == 0) {
		$('#game #temps1').fadeOut(200);
		setTimeout(function(){
			$('#game #temps2').fadeIn(200);
		},200);
	}

}


music.addEventListener("canplaythrough", function () {
    duration = music.duration;  
}, false);
// End Player audio


$('#game li').click(function(){
    $(this).toggleClass('selected');
});

});