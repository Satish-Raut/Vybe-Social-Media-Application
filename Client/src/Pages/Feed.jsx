import { useEffect, useState } from "react"
import { assets, dummyPostsData } from "../assets/assets";
import Loading from "../Components/Loading";
import StoriesBar from "../Components/StoriesBar";
import PostCard from "../Components/PostCard";
import RecentMessages from "../Components/RecentMessages";
import { useAuth } from "@clerk/react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Feed = () => {

  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchFeeds = async () => {

    try {
      setLoading(true)
      const { data } = await api.get('/api/post/feed', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setFeeds(data.posts || [])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchFeeds()
  }, []);

  return !loading ? (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* Stories and Post List */}
      <div>
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>


      {/* Right sidebar */}
      <div className='max-xl:hidden w-72 shrink-0 sticky top-0 space-y-6 pt-4'>
        {/* Sponsored */}
        <div className='bg-white p-5 rounded-2xl flex flex-col gap-3 shadow-sm border border-slate-100'>
          <h3 className='text-slate-800 font-semibold text-sm'>Sponsored</h3>
          <img src={assets.sponsored_img} className='w-full h-auto rounded-xl object-cover shadow-sm' alt='' />
          <div>
            <p className='text-slate-800 font-medium text-sm'>Email marketing</p>
            <p className='text-slate-500 text-xs mt-1 leading-relaxed'>Supercharge your marketing with a powerful, easy-to-use platform built for results.</p>
          </div>
        </div>
        {/* Recent Messages */}
        <RecentMessages />
      </div>

    </div>
  ) :
    <Loading />
}

export default Feed
