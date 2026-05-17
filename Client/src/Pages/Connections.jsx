import React, { useEffect, useState } from 'react'
import { Users, UserCheck, UserPlus, UserRoundPen, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getToken, useAuth } from '@clerk/react'
import { fetchConnections } from '../features/Connections/connectionSlice.jsx'
import api from '../api/axios'
import toast from 'react-hot-toast'


const Connections = () => {

  const { connections, pendingConnections, followers, following } = useSelector((state) => state.connections)
  const dispatch = useDispatch();
  const { token } = useAuth();

  const [currentTab, setCurrentTab] = useState('Followers')
  const navigate = useNavigate()

  const dataArray = [
    { label: 'Followers', value: followers, icon: Users },
    { label: 'Following', value: following, icon: UserCheck },
    { label: 'Pending', value: pendingConnections, icon: UserRoundPen },
    { label: 'Connections', value: connections, icon: UserPlus },
  ]

  const handleUnfollow = async (userId) => {
    try {
      const { data } = await api.post('/api/user/unfollow', { id: userId },
        {
          headers: { Authorization: `Bearer ${await getToken()}` }
        }
      )

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(await getToken()));
      }
      else{
        toast(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  const acceptConnections = async (userId) => {
    try {
      const { data } = await api.post('/api/user/accept', { id: userId },
        {
          headers: { Authorization: `Bearer ${await getToken()}` }
        }
      )

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(await getToken()));
      }
      else{
        toast(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    const token = getToken();
    dispatch(fetchConnections(token))
  }, [])

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-6xl mx-auto p-6'>

        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-bold text-slate-900 mb-2'>Connections</h1>
          <p className='text-slate-600'>Manage your network and discover new connections</p>
        </div>
        {/* Counts */}
        <div className='mb-8 flex flex-wrap gap-4'>
          {dataArray.map((item, index) => (
            <div key={index} className='flex items-center gap-4 border h-24 w-48 border-slate-100 bg-white shadow-sm rounded-2xl p-4 hover:shadow-md transition-shadow'>
              <div className='p-3 bg-indigo-50 text-indigo-600 rounded-xl'>
                <item.icon className='w-6 h-6' />
              </div>
              <div>
                <b className='text-2xl font-bold text-slate-800'>{item.value.length}</b>
                <p className='text-sm font-medium text-slate-500'>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div className='inline-flex flex-wrap items-center bg-slate-100/80 rounded-xl p-1.5 shadow-inner'>
          {
            dataArray.map((tab) => (
              <button onClick={() => setCurrentTab(tab.label)} key={tab.label} className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all ${currentTab === tab.label ? 'bg-white font-semibold text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}>
                <tab.icon className='w-4 h-4' />
                <span className='ml-2'>{tab.label}</span>
                {tab.value && (
                  <span className='ml-1.5 bg-slate-100 px-1.5 py-0.5 rounded-md text-xs'>{tab.value.length}</span>
                )}
              </button>
            ))
          }
        </div>

        {/* Connections */}
        <div className='flex flex-wrap gap-6 mt-8'>
          {dataArray.find((item) => item.label === currentTab).value.map((user) => (
            <div key={user._id} className='w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex flex-col gap-4 p-5 bg-white shadow-sm border border-slate-100 rounded-2xl hover:shadow-md transition-shadow'>
              <div className='flex items-center gap-4'>
                <img src={user.profile_picture} alt='' className='rounded-full w-14 h-14 object-cover ring-2 ring-slate-100' />
                <div className='flex-1 min-w-0'>
                  <p className='font-semibold text-slate-800 truncate'>{user.full_name}</p>
                  <p className='text-sm text-slate-500 truncate'>@{user.username}</p>
                </div>
              </div>
              <p className='text-sm text-slate-600 line-clamp-2 h-10'>
                {user.bio ? user.bio : <span className="italic text-slate-400">No bio provided</span>}
              </p>
              <div className='flex gap-2 mt-auto pt-2'>
                <button onClick={() => navigate(`/profile/${user._id}`)} className='flex-1 py-2 text-sm font-medium rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-sm shadow-indigo-500/20 text-white active:scale-95 transition-all cursor-pointer'>
                  Profile
                </button>
                {
                  currentTab === 'Following' && (
                    <button onClick={() => handleUnfollow(user._id)} className='flex-1 py-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all cursor-pointer'>Unfollow</button>
                  )
                }
                {
                  currentTab === 'Pending' && (
                    <button onClick={() => acceptConnections(user._id)} className='flex-1 py-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all cursor-pointer'>Accept</button>
                  )
                }
                {
                  currentTab === 'Connections' && (
                    <button onClick={() => navigate(`/messages/${user._id}`)} className='flex-1 py-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer'>
                      <MessageSquare className='w-4 h-4' />
                      Message
                    </button>
                  )
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Connections