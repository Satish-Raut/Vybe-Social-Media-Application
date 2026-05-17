import React, { useEffect, useState } from 'react'
import { dummyConnectionsData } from '../assets/assets'
import { Search } from 'lucide-react'
import UserCard from '../Components/UserCard'
import Loading from '../Components/Loading'
import api from '../api/axios'
import { getToken, useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import { fetchUser } from '../features/User/userSlice.jsx'
import { useDispatch } from 'react-redux'

const Discover = () => {

  const [input, setInput] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const handleSearch = async (e) => {
    if (e.key === 'Enter') {

      try {
        setUsers([])
        setLoading(true)

        const { data } = await api.post('/api/user/discover', { input }, {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })

        data.success ? setUsers(data.users) : toast.error(data.message)
        setLoading(false);
        setInput('');

      } catch (error) {
        toast.error(error.message)
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      const token = await getToken();
      dispatch(fetchUser(token));
    };
    loadUser();
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl  mx-auto p-6'>

        {/* Title */}
        <div className='mb-8'>
          <h1 className='font-bold text-slate-900 mb-2'>Discover People</h1>
          <p className='text-slate-600'>Connect with amazing people and grow your network</p>
        </div>
        {/* Search */}
        <div className='mb-8 relative max-w-3xl'>
          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
            <Search className='h-5 w-5 text-slate-400' />
          </div>
          <input 
            type='text' 
            placeholder='Search people by name, username, bio, or location...' 
            className='w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all' 
            onChange={(e) => setInput(e.target.value)} 
            value={input} 
            onKeyUp={handleSearch} 
          />
        </div>
        <div className='flex flex-wrap gap-6'>
          {users.map((user) => (
            <UserCard user={user} key={user._id} />
          ))}
        </div>
        {
          loading && (<Loading height='60vh' />)
        }
      </div>
    </div>
  )
}

export default Discover