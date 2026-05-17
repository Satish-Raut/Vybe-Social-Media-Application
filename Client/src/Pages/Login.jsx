import { assets } from '../assets/assets'
import { Star } from 'lucide-react'
import { SignIn } from '@clerk/react'

const Login = () => {
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      {/* Background Image */}
      <img src={assets.bgImage} alt="" className='absolute top-0 left-0 -z-1 w-full h-full object-cover' />

      {/* Left side: Branding */}
      <div className='flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-20 xl:pl-40'>
        <img src={assets.logo2} alt="" className='h-12 object-contain drop-shadow-md' />
        
        <div className='backdrop-blur-md bg-white/40 p-8 rounded-3xl shadow-xl border border-white/50 max-w-lg'>
          <div className='flex items-center gap-3 mb-6'>
            <img src={assets.group_users} alt="" className='h-10 drop-shadow' />
            <div>
              <div className='flex'>
                {
                  Array(5).fill(0).map((_, i) =>
                    (<Star key={i} className='size-4 md:size-4.5 text-transparent fill-amber-500 drop-shadow-sm' />))
                }
              </div>
              <p className='text-slate-800 font-medium'>
                Used by 12k+ developers
              </p>
            </div>
          </div>

          <h1 className='text-4xl md:text-6xl md:pb-2 font-extrabold bg-gradient-to-br from-indigo-950 via-indigo-800 to-purple-800 bg-clip-text text-transparent drop-shadow-sm leading-tight'>
            More than just friends, truly connect.
          </h1>

          <p className='text-lg md:text-xl text-indigo-900 font-medium mt-4'>Join the global community on Vybe.</p>
        </div>

        <span className='md:h-10'></span>
      </div>

      {/* Right side login form */}
      <div className='flex-1 flex items-center justify-center p-6 sm:p-10 backdrop-blur-sm bg-white/10'>
        <div className='shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/50'>
          <SignIn />
        </div>
      </div>
    </div>
  )
}

export default Login
