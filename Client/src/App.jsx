import { Route, Routes } from 'react-router-dom'
import Login from './Pages/Login'
import Feed from './Pages/Feed'
import Messages from './Pages/Messages'
import ChatBox from './Pages/ChatBox'
import Connections from './Pages/Connections'
import Discover from './Pages/Discover'
import Profile from './Pages/Profile'
import CreatePost from './Pages/CreatePost'
import { useUser, useAuth } from '@clerk/react'
import Layout from './Pages/Layout'
import { useEffect } from 'react'

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (user) {
      console.log(getToken().then((token) => console.log(token))) 
    }
  }, [user]);

  return (
    <>
      <Routes>
        <Route path='/' element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
