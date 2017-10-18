const socketIO = require('socket.io');


module.exports = function (httpServer) {
	const io = socketIO(httpServer);
	let count = 0;
	let users = {};

	
	io.on('connection', socket => {
		let userId     = null,
		    userName   = '';
	
			
		socket.on('loggedin', user => {
			userName = user;
			userId = `_${count}`;
			users[userId] = user;
			io.emit('loggedin', users); // update current online users list
			socket.broadcast.emit('user status', `${userName} joined the room`); // tell room who joined
		
			count++;
		})
		  
		socket.on('chat message', msg => {
			console.log(`message: ${msg.content}`);
			console.log(`user: ${msg.user}`);
			socket.broadcast.emit('chat message', msg); 
		});

		socket.on('user typing', user => {
			socket.broadcast.emit('user typing', user);
		});

		socket.on('disconnect', () => {
			delete users[userId];
			io.emit('loggedin', users);
			socket.broadcast.emit('user status', `${userName} has left the room`);
		});
	});
}  