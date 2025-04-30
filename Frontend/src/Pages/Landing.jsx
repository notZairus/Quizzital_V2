

import { FaBrain, FaRobot, FaShieldAlt, FaChartLine, FaFolderOpen } from 'react-icons/fa';
import logo from "../assets/logo/logo-no-name.png";
import { useNavigate } from "react-router-dom";


export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between p-4 shadow-md">
        <div className="flex items-start space-x-2">
          {/* Placeholder for Logo */}
          <div className="w-12 aspect-square rounded-full animate-bounce">
            <img src={logo} alt="" />
          </div>
          <h1 className="text-3xl font-bold text-[#38C6E0]">Quizzital</h1>
        </div>
        {/* <nav className="hidden md:flex space-x-6">
          <a href="#objectives" className="text-gray-600 hover:text-[#38C6E0]">Objectives</a>
          <a href="#contact" className="text-gray-600 hover:text-[#38C6E0]">Contact</a>
        </nav> */}
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col justify-center items-center text-center p-8">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#38C6E0]">Revolutionize Digital Learning</h2>
        <p className="text-gray-600 text-lg max-w-2xl mb-6">
          Quizzital empowers educators with AI-driven quizzes, secure assessments, and actionable analytics — all in one platform.
        </p>
        <button onClick={() => navigate('/login')} className="bg-[#38C6E0] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#2cb0c8] transition">
          Get Started
        </button>
      </section>

      {/* Objectives Section */}
      <section id="objectives" className="py-12 bg-[#f9f9f9]">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-[#38C6E0] mb-10">Objectives</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <FaBrain className="text-4xl text-[#38C6E0] mb-4" />
              <h4 className="text-xl font-semibold mb-2">Enhance Digital Learning</h4>
              <p className="text-gray-600">Seamless platform for professors to create and manage quizzes within virtual classrooms.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <FaRobot className="text-4xl text-[#38C6E0] mb-4" />
              <h4 className="text-xl font-semibold mb-2">Automate Quiz Generation</h4>
              <p className="text-gray-600">Leverage AI to generate quiz questions, minimizing manual effort.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <FaShieldAlt className="text-4xl text-[#38C6E0] mb-4" />
              <h4 className="text-xl font-semibold mb-2">Ensure Secure Assessments</h4>
              <p className="text-gray-600">Implement question randomization to prevent memorization and cheating.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <FaChartLine className="text-4xl text-[#38C6E0] mb-4" />
              <h4 className="text-xl font-semibold mb-2">Improve Performance Tracking</h4>
              <p className="text-gray-600">Visual analytics to help assess individual and classroom-wide progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#38C6E0] text-white text-center py-6 mt-8">
        <p>© 2025 Quizzital. All rights reserved.</p>
      </footer>
    </div>
  );
}
