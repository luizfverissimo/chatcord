const users = [];

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

function getRooms() {
  return users
    .map(({ room }) => room)
    .filter((room, index, self) => self.indexOf(room) === index);
}

function getUsersByRooms() {
  const rooms = getRooms();
  const roomsAndUsers = rooms.map((room) => {
    const usersByRoom = users.filter((user) => user.room === room);
    const usersByRoomsIds = usersByRoom.map((user) => user.id);

    const roomObj = {
      room,
      users: usersByRoom
    };
    return roomObj;
  });
  return roomsAndUsers;
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getRooms,
  getUsersByRooms
};
