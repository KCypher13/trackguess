/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    token:"",
    accessToken:"",
    refreshToken:"",
    clientId: "9121d0695d984d7b9d86628d17a0c654",
    clientSecret: "7ad01f63c18a4fa9bb59b629a1bb95b0",
    round:0,
    result:0,
    number:0,
    newPlayer:[],
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        $('.addTrack').on('click', function(){
            app.addTrack(app.tracks[app.round-1].track.id);
        })
        document.addEventListener("pause", app.pauseApp, false);
        document.addEventListener("resume", app.resumeApp, false);
    },
    // Update DOM on a Received Event
    pauseApp: function() {
        if(app.music != undefined){
            app.music.volume = 0;
        }
    },
    resumeApp: function(){
        if(app.music != undefined){
            app.music.volume = 1;
        }
    },
    login: function() {
        var scope = encodeURIComponent('user-library-modify user-library-read');
        var uri = encodeURIComponent('trackguess://');

        window.location = "https://accounts.spotify.com/authorize/?client_id=9121d0695d984d7b9d86628d17a0c654&response_type=code&redirect_uri="+uri+"&scope="+scope;        
    },
    joinRoom: function(){
            app.reset();
            $('.players li img:not(".imgadmin")').attr('src', 'img/default.gif');
            $('.players li:not(.admin):not(.hide)').addClass('hide');
            if(app.room != undefined){
                app.socket.emit('leaveRoom',{});
            }
            app.room = $('input[name="room"]').val();
            app.socket.emit('join', {room:app.room});
    },
    grabTrack: function(url){
        $.ajax({
            url: url,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken
            },
        })
        .done(function(data) {
            app.socket.emit('track', data);
            if(data.next != null){
                app.grabTrack(data.next);
            }
        });
        
    },
    getUser: function(){
        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken
            },
        })
        .done(function(data) {
            app.socket.emit('initUser', data);
            app.username = data.id;
            if(data.images.length > 0){
                app.image = data.images[0].url;
            }
        });
    },
    launchGame: function(){
        app.socket.emit('launchgame', {});
    },
    nextRound: function(){
       
        $('#music').empty();
        
        app.music = document.getElementById('music'+app.round);

        app.music.load();
        app.music.addEventListener("timeupdate", app.timeUpdate, false);

        app.music.addEventListener("canplaythrough", function () {
            app.duration = app.music.duration;  
        }, false);

        app.music.onloadeddata = function(){
            app.music.play();
            $('#game li').removeClass('selected');
            $('#game #temps2').hide();
            $('#game #temps1').show();
            $('#game li .resultat').empty();
            $('#cover img').attr('src', '');
            $('#artist').empty();
            $('#track').empty();
            $('.good:not(.hide)').addClass('hide');

            $('#cover img').attr('src', app.tracks[app.round].track.album.images[1].url);
            $('#artist').html(app.tracks[app.round].track.artists[0].name);
            $('#track').html(app.tracks[app.round].track.name);
            app.round++;
            console.log(app.round);
            $('.round').html(app.round);    
        };
        

    },
    timeUpdate: function() {
        var countDown;
        countDown = Math.floor(app.duration - app.music.currentTime);

        $('.timer').html(countDown);

        if(countDown == 0) {
            $('#game #temps1').fadeOut(200);
            setTimeout(function(){
                $('#game #temps2').fadeIn(200);
            },200);
            $('.players li:nth-child('+app.tracks[app.round-1].owner+') .good').removeClass('hide');
        }

    },
    endRound: function(){
       var idReponse = $('#game li.selected').data('id');

        if(idReponse == app.tracks[app.round-1].owner){
            app.result++;
            $('#game .selected .resultat').html('+1');
        }
        else{
            $('#game .selected .resultat').html('0');
        }

        if(app.round<5){
            setTimeout(function(){
                app.nextRound();
                
            }, 3000);
        }
        else{
            app.sendResult();
        }
    },
    sendResult: function(){
        console.log('result send');
        $('.players li:nth-child('+app.number+') .resultat').html(app.result);
        app.socket.emit('result', {result : app.result});
        $.mobile.navigate('#fin');
    },
    sendReload: function(){
        app.socket.emit('reload', {});
    },
    reload: function(){
        app.reset();
        console.log(app.newPlayer);
        if(app.newPlayer.length > 0){
            console.log('if');
            for(key in app.newPlayer){
                $('.players li:nth-child('+app.newPlayer[key]+')').removeClass('hide');    
            }
        }
        app.launchGame();
    },
    reset: function(){
        app.round=0;
        app.result = 0;
        if(app.music != undefined){
            app.music.pause();
        }

        $('audio').empty();
        $('#game #temps2').hide();
        $('#game #temps1').show();
        $('.resultat').empty();
    },
    addTrack: function(trackId){
        var trackJSON = JSON.stringify([""+trackId]);
        $.ajax({
            url: 'https://api.spotify.com/v1/me/tracks',
            type: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-Type': 'application/json'
            },
            data: trackJSON
        })
        .done(function(data) {
            navigator.notification.alert(
                'Le morceau à été ajouté à ta collection',  
                function(){},         
                'Ta playlist est heureuse !',            
                'Merci !'                  
            );
        });
    },
    adminDisconnect: function(){
        app.reset();
        app.socket.emit('leaveRoom',{});
        $.mobile.navigate('#join');
    }
};

app.initialize();


