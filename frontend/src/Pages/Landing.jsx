import { useCallback, useState, useEffect } from 'react';
import { useSocket } from '../context/socket';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const [email, setEmail] = useState('');
  const [roomId, setRoomId] = useState('');

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSumbit = useCallback( (e) => {
    e.preventDefault();
    socket.emit('room:join', {email, roomId});
  }, [email, roomId, socket]);

  const handleRoomJoin = useCallback((data) => {
    const { roomId } = data;
    navigate(`/room/${roomId}`);
  }, [navigate]);

  useEffect(() => {
    socket.on('room:join', handleRoomJoin);
    return () => {
      socket.off('room:join', handleRoomJoin);
    }
  }, [handleRoomJoin, socket]);

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='flex flex-col min-w-72'>
        <form onSubmit={handleSumbit} className='flex flex-col'>
          <input
            type='email'
            placeholder='Enter your Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='p-2 m-2 border border-gray-500 outline-gray-500'
          />
          <input 
            type='text'
            placeholder='Enter Room Id'
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className='p-2 m-2 border border-gray-500 outline-gray-500'
          />
          <button
            type='submit'
            onClick={handleSumbit}
            className='p-2 m-2 bg-blue-600 text-white radius rounded-md hover:bg-blue-700'
          >
            Join
          </button>
        </form>
      </div>
    </div>
  )
}

export default Landing;
