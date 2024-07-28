import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../context/socket';
import ReactPlayer from 'react-player';
import peer from '../services/peer';

function Room() {

  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const handleUserJoin = ({ id }) => {
    setRemoteSocketId(id);
  }

  const handleCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true, video: true
    });
    setMyStream(stream);
    stream.getTracks().forEach(track => {
      peer.peer.addTrack(track, stream);
    });

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true, video: true
    });
    setMyStream(stream);
    stream.getTracks().forEach(track => {
      peer.peer.addTrack(track, stream);
    });

    await peer.peer.setRemoteDescription(new RTCSessionDescription(offer));
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
  }, [socket]);

  const handleCallAccepted = useCallback(async ({ ans }) => {
    await peer.peer.setRemoteDescription(new RTCSessionDescription(ans));
  }, []);

  const handleIceCandidate = useCallback(({ candidate }) => {
    peer.addIceCandidate(candidate);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener('track', event => {
      setRemoteStream(event.streams[0]);
    });

    return () => {
      peer.peer.removeEventListener('track', event => {
        setRemoteStream(event.streams[0]);
      });
    }
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoin);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("user:joined", handleUserJoin);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("ice-candidate", handleIceCandidate);
    }
  }, [handleCallAccepted, handleIncomingCall, handleIceCandidate, socket]);

  useEffect(() => {
    socket.on('message', (message) => {
      switch (message.type) {
        case 'candidate':
          peer.addIceCandidate(message.candidate);
          break;
        default:
          break;
      }
    });

    return () => {
      socket.off('message');
    };
  }, [socket]);

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <div className='flex'>
        {myStream && <ReactPlayer 
          playing
          muted
          url={myStream}
          className='h-36 w-48'
        />}
        {remoteStream && <ReactPlayer 
          playing
          muted
          url={myStream}
          className='h-36 w-48'
        />}
      </div>
      <div className='flex flex-col items-center min-w-48'>
        <h1>{remoteSocketId ? 'Connected' : 'No one in the room'}</h1>
        <button
          type='submit'
          onClick={handleCall}
          className='p-2 m-2 w-full bg-green-600 rounded-3xl text-white hover:bg-green-700'
        >
          Call
        </button>
      </div>
    </div>
  )
}

export default Room;