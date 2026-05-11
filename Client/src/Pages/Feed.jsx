import { useEffect, useState } from "react"
import { assets, dummyPostsData } from "../assets/assets";
import Loading from "../Components/Loading";
import StoriesBar from "../Components/StoriesBar";
import PostCard from "../Components/PostCard";
import RecentMessages from "../Components/RecentMessages";

const Feed = () => {

  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    setFeeds(dummyPostsData);
    setLoading(false)
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
      <div className='max-xl:hidden w-60 shrink-0 sticky top-0 space-y-4'>
        {/* Sponsored */}
        <div className='bg-white text-xs p-4 rounded-xl flex flex-col gap-2 shadow'>
          <h3 className='text-slate-800 font-semibold'>Sponsored</h3>
          <img src={assets.sponsored_img} className='w-full h-auto rounded-md' alt='' />
          <p className='text-slate-600 font-medium'>Email marketing</p>
          <p className='text-slate-400'>Supercharge your marketing with a powerful, easy-to-use platform built for results.</p>
        </div>
        {/* Recent Messages */}
        <RecentMessages />
      </div>

    </div>
  ) :
    <Loading />
}

export default Feed
