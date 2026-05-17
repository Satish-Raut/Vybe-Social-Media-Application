import React from "react";
import { dummyUserData } from "../assets/assets";
import { MessageCircle, Plus, UserPlus, MapPin } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { fetchUser } from "../features/User/userSlice";

const UserCard = ({ user }) => {
    const currentUser = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleFollow = async () => {
        try {
            const { data } = await api.post('/api/user/follow', { id: user._id }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                toast.success(data.message);
                dispatch(fetchUser(await getToken()));
            }
            else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    };

    const handleConnectionRequest = async () => {
        if (currentUser.connections.includes(user._id)) {
            return navigate('/messages/' + user._id)
        }

        try {
            const { data } = await api.post('/api/user/connect', { id: user._id }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                toast.success(data.message);
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    };

    return (
        <div
            key={user._id}
            className="p-6 flex flex-col justify-between w-full sm:w-72 bg-white shadow-sm border border-slate-100 rounded-2xl hover:shadow-md transition-shadow"
        >
            <div className="text-center">
                <img
                    src={user.profile_picture}
                    alt=""
                    className="rounded-full w-20 h-20 object-cover ring-4 ring-indigo-50 shadow-sm mx-auto"
                />
                <p className="mt-4 font-bold text-slate-800 text-lg truncate">{user.full_name}</p>
                {user.username && (
                    <p className="text-slate-500 font-medium text-sm truncate">@{user.username}</p>
                )}
                <p className="text-slate-600 mt-3 text-center text-sm px-2 line-clamp-2 h-10">
                    {user.bio ? user.bio : <span className="italic text-slate-400">No bio provided</span>}
                </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-4 text-xs font-medium text-slate-600">
                {user.location && (
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" /> <span className="truncate max-w-[80px]">{user.location}</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                    <span className="text-slate-800 font-bold">{user.followers.length}</span> <span className="text-slate-500">Followers</span>
                </div>
            </div>

            <div className="flex mt-6 gap-2">
                {/* Follow Button */}
                <button
                    onClick={handleFollow}
                    disabled={currentUser?.following.includes(user._id)}
                    className="flex-1 py-2.5 rounded-xl flex justify-center items-center gap-2 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-sm shadow-indigo-500/20 active:scale-95 transition-all text-white font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                    <UserPlus className="w-4 h-4" /> {currentUser?.following.includes(user._id) ? 'Following' : 'Follow'}
                </button>
                {/* Connection Request Button / Message Button */}
                <button onClick={handleConnectionRequest} className="flex items-center justify-center w-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer active:scale-95 transition-all">
                    {
                        currentUser?.connections.includes(user._id) ? <MessageCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />
                    }
                </button>
            </div>
        </div>
    );
};

export default UserCard;