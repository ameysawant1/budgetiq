import React from "react";
const Page = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
  <section className="relative overflow-hidden h-[calc(100vh-64px)]">
        {/* Background gradient */}
  <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#0b1220] via-[#141826] to-[#0d0710]" />
        {/* Decorative blurred shapes */}
        <div
          aria-hidden
          className="absolute -left-24 -top-20 w-[720px] h-[720px] rounded-full bg-[radial-gradient(ellipse_at_center,#16202a,transparent)] opacity-30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-32 top-40 w-[640px] h-[640px] rounded-full bg-[radial-gradient(ellipse_at_center,#0f1730,transparent)] opacity-20 blur-3xl"
        />

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Smart AI-Powered
              <br />
              Budgeting For Your
              <br />
              Financial Future
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Take control of your finances with advanced AI insights,
              intelligent predictions and personalized recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#1e7f8c] text-white px-8 py-3 rounded-lg text-lg hover:bg-[#156169]">
                Get Started for Free <i className="fas fa-arrow-right ml-2"></i>
              </button>
              <button
                type="button"
                className="text-gray-300 px-8 py-3 rounded-lg text-lg hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
