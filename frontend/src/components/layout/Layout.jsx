import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E8] dark:bg-gray-950 transition-colors">
      <AnnouncementBar />
      <Navbar />
      {/* pb-20 on mobile reserves space for the bottom nav bar */}
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
