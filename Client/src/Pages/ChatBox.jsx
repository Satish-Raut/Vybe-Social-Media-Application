import React, { useEffect, useRef, useState } from 'react'
import { dummyMessagesData, dummyUserData } from '../assets/assets'
import { SendHorizonal, ImageIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import api from '../api/axios'
import { addMessages, fetchMessages, recentMessages } from '../features/Messages/messageSlice.jsx'
import toast from 'react-hot-toast'

const ChatBox = () => {

  const messages = useSelector((state) => state.messages.messages)
  const { userId } = useParams()
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const connections = useSelector((state) => state.connections.connections)

  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      dispatch(fetchMessages({ token, userId }));
    } catch (error) {
      toast.error(error.message)
    }
  }

  const sendMessage = async () => {
    try {
      if (!text && !image) return;
      setIsLoading(true);

      const token = await getToken();
      const formData = new FormData();

      formData.append('to_user_id', userId);
      formData.append('text', text);
      image && formData.append('image', image);

      const { data } = await api.post('/api/message/send', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setText('');
        setImage(null);
        dispatch(addMessages(data.message))
      }
      else {
        throw new Error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUserMessages();

    return () => {
      dispatch(recentMessages());
    }
  }, [userId])

  useEffect(() => {
    if (connections.length > 0) {
      const user = connections.find(connection => connection._id === userId)
      setUser(user);
    }
  }, [connections, userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return user && (
    <div className='flex flex-col h-screen bg-slate-50'>
      <div className='flex items-center gap-3 p-3 md:px-10 xl:pl-42 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-xs z-10'>
        <div className='relative'>
          <img src={user.profile_picture} alt='' className='size-11 rounded-full object-cover border-2 border-white shadow-sm' />
          <div className='absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-500/20'></div>
        </div>
        <div>
          <p className='font-semibold text-gray-800 text-lg'>{user.full_name}</p>
          <p className='text-xs font-medium text-gray-500 mt-0.5'>@{user.username}</p>
        </div>
      </div>
      <div className='p-5 md:px-10 h-full overflow-y-auto scroll-smooth'>
        <div className='space-y-6 max-w-4xl mx-auto pb-6'>
          {
            [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((message, index) => {
              const isMine = message.to_user_id === user._id;
              return (
              <div key={index} className={`flex flex-col ${!isMine ? 'items-start' : 'items-end'}`}>
                <div className={`px-4 py-2.5 text-[15px] max-w-sm sm:max-w-md rounded-2xl shadow-sm ${!isMine ? 'bg-white text-slate-800 border border-gray-100 rounded-bl-sm' : 'bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm shadow-indigo-500/20'}`}>
                  {
                    message.message_type === 'image' && <img src={message.media_url} className='w-full max-w-sm rounded-xl mb-2 object-cover' alt="" />
                  }
                  <p className='leading-relaxed'>{message.text}</p>
                </div>
              </div>
            )})
          }
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className='px-4 pt-2 pb-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent sticky bottom-0'>
        <div className='flex items-center gap-3 pl-6 p-2 bg-white w-full max-w-2xl mx-auto border border-gray-200/80 shadow-lg shadow-gray-200/50 rounded-full focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all'>
          <input disabled={isLoading} type="text" className={`flex-1 outline-none text-slate-700 placeholder-gray-400 ${isLoading ? 'opacity-50' : ''}`} placeholder={isLoading ? 'Sending...' : 'Type your message...'} onKeyDown={e => e.key === 'Enter' && sendMessage()} onChange={(e) => setText(e.target.value)} value={text} />
          <label htmlFor='image'>
            {
              image ? <img src={URL.createObjectURL(image)} alt="" className={`h-10 w-10 object-cover rounded-full border border-gray-200 ${isLoading ? 'opacity-50' : ''}`} /> : <div className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}><ImageIcon className="size-6 text-gray-500" /></div>
            }
            <input disabled={isLoading} type="file" id='image' accept='image/*' hidden onChange={(e) => setImage(e.target.files[0])} />
          </label>

          <button disabled={isLoading} onClick={sendMessage} className={`bg-linear-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-3 rounded-full transition-all shadow-md shadow-indigo-500/30 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/40'}`}>
            <SendHorizonal size={20} className={isLoading ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox