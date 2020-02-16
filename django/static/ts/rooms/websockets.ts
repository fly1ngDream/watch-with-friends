import { video } from "./video";
import ChatMessage from "./ChatMessage";
import ConnectedUser from "./ConnectedUser";

// Initialize WebSocket
export const roomSocket = new WebSocket(
    `ws://${window.location.host}/ws/chat/${roomName}/`
);

let container = document.getElementsByClassName("container-xl")[0];
let chatLogBody = document.getElementById("chat-log-body");
let connectedUsersContainer = document.getElementById("connectedUsers");

function notNewUserWarningElement(text: string): HTMLElement {
    let warningH1 = document.createElement("h1");
    let warningText = document.createTextNode(text);

    warningH1.appendChild(warningText);

    return warningH1;
}

roomSocket.onmessage = e => {
    let data = JSON.parse(e.data);
    let messageType = data.type;

    // Messages for all users
    switch (messageType) {
        case "message": {
            let username = data.username;
            let content = data.message;
            let message = new ChatMessage(chatLogBody, username, content, user);

            message.post();

            chatLogBody.scrollTop = chatLogBody.scrollHeight;
            break;
        }
        case "user_connected":
        case "user_disconnected": {
            let connectedUsersUsernames = connectedUsersContainer.textContent
                .trim()
                .split(" ");

            let usernameData = data.username;
            let isNewUserData = data.is_new_user;

            if (isNewUserData) {
                let connectedUsersDataSet = new Set(
                    data.connected_users.split(",")
                );

                connectedUsersContainer.removeChildren();

                connectedUsersDataSet.forEach(function(username) {
                    let connectedUser = new ConnectedUser(username);
                    connectedUser.addToContainer(connectedUsersContainer);
                });
            } else if (user == usernameData) {
                container.removeChildren();

                container.appendChild(
                    notNewUserWarningElement(
                        "You are already in this room from the other tab/browser"
                    )
                );
            }
            break;
        }
        case "buffering_video": {
            video.pause();
            break;
        }
        case "all_players_buffered": {
            video.play();
            break;
        }
    }
    // Messages for all users, except the room creator
    if (user != roomAuthor) {
        switch (messageType) {
            case "seeked_video": {
                video.currentTime = data.current_time;
                break;
            }
            case "pause_video": {
                video.pause();
                break;
            }
            case "play_video": {
                video.play();
                break;
            }
        }
    }
};