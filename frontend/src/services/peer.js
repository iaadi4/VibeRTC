import { io } from 'socket.io-client';

class PeerService {
    constructor() {
        this.socket = io('http://localhost:3000');
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:stun3.l.google.com:19302",
                        "stun:stun4.l.google.com:19302",
                    ],
                },
            ],
        });
        this.peer.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendMessageToRemotePeer({
                    type: 'candidate',
                    candidate: event.candidate,
                });
            }
        };

        this.peer.onconnectionstatechange = () => {
            switch (this.peer.connectionState) {
                case 'connected':
                    console.log('The connection has become fully connected');
                    break;
                case 'disconnected':
                case 'failed':
                    console.log('The connection has failed or disconnected');
                    break;
                case 'closed':
                    console.log('The connection has been closed');
                    break;
                default:
                    break;
            }
        };
    }

    async setLocalDescription(ans) {
        try {
            if (this.peer.signalingState === 'have-remote-offer') {
                await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            }
        } catch (error) {
            console.error('Error setting local description:', error);
        }
    }

    async getOffer() {
        try {
            if (this.peer.signalingState === 'stable') {
                const offer = await this.peer.createOffer();
                await this.peer.setLocalDescription(new RTCSessionDescription(offer));
                return offer;
            }
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }

    async getAnswer(offer) {
        try {
            if (this.peer.signalingState === 'have-remote-offer') {
                await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
                const ans = await this.peer.createAnswer();
                await this.peer.setLocalDescription(new RTCSessionDescription(ans));
                return ans;
            }
        } catch (error) {
            console.error('Error creating answer:', error);
        }
    }

    async addIceCandidate(candidate) {
        try {
            if (candidate) {
                await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }

    sendMessageToRemotePeer(message) {
        this.socket.emit('message', message);
    }
}

export default new PeerService();
