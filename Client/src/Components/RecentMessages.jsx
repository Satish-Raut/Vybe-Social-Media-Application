import React, { useEffect, useState } from "react";
import { dummyRecentMessagesData } from "../assets/assets";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAuth, useUser } from "@clerk/react";
import api from "../api/axios";
import toast from "react-hot-toast";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const {user} = useUser();
  const {getToken} = useAuth();

  const fetchRecentMessages = async() =>{
    try {
      const token = await getToken();
      const {data} = await api.get('/api/user/recent-messages', {
        headers: {Authorization: `Bearer ${token}`}
      });

      if(data.success)
      {
        const groupMessages = data.messages.reduce((acc, message)=>{
          const senderId = message.from_user_id._id;
          if(!acc[senderId] || new Date(message.createdAt) > new Date(acc[senderId].createdAt))
          {
            acc[senderId] = message;
          }

          return acc;
        }, {})


        // Sort messages by date
        const sortMessages = Object.values(groupMessages).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setMessages(sortMessages)
      }
      else{
        toast.error(data.message)
      }

    } catch (error) {
        toast.error(error.message)
    }
  }

  useEffect(()=>{
    if(user)
    {
      fetchRecentMessages();
      const interval = setInterval(fetchRecentMessages, 30000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [user])

  return (
    <div className="bg-white w-full max-w-xs p-5 rounded-2xl shadow-sm border border-slate-100 text-sm">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>
      <div className="flex flex-col max-h-64 overflow-y-auto no-scrollbar space-y-1">
        {messages.map((message, index) => (
          <Link
            to={`/messages/${message.from_user_id._id}`}
            key={index}
            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors group"
          >
            <img
              src={message.from_user_id.profile_picture}
              alt=""
              className="w-10 h-10 rounded-full object-cover group-hover:ring-2 ring-indigo-100 transition-all"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <p className="font-medium text-slate-800 truncate pr-2">{message.from_user_id.full_name}</p>
                <p className="text-[10px] text-slate-400 shrink-0">
                  {moment(message.createdAt).fromNow(true)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 truncate pr-2">
                  {message.text ? message.text : "📸 Media"}
                </p>
                {!message.seen && <p className="bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-medium shadow-sm shrink-0">1</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentMessages;