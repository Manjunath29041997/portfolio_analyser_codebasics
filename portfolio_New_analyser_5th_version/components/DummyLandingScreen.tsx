import React from 'react';
import { Mail, Briefcase, FileText, Globe, Gem, Database, LayoutDashboard, Terminal, Linkedin, Github } from 'lucide-react';

interface DummyLandingScreenProps {
  onAnalyseClick: () => void;
}

export default function DummyLandingScreen({ onAnalyseClick }: DummyLandingScreenProps) {
  return (
    <div className="min-h-screen bg-[#f4f7f6] relative overflow-hidden font-sans">
      {/* Background Geometric Shapes (Mocks the left/right triangles from design) */}
      <div className="absolute top-0 left-0 w-[40vw] h-full overflow-hidden pointer-events-none">
         {/* Top Left Pattern */}
         <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#00b4d8] rounded-br-[100px] opacity-80 mix-blend-multiply transform rotate-45"></div>
         <div className="absolute top-40 -left-10 w-60 h-60 bg-[#0077b6] rounded-[40px] opacity-70 mix-blend-multiply transform -rotate-12"></div>
         <div className="absolute top-80 left-20 w-40 h-40 bg-[#90e0ef] rounded-[20px] opacity-60 mix-blend-multiply transform rotate-45"></div>
      </div>
      
      <div className="absolute bottom-0 right-0 w-[40vw] h-full overflow-hidden pointer-events-none">
         {/* Bottom Right Pattern */}
         <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#0077b6] rounded-tl-[120px] opacity-80 mix-blend-multiply transform rotate-12"></div>
         <div className="absolute bottom-40 right-20 w-64 h-64 bg-[#00b4d8] rounded-[50px] opacity-70 mix-blend-multiply transform -rotate-45"></div>
      </div>

      {/* Top Banner mock */}
      <div className="w-full bg-[#1e4b85] h-8 shadow-sm"></div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          
          {/* Left Column: Profile Card */}
          <div className="w-full md:w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="p-8 flex flex-col items-center border-b border-gray-100 relative">
                {/* Mock photo background */}
                <div className="w-32 h-32 bg-[#e2e8f0] rounded-[32px] mb-6 relative overflow-hidden flex items-center justify-center shadow-inner">
                   {/* Fallback silhouette if no image is available */}
                   <svg className="w-20 h-20 text-[#cbd5e1] mt-4" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                   </svg>
                </div>
                
                <h1 className="text-2xl font-bold text-[#1e293b] text-center leading-tight mb-2">
                  Rajvardhan<br />Singh Parmar
                </h1>
                
                <span className="px-4 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-sm font-semibold tracking-wide mt-2">
                  Data Analyst
                </span>

                <div className="flex gap-4 mt-6">
                  <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"><Linkedin size={20} /></span>
                  <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"><Github size={20} /></span>
                </div>
              </div>

              <div className="p-6 bg-[#f8fafc]">
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 font-medium">
                  <span className="text-gray-400"><Gem size={16} /></span>
                  +91 8318017170
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-6 font-medium truncate">
                  <span className="text-gray-400"><Mail size={16} /></span>
                  rajvardhansinghparmar15...
                </div>

                <button className="w-full py-3.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl font-bold text-sm shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] transition-all flex items-center justify-center gap-2">
                  Resume <span className="text-xs">↓</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* Greeting Header */}
            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
               <div className="absolute right-0 top-0 bottom-0 w-16 bg-white border-l border-gray-50 flex flex-col items-center py-4 gap-6 text-gray-300">
                  <span className="cursor-pointer hover:text-gray-500 transition-colors"><Globe size={20} /></span>
                  <span className="cursor-pointer hover:text-gray-500 transition-colors"><Briefcase size={20} /></span>
                  <span className="cursor-pointer hover:text-gray-500 transition-colors"><FileText size={20} /></span>
                  <span className="cursor-pointer hover:text-gray-500 transition-colors"><Gem size={20} /></span>
                  <span className="cursor-pointer hover:text-gray-500 transition-colors"><Mail size={20} /></span>
               </div>

              <p className="text-gray-500 text-lg mb-1 font-medium">Hello, I am</p>
              <h2 className="text-4xl pr-16 font-bold text-[#0f172a] tracking-tight">Rajvardhan Singh Parmar.</h2>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform">
                 <div className="text-green-600 bg-green-50 p-3 rounded-xl"><FileText size={28} /></div>
                 <div className="font-bold text-[#0f172a] text-sm"><span className="text-[#3b82f6] text-xl mr-1">1</span> Excel Project</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform">
                 <div className="text-yellow-500 bg-yellow-50 p-3 rounded-xl"><LayoutDashboard size={28} /></div>
                 <div className="font-bold text-[#0f172a] text-sm"><span className="text-[#3b82f6] text-xl mr-1">7</span> PowerBI Projects</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform">
                 <div className="text-blue-500 bg-blue-50 p-3 rounded-xl"><Database size={28} /></div>
                 <div className="font-bold text-[#0f172a] text-sm"><span className="text-[#3b82f6] text-xl mr-1">2</span> SQL Projects</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform">
                 <div className="text-yellow-600 bg-yellow-50 p-3 rounded-xl"><Terminal size={28} /></div>
                 <div className="font-bold text-[#0f172a] text-sm"><span className="text-[#3b82f6] text-xl mr-1">1</span> Python Project</div>
              </div>
            </div>

            {/* About Me */}
            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-2xl font-bold text-[#0f172a] mb-6">About Me</h3>
              <div className="text-[#334155] space-y-5 leading-relaxed text-sm font-medium">
                <p>
                  👋 Welcome to my portfolio!<br />
                  I'm a Data Analyst passionate about uncovering insights that drive smarter business decisions.
                </p>
                <p>
                  🎓 With a Bachelor's degree in Business Analytics, I built a strong foundation in data interpretation, business strategy, and problem-solving. Early on, I discovered my knack for digging into data--and that curiosity became my path.
                </p>
                <p>
                  💼 As a Data Analyst intern at AiSO Technologies, I worked with real datasets, built dashboards, and delivered insights that supported key business decisions.
                </p>
                <p>
                  🔨 I'm proficient in MySQL, Power BI, Tableau, Python, Alteryx, and Advanced Excel. I use these tools to clean, analyze, and visualize data--turning it into clear strategies.
                </p>
                <p>
                  📊 I've delivered independent business projects, featured in this portfolio, showcasing my technical skills and commitment to learning.
                </p>
                <p>
                  💡 I thrive on solving challenges and uncovering insights. Explore my work to see how I turn data into decisions.
                </p>
              </div>

              {/* Key Skills */}
              <h3 className="text-2xl font-bold text-[#0f172a] mt-10 mb-4">Key Skills</h3>
              <div className="flex flex-wrap gap-2">
                {['POWER BI', 'MYSQL', 'EXCEL', 'PYTHON', 'ALTERYX', 'TABLEAU'].map(skill => (
                  <span key={skill} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 tracking-wider">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Required Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
         <button 
           onClick={onAnalyseClick}
           className="w-32 h-32 rounded-full bg-gradient-to-br from-[#4c1d95] via-[#31106e] to-[#1e0a45] border-[6px] border-[#fbb400] shadow-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300 group overflow-hidden relative"
         >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-white font-black text-xl leading-tight text-center z-10 px-2 tracking-wide font-display">
              Analyse<br/>
              <span className="text-[13px] text-[#fbb400] mt-1 block">Your Portfolio</span>
            </span>
         </button>
      </div>

    </div>
  );
}
