
var rtc = {
    client: null,
    joined: false,
    published: false,
    localStream: null,
    remoteStreams: [],
    params: {}
  }


  var globalStream = null;


  // Handle Events Start

  function handleEvents (rtc) {
    // Occurs when an error message is reported and requires error handling.
    rtc.client.on("error", (err) => {
      console.log(err)
    })
    // Occurs when the peer user leaves the channel; for example, the peer user calls Client.leave.
    rtc.client.on("peer-leave", function (evt) {
      var id = evt.uid;
      console.log("id", evt)
      let streams = rtc.remoteStreams.filter(e => id !== e.getId())
      let peerStream = rtc.remoteStreams.find(e => id === e.getId())
      if(peerStream && peerStream.isPlaying()) {
        peerStream.stop()
      }
      rtc.remoteStreams = streams
      if (id !== rtc.params.uid) {
        removeView(id)
      }
      // Toast.notice("peer leave")
      console.log("peer-leave", id)
    })
    // Occurs when the local stream is published.
    rtc.client.on("stream-published", function (evt) {
      // Toast.notice("stream published success")
      console.log("stream-published")
    })
    // Occurs when the remote stream is added.
    rtc.client.on("stream-added", function (evt) {  
      var remoteStream = evt.stream
      var id = remoteStream.getId()
      // Toast.info("stream-added uid: " + id)
      if (id !== rtc.params.uid) {
        rtc.client.subscribe(remoteStream, function (err) {
          console.log("stream subscribe failed", err)
        })
      }
      console.log("stream-added remote-uid: ", id)
    })
    // Occurs when a user subscribes to a remote stream.
    rtc.client.on("stream-subscribed", function (evt) {
      var remoteStream = evt.stream
      var id = remoteStream.getId()
      rtc.remoteStreams.push(remoteStream)
      // addView(id)
      // remoteStream.play("remote_video_" + id)
      remoteStream.play("local_stream");

      console.log('initialize',$('video'));
      setTimeout(function(){initializePlayerControls();},2000);
      // $('#local_stream').remove();
      
      // Toast.info("stream-subscribed remote-uid: " + id)
      console.log("stream-subscribed remote-uid: ", id)
    })
    // Occurs when the remote stream is removed; for example, a peer user calls Client.unpublish.
    rtc.client.on("stream-removed", function (evt) {
      var remoteStream = evt.stream
      var id = remoteStream.getId()
      // Toast.info("stream-removed uid: " + id)
      if(remoteStream.isPlaying()) {
        remoteStream.stop()
      }
      rtc.remoteStreams = rtc.remoteStreams.filter(function (stream) {
        return stream.getId() !== id
      })
      removeView(id)
      console.log("stream-removed remote-uid: ", id)
    })
    rtc.client.on("onTokenPrivilegeWillExpire", function(){
      // After requesting a new token
      // rtc.client.renewToken(token);
      // Toast.info("onTokenPrivilegeWillExpire")
      console.log("onTokenPrivilegeWillExpire")
    })
    rtc.client.on("onTokenPrivilegeDidExpire", function(){
      // After requesting a new token
      // client.renewToken(token);
      // Toast.info("onTokenPrivilegeDidExpire")
      console.log("onTokenPrivilegeDidExpire")
    })
  }

  // Handle Events END

function joinStream (rtc, option, user_role = 'audience') {
    if (rtc.joined) {
    //  Toast.error("Your already joined")
        console.error('You already Joined the Stream');
        return;
    }

    /**
     * A class defining the properties of the config parameter in the createClient method.
     * Note:
     *    Ensure that you do not leave mode and codec as empty.
     *    Ensure that you set these properties before calling Client.join.
     *  You could find more detail here. https://docs.agora.io/en/Video/API%20Reference/web/interfaces/agorartc.clientconfig.html
    **/
    rtc.client = AgoraRTC.createClient({mode: option.mode, codec: option.codec})

    rtc.params = option

    // handle AgoraRTC client event
    handleEvents(rtc)

    // init client
    rtc.client.init(option.appID, function () {
      console.log("init success")

      /**
       * Joins an AgoraRTC Channel
       * This method joins an AgoraRTC channel.
       * Parameters
       * tokenOrKey: string | null
       *    Low security requirements: Pass null as the parameter value.
       *    High security requirements: Pass the string of the Token or Channel Key as the parameter value. See Use Security Keys for details.
       *  channel: string
       *    A string that provides a unique channel name for the Agora session. The length must be within 64 bytes. Supported character scopes:
       *    26 lowercase English letters a-z
       *    26 uppercase English letters A-Z
       *    10 numbers 0-9
       *    Space
       *    "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", "{", "}", "|", "~", ","
       *  uid: number | null
       *    The user ID, an integer. Ensure this ID is unique. If you set the uid to null, the server assigns one and returns it in the onSuccess callback.
       *   Note:
       *      All users in the same channel should have the same type (number or string) of uid.
       *      If you use a number as the user ID, it should be a 32-bit unsigned integer with a value ranging from 0 to (232-1).
      **/
      rtc.client.join(option.token ? option.token : null, option.channel, option.uid ? +option.uid : null, function (uid) {
        
        if(user_role == 'host') {

          console.warn("join channel: " + option.channel + " success, uid: " + uid)
          console.log("join channel: " + option.channel + " success, uid: " + uid)
          rtc.joined = true

          rtc.params.uid = uid
          console.log('CLIENT UID,',uid);

          console.log(option.microphoneId)

          // create local stream
          rtc.localStream = AgoraRTC.createStream({
            streamID: rtc.params.uid,
            audio: true,
            video: true,
            screen: false,
            microphoneId: option.microphoneId,
            cameraId: option.cameraId
          })

          globalStream = rtc.localStream;

          console.log('Global Stream', globalStream);

          // initialize local stream. Callback function executed after intitialization is done
          rtc.localStream.init(function () {
            console.log("init local stream success")
            // play stream with html element id "local_stream"
            rtc.localStream.play("local_stream")

            // publish local stream
            
              publish(rtc)  
            
            
          }, function (err)  {
          //   Toast.error("stream init failed, please open console see more detail")
            console.error("init local stream failed ", err)
          })
        
        }
        // Only if Host end
      }, function(err) {
        // Toast.error("client join failed, please open console see more detail")
        console.error("client join failed", err)
      })
    }, (err) => {
    //   Toast.error("client init failed, please open console see more detail")
      console.error(err)
    })
  }





  // stop streaming 

  function leaveStream() {

    return new Promise((res,rej) => {

      var focusStream = globalStream ? globalStream : rtc.remoteStreams[0];
      
      if(focusStream.isPlaying) {

        focusStream.close();

        res({success:true});

      } else {

        rej({success:false,message:'stream is already stopped'})
      }



    })

  }


  // if(globalStream.isPlaying) {

  //   globalStream.close();

  //   res({success:true});

  // } else {

  //   rej({success:false,message:'stream is already stopped'})
  // }


  function switchAudio(rtc,state) {

    return new Promise((resolve, reject) => {
      switch(state) {

        case 'off':
          globalStream.muteAudio();
          resolve({success:true, message:'Stream Audio turned off successfully.'})
          break;
        case 'on':
            globalStream.unmuteAudio();
            resolve({success:true, message:'Stream Audio turned on successfully.'})
            break;
        default:
          reject({success:false,message: 'No switch state defined.' }); 
          break;   
      } 

    })

  }



  function switchVideo(rtc,state){
  
    return new Promise((resolve, reject) => {
      switch(state) {

        case 'off':
          globalStream.muteVideo();
          resolve({success:true, message:'Stream video turned off successfully.'})
          break;
        
        case 'on':
            globalStream.unmuteVideo();
            resolve({success:true, message:'Stream video turned on successfully.'})
            break;
        
        default:

          reject({success:false,message: 'No switch state defined.' });  
          break;     
      }

    })

  }






//   Function to get Audio Video devices

function getDevices (next) {
    AgoraRTC.getDevices(function (items) {
      items.filter(function (item) {
        return ["audioinput", "videoinput"].indexOf(item.kind) !== -1
      })
      .map(function (item) {
        return {
        name: item.label,
        value: item.deviceId,
        kind: item.kind,
        }
      })
      var videos = []
      var audios = []
      for (var i = 0; i < items.length; i++) {
        var item = items[i]
        if ("videoinput" == item.kind) {
          var name = item.label
          var value = item.deviceId
          if (!name) {
            name = "camera-" + videos.length
          }
          videos.push({
            name: name,
            value: value,
            kind: item.kind
          })
        }
        if ("audioinput" == item.kind) {
          var name = item.label
          var value = item.deviceId
          if (!name) {
            name = "microphone-" + audios.length
          }
          audios.push({
            name: name,
            value: value,
            kind: item.kind
          })
        }
      }
      next({videos: videos, audios: audios})
    })
  }



//   Function to Validate Daat


function validator(formData, fields) {
    var keys = Object.keys(formData)
    for (let key of keys) {
      if (fields.indexOf(key) != -1) {
        if (!formData[key]) {
        //   Toast.error("Please Enter " + key)
          console.err("PLease Enter: " + key);
          return false
        }
      }
    }
    return true
  }




$(function() {

    var resolutions = [
        {
          name: "default",
          value: "default",
        },
        {
          name: "480p",
          value: "480p",
        },
        {
          name: "720p",
          value: "720p",
        },
        {
          name: "1080p",
          value: "1080p"
        }
      ]

    getDevices(function (devices) {
        devices.audios.forEach(function (audio) {
          $("<option/>", {
            value: audio.value,
            text: audio.name,
          }).appendTo("#microphoneId")
        })
        devices.videos.forEach(function (video) {
          $("<option/>", {
            value: video.value,
            text: video.name,
          }).appendTo("#cameraId")
        })
        // To populate UI with different camera resolutions
        resolutions.forEach(function (resolution) {
          $("<option/>", {
            value: resolution.value,
            text: resolution.name
          }).appendTo("#cameraResolution")
        })
        // M.AutoInit()
      })

      var fields = ["appID", "channel"]


    // alert('ready');


    // serializeformData();

});


$(document).ready(function() {
 
    var resolutions = [
        {
          name: "default",
          value: "default",
        },
        {
          name: "480p",
          value: "480p",
        },
        {
          name: "720p",
          value: "720p",
        },
        {
          name: "1080p",
          value: "1080p"
        }
      ]

    getDevices(function (devices) {
        devices.audios.forEach(function (audio) {
          $("<option/>", {
            value: audio.value,
            text: audio.name,
          }).appendTo("#microphoneId")
        })
        devices.videos.forEach(function (video) {
          $("<option/>", {
            value: video.value,
            text: video.name,
          }).appendTo("#cameraId")
        })
        // To populate UI with different camera resolutions
        resolutions.forEach(function (resolution) {
          $("<option/>", {
            value: resolution.value,
            text: resolution.name
          }).appendTo("#cameraResolution")
        })
        // M.AutoInit()
      })

});

// Serialize form daata

function serializeformData(defaultInfo = {}) {
    var obj = {
        appID: '',
        channel:"",
        token:"",
        codec:'h264',
        mode:'live'
    };

  //   var obj = {
  //     appID: 'a770cdc87180448ab132646cc73d4b5d',
  //     channel:"hksstream",
  //     token:"006a770cdc87180448ab132646cc73d4b5dIABKjyw6yb8MZ5C5B016B2ze5ulLdRIIf7v2rmhu6s2qLvZemBAAAAAAEADnMOtSXNubXwEAAQBc25tf",
  //     codec:'h264',
  //     mode:'live'
  // };

    obj.microphoneId = $('#microphoneId').value;
    obj.cameraId = $('#cameraId').value;
    obj.cameraResolution = $('#cameraResolution').value;

    
    var finalObj = {...obj,...defaultInfo};



    return finalObj;
  }






  function publish (rtc) {
    if (!rtc.client) {
       console.error("Please Join Room First")
      return
    }
    if (rtc.published) {
      console.error("Your already published")
      return
    }
    var oldState = rtc.published

    // publish localStream
    rtc.client.publish(rtc.localStream, function (err) {
      if(err) console.log('Error Publishing event.');
      rtc.published = oldState
      // console.log("publish failed")
    //   Toast.error("publish failed")
      // console.error(err)


    })

    
    // console.error("publish")
    rtc.published = true
  }




  
  function addView (id, show) {
    if (!$("#" + id)[0]) {
      $("<div/>", {
        id: "remote_video_panel_" + id,
        class: "video-view",
      }).appendTo("#video")

      $("<div/>", {
        id: "remote_video_" + id,
        class: "video-placeholder",
      }).appendTo("#remote_video_panel_" + id)

      $("<div/>", {
        id: "remote_video_info_" + id,
        class: "video-profile " + (show ? "" :  "hide"),
      }).appendTo("#remote_video_panel_" + id)

      $("<div/>", {
        id: "video_autoplay_"+ id,
        class: "autoplay-fallback hide",
      }).appendTo("#remote_video_panel_" + id)
    }
  }
  function removeView (id) {
    if ($("#remote_video_panel_" + id)[0]) {
      $("#remote_video_panel_"+id).remove()
    }
  }



  function startScreenSharing() {
    
    // current video streams
    var videoStreams = globalStream.getVideoTrack();

    // get screen sharing access and then replace it

    // if(videoStreams) {

    //   globalStream.replace

    // }

    
    let captureStream = null;
    
    navigator.mediaDevices.getDisplayMedia({})

    .then(function (stream){
      
      globalStream.replaceTrack(stream.getVideoTracks()[0]);

    })
    .catch(err => { console.error("Error:" + err); return null; });
  

    
  }


  function switchBackToCamera() {

    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      console.log("Let's get this party started")

      navigator.mediaDevices.getUserMedia({video: true})

      .then(stream => {

        console.log(stream);

        globalStream.replaceTrack(stream.getVideoTracks()[0]);
      })
      .catch(err => {

        console.log('Cant Switch back to camera due to Camera permissions not allowed.',err);

      })



    }


  }



// Function to make Element Full screen
function openFullscreen(elem) {
  console.log(elem);
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Safari */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
  }



  function initializePlayerControls() {

    $('video').vidkazm({
      audioElement:$('audio'),
      volumeIcon:'//dd7tel2830j4w.cloudfront.net/f1611185157126x648352806269434400/volume-btn.svg',
      playIcon:'//dd7tel2830j4w.cloudfront.net/f1611185085769x236677834350190530/play-button.svg',
      pauseIcon:'//dd7tel2830j4w.cloudfront.net/f1611185119041x403873349969726660/pause.svg',
      fullscreenIcon:'//dd7tel2830j4w.cloudfront.net/f1611221490859x845894548337136900/full-screen.svg',
      muteIcon: '//dd7tel2830j4w.cloudfront.net/f1611221480119x406208504258812160/mute.svg',

      onPlay: function(){
          $('video').css('visibility','visible');
          $('audio')[0].volume = 0.5;
      },
      onPause:function() {
          $('video').css('visibility','hidden');
          $('audio')[0].volume = 0;
      }
  })


  }