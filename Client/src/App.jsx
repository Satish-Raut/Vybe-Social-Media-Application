import { Route, Routes, useLocation } from 'react-router-dom'
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
import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/User/userSlice.jsx'
import { fetchConnections } from './features/Connections/connectionSlice.jsx'
import { addMessages } from './features/Messages/messageSlice.jsx'
import toast from 'react-hot-toast'
import Notification from './Components/Notification'

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { pathname } = useLocation()

  const pathNameRef = useRef(pathname);

  const dispatch = useDispatch();

  useEffect(() => {

    // Fetch the user data here
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token))
      }
    }

    fetchData();
  }, [user, getToken, dispatch]);

  useEffect(() => {
    pathNameRef.current = pathname;
  }, [pathname])

  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user.id);

      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data)

        if (pathNameRef.current === ('/messages/' + message.from_user_id._id)) {
          dispatch(addMessages(message));
        }
        else {
          toast.custom((t) => <Notification t={t} message={message} />, { duration: 4000, position: 'bottom-right' });
        }
      }

      return () => {
        eventSource.close()
      }
    }
  }, [user, dispatch])

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
