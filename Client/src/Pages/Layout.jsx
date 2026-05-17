import { useState } from 'react'
import Sidebar from '../Components/Sidebar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react';
import Loading from '../Components/Loading';
import { dummyUserData } from '../assets/assets';
import { useSelector } from 'react-redux';

const Layout = () => {

  const user = useSelector((state) => state.user.value);
  // console.log("At Layout.jsx: \n", user)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (user === undefined) {
    return <Loading />
  }

  if (user === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-center p-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">User Sync Pending</h1>
        <p className="text-slate-600 max-w-md">
          Your account was authenticated via Clerk, but it hasn't synced to our database yet. Please ensure your Clerk Webhooks (via Inngest/Ngrok) are running locally, then refresh this page.
        </p>
      </div>
    )
  }

  return (
    <div className='w-full flex h-screen'>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className='flex-1 h-full overflow-y-auto bg-slate-50'>
        <Outlet />
      </div>

      {
        sidebarOpen ?
          <X
            className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden'
            onClick={() => setSidebarOpen(false)}
          />
          :
          <Menu
            className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden'
            onClick={() => setSidebarOpen(true)}
          />
      }


    </div>
  )
}

export default Layout
