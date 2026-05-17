import { Badge, BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react'
import React, { useState } from 'react'
import moment from 'moment'
import { dummyUserData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {

    const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');
    const [liked, setLiked] = useState(post.likes_count || []);
    const currentUser = useSelector((state) => state.user.value)

    const { getToken } = useAuth();

    const handleLike = async () => {

        try {
            const { data } = await api.post('/api/post/like', { postId: post._id },
                {
                    headers: { Authorization: `Bearer ${await getToken()}` }
                }
            )

            if (data.success) {
                toast.success(data.message)
                setLiked(prev => {
                    if (prev.includes(currentUser._id)) {
                        return prev.filter(id => id !== currentUser._id)
                    }
                    else {
                        return [...prev, currentUser._id]
                    }
                })
            }
            else {
                toast(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const navigate = useNavigate()

    return (
        <div className='bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4 w-full max-w-2xl hover:shadow-md transition-shadow duration-300'>
            {/* User Post */}
            <div onClick={() => navigate('/profile/' + post.user._id)} className="inline-flex items-center gap-3 cursor-pointer group">
                <img src={post.user.profile_picture} alt="" className="w-11 h-11 rounded-full shadow-sm ring-2 ring-transparent group-hover:ring-indigo-100 transition-all object-cover" />
                <div>
                    <div className='flex items-center space-x-1'>
                        <span className='font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors'>{post.user.full_name}</span>
                        <BadgeCheck className='w-4 h-4 text-blue-500' />
                    </div>
                    <div className='text-xs text-slate-500 font-medium'>@{post.user.username} • {moment(post.createdAt).fromNow()}</div>
                </div>
            </div>
            {/* Content */}
            {post.content && (
                <div className='text-slate-700 text-[15px] leading-relaxed whitespace-pre-line' dangerouslySetInnerHTML={{ __html: postWithHashtags }}></div>
            )}
            {/* Images */}
            {post.image_urls && post.image_urls.length > 0 && (
                <div className='grid grid-cols-2 gap-2 mt-2'>
                    {post.image_urls.map((url, index) => (
                        <img key={index} src={url} alt="" className={`w-full h-56 object-cover rounded-xl border border-slate-100 shadow-sm ${post.image_urls.length === 1 ? "col-span-2 h-auto max-h-96" : ""}`} />
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className='flex items-center gap-6 text-slate-500 text-sm pt-4 mt-2 border-t border-slate-100'>
                <div onClick={handleLike} className='flex items-center gap-1.5 cursor-pointer hover:text-red-500 transition-colors group'>
                    <Heart
                        className={`w-5 h-5 group-hover:scale-110 transition-transform ${liked.includes(currentUser._id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    <span className='font-medium'>{liked.length}</span>
                </div>

                <div className='flex items-center gap-1.5 cursor-pointer hover:text-indigo-500 transition-colors group'>
                    <MessageCircle className='w-5 h-5 group-hover:scale-110 transition-transform' />
                    <span className='font-medium'>{12}</span>
                </div>

                <div className='flex items-center gap-1.5 cursor-pointer hover:text-green-500 transition-colors group'>
                    <Share2 className='w-5 h-5 group-hover:scale-110 transition-transform' />
                    <span className='font-medium'>{7}</span>
                </div>
            </div>
        </div>
    )
}

export default PostCard