const { Server } = require('socket.io');

const io = new Server(3000, {
    cors: true
});

const emailToSocketIdMap = new Map();
const socketToEmailMap = new Map();

io.on("connection", (socket) => {
    socket.on("room:join", data => {
        const {email, room} = data;
        emailToSocketIdMap.set(email, socket.id);
        socketToEmailMap.set(socket.id, email);
        io.to(room).emit("user:joined", {email, id: socket.id});
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
    });

    socket.on("user:call", ({to, offer}) => {
        io.to(to).emit("incoming:call", { from: socket.id, offer});
    });

    socket.on("call:accepted", ({to, ans}) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans});
    });
});