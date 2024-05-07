import { DeafultSidebar } from "./DeafultSidebar";
import Footer from "./Footer";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  Sidebar?: React.FC;
}

const SimpleLayout = ({ children, Sidebar = DeafultSidebar }: LayoutProps) => {
  return (
    <div className="layout">
      <Header />
      <Sidebar />
      <main className="main">{children}</main>
      <Footer />
    </div>
  );
};

// const SimpleLayout: React.FC<LayoutProps> = ({ children ,Sidebar=DeafultSidebar }) => {
//   return (
//     <div className="layout">
//       <Header />
//       <Sidebar />
//       <main className="main">{children}</main>
//       <Footer />
//     </div>
//   );
// };

export default SimpleLayout;
