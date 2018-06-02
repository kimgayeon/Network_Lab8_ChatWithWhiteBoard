'use strict';
var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

var stompClient = null;
var username = null;

var color = 'black';
var width = 1;
var isDown = false;
var newPoint, oldPoint;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();

    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function sendDrawMessage(ctx) {
    stompClient.send("/app/draw.sendMessage", {}, JSON.stringify(ctx));
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'CHAT') {
    	var chat = message.chat;
    	if(chat.type === 'JOIN') {
    		messageElement.classList.add('event-message');
    		chat.content = chat.sender + ' joined!';
    	} else if (chat.type === 'LEAVE') {
    		messageElement.classList.add('event-message');
    		chat.content = chat.sender + ' left!';
    	} else {
    		messageElement.classList.add('chat-message');

    		var avatarElement = document.createElement('i');
    		var avatarText = document.createTextNode(chat.sender[0]);
    		avatarElement.appendChild(avatarText);
    		avatarElement.style['background-color'] = getAvatarColor(chat.sender);

    		messageElement.appendChild(avatarElement);

    		var usernameElement = document.createElement('span');
    		var usernameText = document.createTextNode(chat.sender);
    		usernameElement.appendChild(usernameText);
    		messageElement.appendChild(usernameElement);
    	}
    	
        var textElement = document.createElement('p');
        var messageText = document.createTextNode(chat.content);
        textElement.appendChild(messageText);

        messageElement.appendChild(textElement);

        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    } else if (message.type == "DRAW") {
        strokeMessage(message.draw);
    }
        
}

function strokeMessage(draw) {
    console.log("Draw Session Goes Now");
    console.log(draw);

    var canvas = document.getElementById('canvas');
    var cont = canvas.getContext('2d');

    cont.beginPath();
    cont.lineWidth = draw.width;
    cont.strokeStyle = draw.color;
    cont.moveTo(draw.x1, draw.y1);
    cont.lineTo(draw.x2, draw.y2);
    cont.stroke();
}

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

$(document).ready(function () {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    $(canvas).mousedown(function (event) {
        isDown = true;
        oldPoint = {
            x: event.pageX - $(this).position().left,
            y: event.pageY - $(this).position().top
        };
    });

    $(canvas).mousemove(function (event) {
        if (!isDown) { return; }
        newPoint = {
            x: event.pageX - $(this).position().left,
            y: event.pageY - $(this).position().top
        };

        sendDrawMessage({
            x1: oldPoint.x,
            y1: oldPoint.y,
            x2: newPoint.x,
            y2: newPoint.y,
            color: color,
            width: width,
            type: "DRAW"
        });

        oldPoint = newPoint;
    });

    $(canvas).mouseup(function (event) {
        isDown = false;
        oldPoint = {
            x: event.pageX - $(this).position().left,
            y: event.pageY - $(this).position().top
        };
    });
    // 입력 양식 이벤트를 연결합니다.
    $('#pen').click(function () {
        width = 1;
        color = 'black';
        $('#width').val(width);
    });

    $('#eraser').click(function () {
        width = 10;
        color = 'white';
        $('#width').val(width);
    });

    $('#width').change(function () {
        width = $(this).val()
    });
});

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)