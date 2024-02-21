/*

=== VidKazm | ===

Author: Umair Akram <contactumairakram@gmail.com>
Start Date: April 6 2014
Version: 0.1

=== Description ===

This program will apply user templates to create uniform header documentation 
for each source file specified.
It uses the file extension to map to a given template file, 
so it can support any language.


*/


(function($) {

    var mainVideo = null;
    var playerControls = null; 
    var mainAudio = null;
    var classOptions = null;

    $.fn.vidkazm = function(options = {}) {



        if($('.mainwrapper.vidkazm-wrapper').length > 0) {

            return false;

        }



        // setting up defaults 

        var internalOptions = {
                controls:true,
                allowFullScreen:true,
                audioElement:null,
                playIcon:'./play-button.svg',
                pauseIcon:'./pause.svg',
                volumeIcon:'./volume-btn.svg',
                fullscreenIcon:'./full-screen.svg',
                onPause: null,
                onPlay:null


            , ...options};


        classOptions = internalOptions;

        mainVideo = this;
        
        mainAudio = internalOptions.audioElement;

        var videoElement = this;
        
        var videoParent = videoElement.parent();

        var wrapperElement = $('<div class="mainwrapper vidkazm-wrapper"></div>');

        var controlsHtml = `
            
        <div class="playPauseBtn control"><span class="playPauseIcon playing"><img class="playbtn" src="${internalOptions.playIcon}" /><img class="pausebtn" src="${internalOptions.pauseIcon}" /></span></div>

        <div class="volumeBtn control">
            <span class="volumeIcon">
                <img class="volume" src="${internalOptions.volumeIcon}" />
                <img class="mute" src="${internalOptions.muteIcon}" />
            </span>
            <div class="volumeSeek">
                <input id="volumeController" type="range" min="0" max="100" value="50" step=".1" />
            </div>

        </div>

        <div class="full-screen-control">
            <img src="${internalOptions.fullscreenIcon}" />
        </div>
            
        `;


        

        var controlsBar = $(`<div class="mainControlBar">${controlsHtml}</div>`)
        

        playerControls = controlsBar;

        $(videoElement).detach().appendTo(wrapperElement);        
            
            // add controls

        wrapperElement.append(controlsBar);



        videoParent.append(wrapperElement);



        

        attachEventListeners();

      
        
        return this;
       


    }


    var attachEventListeners = function() {



        $('#volumeController').change(function () {

            var controllerVal = $('#volumeController').val();

            console.log(controllerVal);
            mainAudio[0].volume = (controllerVal / 100).toFixed(2);
            // newvolume = $('#volume').val();
            if(mainAudio[0].paused) {
                mainAudio[0].play();
            }

            // $("video")[0].volume = newvolume / 100;
            // $('#currentvolume').text(newvolume)
        });


        mainAudio.on('volumechange',function(){
            
            $('#volumeController').val(mainAudio[0].volume * 100);

            if( mainAudio[0].volume == 0) {
                if(!$('.volumeIcon').hasClass('ismute')) {
                    $('.volumeIcon').addClass('ismute');
                }
            } else {
                $('.volumeIcon').removeClass('ismute');
            }
            // console.log(mainAudio[0].volume);

        
        });


        $('.volumeBtn .volume').click(function() {

            mainAudio[0].volume = 0;

        });

        $('.volumeBtn .mute').click(function() {

            mainAudio[0].volume = 0.3;

        });


        $('.full-screen-control').click(() => {
            
            makeFullScreen(mainVideo[0]);
        });

        console.log(classOptions);
        if(classOptions.onPlay) {
            playerControls.find('.playPauseIcon .playbtn').click(() => {
                
                classOptions.onPlay();
                playerControls.find('.playPauseIcon').removeClass('paused').addClass('playing');
                
            })
        } else {
            
            playerControls.find('.playPauseIcon .playbtn').click(() => {
         
                mainVideo[0].play();
    
            })
        }
        

        if(classOptions.onPause) {
            playerControls.find('.playPauseIcon .pausebtn').click(() => {
                classOptions.onPause();
                playerControls.find('.playPauseIcon').removeClass('playing').addClass('paused');
            });
        } else {
            
            playerControls.find('.playPauseIcon .pausebtn').click(() => {

                mainVideo[0].pause();

            })

        }




       mainVideo.on('play',() => {
          
            if(mainVideo[0].paused) {

                playerControls.find('.playPauseIcon').removeClass('playing').addClass('paused');

 
            } else {
                playerControls.find('.playPauseIcon').removeClass('paused').addClass('playing');
            }
       })

       mainVideo.on('pause',() => {
        
         if(mainVideo[0].paused) {

             playerControls.find('.playPauseIcon').removeClass('playing').addClass('paused');


         } else {
             playerControls.find('.playPauseIcon').removeClass('paused').addClass('playing');
         }
        })



       mainVideo.on('ended',() => {
           
            if(mainVideo[0].paused) {

                playerControls.find('.playPauseIcon').removeClass('playing').addClass('paused');


            } else {
                playerControls.find('.playPauseIcon').removeClass('paused').addClass('playing');
            }         
    
        });


        

    }

    var playPauseVideo = function(videoElement) {

        mainVideo.paused ? mainVideo.play() : mainVideo.pause();

        return true;


    }

    var makeFullScreen = function(elem) {

        

        if (elem.requestFullscreen) {
        elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { 
        elem.msRequestFullscreen();
        }

    }

   




}(jQuery));
