import { useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";

function NamePopup({ open, close, onSubmit, type }) {
  const [name, setName] = useState(() => localStorage.getItem("name") || "");
  const [roomName, setRoomName] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      <div className="bg-[#030632] border border-[#353b89] w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {type === "create" ? "Enter Details" : "Enter your name"}
          </h2>
          <IoMdCloseCircleOutline
            size={28}
            onClick={() => {
              setRoomName("");
              close();
            }}
            className="cursor-pointer text-gray-500 hover:text-red-400 transition"
          />
        </div>

        {/* Name input */}
        <input
          type="text"
          value={name}
          placeholder="Your name..."
          className="w-full p-3 bg-[#040621] border border-[#353b89] rounded-xl outline-none text-gray-100 placeholder:text-gray-600 focus:border-violet-600 transition-colors duration-200"
          onChange={(e) => setName(e.target.value)}
        />

        {/* Room name input — create only */}
        {type === "create" && (
          <input
            type="text"
            value={roomName}
            placeholder="Room name..."
            className="w-full p-3 bg-[#040621] border border-[#353b89] rounded-xl outline-none text-gray-100 placeholder:text-gray-600 focus:border-violet-600 transition-colors duration-200"
            onChange={(e) => setRoomName(e.target.value)}
          />
        )}

        {/* Submit */}
        <button
          className={`rounded-xl p-3 font-medium transition-all duration-200
          ${
            name.trim() && (type !== "create" || roomName.trim())
              ? "bg-violet-700 hover:bg-violet-600 cursor-pointer text-white"
              : "bg-[#1a1d4a] cursor-not-allowed text-gray-600"
          }`}
          disabled={!name.trim() || (type === "create" && !roomName.trim())}
          onClick={() => onSubmit(name, roomName)}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}

export default NamePopup;
