const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

let myUserId, activeRoom;
let roomsListForTheUser = [];

// Get username and room from URL
const { username, room, roomslist } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

if(roomslist) {
  outputRoomName(roomslist)
}

activeRoom = room;

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', (roomsAndUsers) => {
  console.log(roomsAndUsers);
  let activeRoomUsers;

  if(!Array.isArray(roomsAndUsers)) return

  roomsAndUsers.forEach((room) => {
    if (room.room === activeRoom) {
      activeRoomUsers = room.users;
    }

    room.users.forEach((user) => {
      if (user.id === myUserId) {
        if (roomsListForTheUser.includes(room.room)) return
        roomsListForTheUser.push(room.room);
        outputRoomName(room.room)
        return;
      }
    });
  });

  outputUsers(activeRoomUsers);
});



//Welcome message from server
socket.on('welcome-message', (res) => {
  myUserId = res.userId;
  outputMessage(res.message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Previous message received and rendered
socket.on('previous-messages', (previousMessages) => {
  previousMessages.forEach((message) => {
    outputMessage(message);
  });
});

// Message from server
socket.on('message', (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span> ${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  const roomList = document.querySelector('.rooms');

  const roomElement = document.createElement('a');
  roomElement.setAttribute(
    'href',
    `/chat.html?username=${username}&room=${room}&roomslist=${roomsListForTheUser}`
  );
  roomElement.innerText = room;

  roomList.appendChild(roomElement);
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    const chatButton = document.createElement('button');

    chatButton.setAttribute('data-id', user.id);
    li.innerText = user.username;

    if (room === 'Meet') {
      chatButton.classList.add('privateBtn');
      chatButton.innerHTML = `<i class="fas fa-comment"></i>`;

      if (myUserId === user.id) {
        chatButton.disabled = true;
      }

      chatButton.addEventListener('click', (e) => {
        sendPrivateMessage(user.id);
      });

      li.appendChild(chatButton);
    }
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Você realmente quer sair da sala?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});

//
function sendPrivateMessage(id) {
  if (myUserId === id) return;

  const confirmPvt = confirm('Você deseja iniciar uma conversa?');

  if (confirmPvt) {
    socket.emit('start-private-chat', { room: room, from: myUserId, to: id });
  }
}

socket.on('create-private-chat', ({ room, from, to, userFrom, userTo }) => {
  // console.log(room, from, to, userFrom, userTo)

  if (from === myUserId) {
    window.location = `/chat.html?username=${username}&room=${room}&roomslist=${roomsListForTheUser}`;
  }

  if (to === myUserId) {
    const confirmPvtTo = confirm(
      `${userFrom} deseja conversar com você. Aceitar?`
    );
    if (confirmPvtTo) {
      window.location = `/chat.html?username=${username}&room=${room}&roomslist=${roomsListForTheUser}`;
    }
  }
});

//criado uma sala privada
//criar uma nova janela
