import { useState, useEffect } from "react";
import { socket } from "../socket";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { RxExit } from "react-icons/rx";
import NamePopup from "./NamePopup";
import { LuCrown, LuSend } from "react-icons/lu";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import API_URL from "../../config";

function ChatWindow() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(socket.connected);
  const { roomCode } = useParams();
  const [roomName, setRoomName] = useState("");
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [userName, setUserName] = useState(localStorage.getItem("name") || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createdBy, setCreatedBy] = useState("");
  const [copied, setCopied] = useState(null);

  const navigate = useNavigate();

  const formatTime = (timestampString) => {
    if (!timestampString) return "";
    const date = new Date(timestampString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getData = () => {
    if (!roomCode) return;
    axios
      .get(`${API_URL}/messages/${roomCode}`)
      .then((response) => setMessages(response.data))
      .catch((err) => console.error("Error fetching messages:", err));
    axios
      .get(`${API_URL}/room/${roomCode}`)
      .then((response) => {
        setRoomName(response.data.roomName);
        setCreatedBy(response.data.createdBy);
      })
      .catch((err) => console.error("Error fetching room:", err));
    axios
      .get(`${API_URL}/room/members/${roomCode}`)
      .then((response) => {
        setAllMembers(response.data.members);
        console.log("All members ", response.data.members);
      })
      .catch((err) => console.error("Error fetching room:", err));
  };

  useEffect(() => {
    const savedName = localStorage.getItem("name");
    if (!savedName) {
      setShowNamePopup(true);
      return;
    }

    getData();

    const handleConnect = () => {
      console.log("Connected");
      setConnected(true);
      socket.emit("join_room", {
        roomCode,
        username: localStorage.getItem("name"),
      });
    };

    const handleDisconnect = () => {
      console.log("Disconnected");
      setConnected(false);
    };

    const handleIncomingMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleMembersUpdate = (updatedMembers) => {
      setMembers(updatedMembers);

      axios
        .get(`${API_URL}/room/members/${roomCode}`)
        .then((response) => setAllMembers(response.data.members))
        .catch((err) => console.error("Error fetching members:", err));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("receive_message", handleIncomingMessage);
    socket.on("room_members_update", handleMembersUpdate);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receive_message", handleIncomingMessage);
      socket.off("room_members_update", handleMembersUpdate);
    };
  }, [roomCode, userName]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    const messageData = {
      message: message,
      sentBy: userName,
      socketId: socket.id,
      roomCode: roomCode,
      sentAt: new Date(),
    };
    console.log("Sending:", messageData);
    socket.emit("send_message", messageData);
    setMessage("");
  };

  const handleLeaveRoom = () => {
    socket.emit("leave_room", { roomCode, username: userName });
    navigate("/");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleNameSubmit = (enteredName) => {
    localStorage.setItem("name", enteredName);
    setUserName(enteredName);
    setShowNamePopup(false);
  };

  const handleCopy = (toCopy) => {
    navigator.clipboard.writeText(toCopy);
    setTimeout(() => {
      setCopied(null);
    }, [3000]);
  };

  if (showNamePopup) {
    return (
      <NamePopup
        open={showNamePopup}
        close={() => {}}
        onSubmit={handleNameSubmit}
        type="join"
      />
    );
  }

  if (!connected) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <p className="animate-pulse">Connecting to Syncup Server...</p>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="bg-[#030632] border border-[#353b89] p-4 rounded-2xl flex flex-col justify-center items-start shrink-0">
        <div className="flex flex-row justify-between items-center">
          <h1 className="w-full text-center text-xs text-[#c9ccf3]">
            ROOM CODE
          </h1>
        </div>
        <div className="w-full flex justify-between items-center mt-2">
          <h1 className="text-2xl text-center font-mono tracking-wider text-violet-700">
            {roomCode || "Generating..."}
          </h1>
          <button
            className="bg-gray-800 px-2 py-1 text-white text-sm rounded-md cursor-pointer hover:bg-gray-500 duration-300"
            onClick={() => {
              handleCopy(`${roomCode}`);
              setCopied("code");
            }}
          >
            {copied === "code" ? "Copied !" : "Copy"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 w-full shrink-0">
        <button
          className="bg-[#040621] border border-[#353b89] text-gray-400 p-2 flex-1 rounded-md hover:bg-[#202575] cursor-pointer duration-300"
          onClick={() => {
            handleCopy(`${window.location.origin}/chat/${roomCode}`);
            setCopied("link");
          }}
        >
          {copied === "link" ? "Copied !" : "Copy Invite Link"}
        </button>
      </div>

      <div className="bg-[#030632] rounded-xl p-1 shadow-md flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Online Now */}
        <div className="bg-gradient-to-r text-sm text-white px-2 py-1 rounded-lg flex justify-between items-center mt-1 shrink-0">
          <h1 className="font-semibold text-[#c9ccf3]">ONLINE NOW</h1>
          <span className="text-violet-700 text-sm px-1 rounded-full">
            {members.length}
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-2 overflow-y-auto p-1 max-h-36">
          {members.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-[#141847] transition duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-semibold shadow-md">
                  {member[0]?.toUpperCase()}
                </div>

                <span className="text-[#e5e7ff] font-medium flex flex-row justify-center items-center gap-2">
                  {member}
                  {member === createdBy && (
                    <LuCrown className="text-yellow-400" size={14} />
                  )}
                </span>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
            </div>
          ))}
        </div>

        {/* All Members */}
        <div className="bg-gradient-to-r text-sm text-white px-2 py-1 rounded-lg flex justify-between items-center mt-1 shrink-0">
          <h1 className="font-semibold text-[#c9ccf3]">ALL MEMBERS</h1>
          <span className="text-violet-700 text-sm px-1 rounded-full">
            {allMembers.length}
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-2 overflow-y-auto p-1 flex-1 min-h-0">
          {allMembers.map((member, index) => {
            const isOnline = members.includes(member);
            return (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#141847] transition duration-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold shadow-md
                      ${isOnline ? "bg-violet-600" : "bg-[#2c315e] text-gray-400"}`}
                  >
                    {member[0]?.toUpperCase()}
                  </div>
                  <span
                    className={`${isOnline ? "text-[#e5e7ff] font-medium" : "text-gray-500"} flex items-center gap-2`}
                  >
                    {member}
                    {member === createdBy && (
                      <LuCrown className="text-yellow-400" size={14} />
                    )}
                  </span>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-400 shadow-[0_0_8px_#4ade80]" : "bg-[#31355f]"}`}
                />
              </div>
            );
          })}
        </div>

        {/* Leave Room */}
        <div
          className="mt-2 cursor-pointer hover:text-red-600 duration-300 rounded-md flex flex-row justify-between text-red-300 shrink-0 p-1"
          onClick={handleLeaveRoom}
        >
          <h1>Leave Room</h1>
          <RxExit size={24} />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <div className="bg-[#040621] text-white w-full flex flex-row p-2 justify-between items-center text-lg border-b border-gray-600 shrink-0">
        {/* Hamburger — mobile only */}
        <button
          className="md:hidden text-gray-300 hover:text-white p-1"
          onClick={() => setSidebarOpen(true)}
        >
          <RxHamburgerMenu size={22} />
        </button>

        {/* Logo — hidden on mobile (hamburger takes its spot), visible on desktop */}
        <h1 className="hidden md:block">
          <span className="text-violet-700">Sync</span>up
        </h1>

        <h1>
          <span className="text-violet-700">{roomName}</span> Room
        </h1>

        <h1 className="hidden md:block"></h1>
      </div>

      {/* Body */}
      <div className="bg-[#040621] w-full flex-1 min-h-0 flex flex-row gap-2">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — drawer on mobile, static on desktop */}
        <div
          className={`
            fixed top-0 left-0 h-full z-30 w-72 bg-[#040621] p-4 flex flex-col gap-4 transition-transform duration-300
            md:static md:translate-x-0 md:z-auto md:w-80 md:flex
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Close button — mobile only */}
          <div className="flex justify-between items-center md:hidden shrink-0">
            <h1 className="text-white text-lg">
              <span className="text-violet-700">Sync</span>up
            </h1>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <IoClose size={24} />
            </button>
          </div>

          <SidebarContent />
        </div>

        {/* Chat window */}
        <div className="w-full h-full py-2 flex flex-col px-2 md:px-0 md:pr-2">
          <div className="bg-[#040621] w-full flex-1 min-h-0 p-4 rounded-md overflow-y-auto flex flex-col gap-2">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center mt-4">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg, index) => {
                if (msg.type === "system") {
                  return (
                    <div
                      key={index}
                      className="self-center text-xs text-[#666da8] py-1 px-4 bg-[#10153d] rounded-full border border-[#2b3267]"
                    >
                      {msg.message}
                    </div>
                  );
                }
                const isMyMessage = msg.sentBy === userName;
                return (
                  <div
                    key={`${msg.id}-${index}`}
                    className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isMyMessage ? "self-end items-end" : "self-start items-start"}`}
                  >
                    {!isMyMessage && (
                      <span className="text-[11px] text-[#666da8] mb-1 ml-2">
                        ~{msg.sentBy}
                      </span>
                    )}
                    <div
                      className={`px-5 py-3 rounded-3xl shadow-sm break-words text-[15px] border
                        ${
                          isMyMessage
                            ? "bg-violet-600 border-violet-500 text-white rounded-br-md"
                            : "bg-[#10153d] border-[#2b3267] text-white rounded-bl-md"
                        }`}
                    >
                      {msg.message}
                    </div>
                    <span
                      className={`text-[11px] text-[#5d6398] mt-1 px-2 ${isMyMessage ? "text-right" : "text-left"}`}
                    >
                      {formatTime(msg.sentAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Input bar */}
          <div className="w-full flex mt-2 gap-2 shrink-0">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-2 bg-[#10153d] border-[#353b89] border rounded-md outline-none text-gray-100 focus:bg-[#10153d]"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-[#10153d] text-white cursor-pointer rounded-md hover:bg-gray-800 transition shrink-0"
            >
              <LuSend size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
