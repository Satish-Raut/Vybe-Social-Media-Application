import React from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

const Notification = ({t, message}) => {

    const navigate = useNavigate();

    const handleClick = () => {
        toast.dismiss(t.id);
        navigate(`/messages/${message.from_user_id._id}`);
    }

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-slate-100 overflow-hidden hover:shadow-xl transition-shadow`}
    >
      <div className="flex-1 w-0 p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={handleClick}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <img
              className="h-11 w-11 rounded-full object-cover ring-2 ring-indigo-50 shadow-sm"
              src={message.from_user_id.profile_picture}
              alt=""
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-slate-800 truncate">
              {message.from_user_id.full_name}
            </p>
            <p className="mt-0.5 text-[13px] text-slate-500 font-medium truncate">
              {message.message_type === 'image' ? '📸 Sent an image' : message.text}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-slate-100 bg-slate-50/50">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
   )
}

export default Notification