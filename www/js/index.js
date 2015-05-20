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
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

    },
    login: function() {
        window.location = "https://accounts.spotify.com/authorize/?client_id=9121d0695d984d7b9d86628d17a0c654&response_type=code&redirect_uri=trackguess%3A//&scope=user-library-read"        
    },
    joinRoom: function(){
            app.socket.emit('join', {room:$('input[name="room"]').val()});
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
            else{
            }
        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
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
        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });
    }
};


app.initialize();


