'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Heart, Star, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="relative isolate pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-8 flex justify-center">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 bg-white/50 backdrop-blur-sm">
                  Announcing our new secure payment system. <Link href="/login" className="font-semibold text-blue-600"><span className="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></Link>
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-gray-900 via-gray-800 to-gray-600">
                Don't Buy Tools.<br />Just Share Them.
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Access professional-grade tools for your projects without the high cost of ownership.
                Join thousands of makers sharing their idle tools securely.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/tools"
                  className="rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-xl hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 btn-primary flex items-center gap-2"
                >
                  Browse Marketplace <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/register" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors">
                  List Your Tools <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Mockup / Visual */}
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 p-8 text-center text-gray-400">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Build Faster, Spend Less</h3>
                  <p className="mb-8">Connect with neighbors and get the job done.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl">1</div>
                      <div>
                        <div className="font-bold text-gray-900">Search</div>
                        <div className="text-sm">Find tools nearby</div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-xl">2</div>
                      <div>
                        <div className="font-bold text-gray-900">Book</div>
                        <div className="text-sm">Reserve instantly</div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-xl">3</div>
                      <div>
                        <div className="font-bold text-gray-900">Pick Up</div>
                        <div className="text-sm">Get to work</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Why ToolShare?</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to build with confidence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Access</h3>
            <p className="text-gray-500 leading-relaxed">
              Need a drill right now? Find tools available for immediate pickup in your neighborhood. No 2-day shipping waits.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Verified & Secure</h3>
            <p className="text-gray-500 leading-relaxed">
              Every user is ID-verified. We also hold deposits to ensure your tools are returned safely and on time.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="h-12 w-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
            <p className="text-gray-500 leading-relaxed">
              Join a community of makers. Rate your experience, leave reviews, and help others build amazing things.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials / Social Proof */}
      <div className="bg-gray-900 py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-center mb-16">Trusted by makers everywhere</h2>
            <figure className="mt-10">
              <blockquote className="text-center text-xl font-semibold leading-8 text-gray-300 sm:text-2xl sm:leading-9">
                <p>“ToolShare completely changed how I approach DIY. I rented a tile saw for $20 instead of buying one for $300. The owner even showed me how to use it!”</p>
              </blockquote>
              <figcaption className="mt-10">
                <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                  <div className="font-semibold text-white">Alex Johnson</div>
                  <svg viewBox="0 0 2 2" width={3} height={3} aria-hidden="true" className="fill-gray-500">
                    <circle cx={1} cy={1} r={1} />
                  </svg>
                  <div className="text-gray-400">Home Renovator</div>
                </div>
                <div className="flex justify-center gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />)}
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to start your project?
              <br />
              Join ToolShare today.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Sign up in seconds and browse tools near you. Or list your own tools and start earning.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Started
              </Link>
              <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
          <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
            <div className="pb-6">
              <a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900">About</a>
            </div>
            <div className="pb-6">
              <a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Blog</a>
            </div>
            <div className="pb-6">
              <a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Jobs</a>
            </div>
            <div className="pb-6">
              <a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Press</a>
            </div>
            <div className="pb-6">
              <a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Accessibility</a>
            </div>
            <div className="pb-6">
              <a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Partners</a>
            </div>
          </nav>
          <p className="mt-10 text-center text-xs leading-5 text-gray-500">
            &copy; 2026 ToolShare, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
