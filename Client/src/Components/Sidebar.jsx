import React from "react";
import { assets, dummyUserData } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { CirclePlus, LogOut } from "lucide-react";
import { UserButton, useClerk } from "@clerk/react";
import '../index.css';
import { useSelector } from "react-redux";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {

  const navigate = useNavigate();
  const user = useSelector((state) => state.user.value)
  const { signOut } = useClerk();

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between max-sm:absolute top-0 bottom-0 z-20 ${sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"
        }`}
    >
      {/* Logo */}
      <div className="w-full px-4 pt-4 pb-3">
        <img
          onClick={() => navigate("/")}
          src={assets.logo2}
          className="w-26 ml-7 my-2 cursor-pointer"
          alt=""
        />
      </div>

      {/* Full-width divider — touches both left and right border */}
      <hr className="border-gray-200 w-full" />

      {/* Nav + Create Post */}
      <div className="w-full flex-1 pt-6 px-4">
        <MenuItems setSidebarOpen={setSidebarOpen} />

        <Link to="/create-post" className="flex items-center justify-center gap-2 py-3 mt-6 mx-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all text-white font-medium cursor-pointer">
          <CirclePlus className="w-5 h-5" />
          Create Post
        </Link>
      </div>
      <div className="w-full border-t border-slate-100 bg-slate-50/50 p-4 px-7 flex items-center justify-between hover:bg-slate-50 transition-colors">
        <div className="flex gap-3 items-center cursor-pointer">
          <div className="ring-2 ring-indigo-100 rounded-full">
            <UserButton />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-800">{user.full_name}</h1>
            <p className="text-xs font-medium text-slate-500">@{user.username}</p>
          </div>
        </div>
        <LogOut onClick={signOut} className="w-5 h-5 text-slate-400 hover:text-red-500 transition cursor-pointer" />
      </div>
    </div>
  );
};

export default Sidebar;