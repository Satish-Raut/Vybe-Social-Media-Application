import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { dummyPostsData, dummyUserData } from '../assets/assets'
import UserProfileInfo from '../Components/UserProfileInfo'
import ProfileModal from '../Components/ProfileModal'
import PostCard from '../Components/PostCard'
import Loading from '../Components/Loading'
import moment from 'moment'
import { useAuth } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const Profile = () => {

  // { Get the Loggedin user Details}
  const currentUser = useSelector((state) => state.user.value)

  // {Get the profile id from the url and the profile id}
  const { getToken } = useAuth();
  const { profileId } = useParams()
  
  const [user, setUser] = useState(dummyUserData)
  const [posts, setPosts] = useState(dummyPostsData)
  const [likedPosts, setLikedPosts] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [showEdit, setShowEdit] = useState(false)

  const fetchUser = async (profileId) => {

    const token = await getToken();
    try {
      const { data } = await api.post('/api/user/profile', { profileId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // console.log("Only data: ", data);
      // console.log("Profile data: ", data.profile);

      if (data.success) {
        setUser(data.profile)
        setPosts(data.posts)
        setLikedPosts(data.likedPosts || [])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (profileId) {
      fetchUser(profileId);
    }
    else {
      fetchUser(currentUser._id)
    }
  }, [profileId, currentUser])

  return user ? (
    <div className='relative h-full overflow-y-auto no-scrollbar bg-gray-50 p-6'>
      <div className='max-w-3xl mx-auto'>
        {/* Profile Card */}
        <div className='bg-white rounded-2xl shadow overflow-hidden'>
          {/* Cover Photo */}
          <div className='h-40 md:h-56 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200'>
            {user.cover_photo && <img src={user.cover_photo} alt='' className='w-full h-full object-cover' />}
          </div>
          {/* User Info */}
          <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit} />
        </div>

        {/*Tabs */}
        <div className='mt-6'>
          <div className='bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>
            {["posts", "media", "likes"].map((tab) => (
              <button onClick={() => setActiveTab(tab)} key={tab} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {/* Posts */}
          {activeTab === 'posts' && (
            <div className='mt-6 flex flex-col items-center gap-6'>
              {posts.map((post) => <PostCard key={post._id} post={post} />)}
            </div>
          )}
          {/* Media */}
          {activeTab === 'media' && (
            <div className='mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
              {posts.filter((post) => post.image_urls.length > 0).length > 0 ? (
                posts
                  .filter((post) => post.image_urls.length > 0)
                  .map((post) => (
                    <React.Fragment key={post._id}>
                      {post.image_urls.map((image, index) => (
                        <Link target="_blank" to={image} key={`${post._id}-${index}`} className='relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all'>
                          <img src={image} className='w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500' alt='Post media' />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
                            <p className='text-xs font-medium text-white line-clamp-2'>
                              {post.content ? post.content : `Posted ${moment(post.createdAt).fromNow()}`}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </React.Fragment>
                  ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                   <p className="text-sm">No media posted yet.</p>
                </div>
              )}
            </div>
          )}
          {/* Likes */}
          {activeTab === 'likes' && (
            <div className='mt-6 flex flex-col items-center gap-6'>
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => <PostCard key={post._id} post={post} />)
              ) : (
                <p className='text-gray-500 mt-4'>No liked posts yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Edit Profile Modal */}
      {showEdit && <ProfileModal setShowEdit={setShowEdit} />}
    </div>
  ) : (<Loading />)
}

export default Profile