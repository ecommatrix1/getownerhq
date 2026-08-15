import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Dumbbell, Users, Landmark, Sparkles } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar onNavigate={onNavigate} currentRoute="/about" />

      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 md:p-12">
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">About Us</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Empowering Gym Owners Across India</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">Our Mission</span>
              </h2>
              <p>
                At **getOwnerHQ**, our mission is simple: to help gym owners reclaim their time and stop losing revenue to manual tracking. We noticed that many local fitness centers in India struggle with maintaining member spreadsheets, tracking renewal dates, and manually chasing dues.
              </p>
              <p>
                We built getOwnerHQ as an all-in-one software solution that automates member self-registration via simple QR codes and simplifies the renewal notification workflow, keeping gym operations fast, modern, and efficient.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">Why getOwnerHQ?</span>
              </h2>
              <p>
                Unlike bloated, complex enterprise gym management systems that cost a fortune, getOwnerHQ is designed to be lean and intuitive:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>**Scan to Join:** Let members sign up themselves by scanning a custom QR code at your gym.</li>
                <li>**Automated Status Checks:** Get a bird's eye view of who is active, whose membership is expiring, and who is overdue.</li>
                <li>**WhatsApp Integration:** Send friendly reminder cards directly over WhatsApp in a single click.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">Our Team</span>
              </h2>
              <p>
                getOwnerHQ is created and maintained by **FounderKraft**. We are a software development team based out of **Assam, India**, dedicated to building highly practical utility tools for small and medium businesses.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">Contact Us</span>
              </h2>
              <p>
                Have ideas on how we can make getOwnerHQ better for your gym? We would love to chat! Reach out to us anytime:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-4 space-y-2 text-sm font-medium text-slate-700">
                <p><span className="text-slate-400">Phone / WhatsApp:</span> <a href="tel:+918876661110" className="text-blue-600 hover:underline">+91 8876661110</a></p>
                <p><span className="text-slate-400">Email:</span> founderkraft@gmail.com</p>
                <p><span className="text-slate-400">HQ Location:</span> Assam, India</p>
              </div>
            </section>

          </div>

        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
