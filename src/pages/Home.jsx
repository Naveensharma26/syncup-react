import { useState } from "react";
import NamePopup from "../components/NamePopup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config";

function Home() {
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [popupType, setPopupType] = useState("");

  const savedName = localStorage.getItem("name");

  const generateRoomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handlePopupSubmit = async (name, roomName) => {
    try {
      localStorage.setItem("name", name);

      if (popupType === "create") {
        const generatedRoomCode = generateRoomCode();
        await axios.post(`${API_URL}/createRoom`, {
          roomCode: generatedRoomCode,
          roomName,
          createdBy: name,
        });

        navigate(`/chat/${generatedRoomCode}`, {
          state: {
            roomCode: generatedRoomCode,
            roomName: roomName,
          },
        });
      } else {
        const response = await axios.get(`${API_URL}/room/${roomCode}`);

        navigate(`/chat/${roomCode}`, {
          state: {
            roomCode,
            roomName: response.data.roomName,
          },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#030632] gap-10 px-4 py-8 antialiased">
      <div className="bg-[#040621] border border-[#878ef1] rounded-3xl p-6 md:p-8 w-full max-w-md md:max-w-2xl transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            <span className="text-violet-700">Sync</span>up
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Stay Connected Instantly
          </p>
        </div>

        {/* Join Room */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block px-1">
            Have a code?
          </label>
          {/* Stack vertically on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter chat room code"
              className="w-full px-4 py-3.5 bg-[#030632] border border-[#878ef1] rounded-2xl outline-none transition-all duration-200 placeholder:text-gray-600 text-gray-100 font-mono tracking-wider focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <button
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold px-6 py-3.5 rounded-2xl cursor-pointer transition-all duration-200"
              onClick={() => {
                setPopupType("join");
                if (savedName) {
                  handlePopupSubmit(savedName);
                } else {
                  setShowNamePopup(true);
                }
              }}
            >
              Join
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="relative my-7 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#353b89]"></div>
          </div>
          <span className="relative px-4 text-xs font-semibold text-[#666da8] bg-[#040621] tracking-widest uppercase">
            or
          </span>
        </div>

        {/* Create Room */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block px-1">
            Need a new space?
          </label>
          <button
            className="bg-[#030632] border border-[#878ef1] hover:bg-[#202575] active:scale-[0.98] text-white w-full py-4 rounded-2xl font-semibold cursor-pointer transition-all duration-200"
            onClick={() => {
              setPopupType("create");
              setShowNamePopup(true);
            }}
          >
            Create Chat Room
          </button>
        </div>
      </div>

      <NamePopup
        open={showNamePopup}
        close={() => setShowNamePopup(false)}
        onSubmit={handlePopupSubmit}
        type={popupType}
      />
    </div>
  );
}

export default Home;
