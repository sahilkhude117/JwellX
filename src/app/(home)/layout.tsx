import SidebarContainer from "../components/SidebarContainer";
import Header from "../components/Header";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
      <SidebarContainer>
          <Header />
          <div className="flex-1">
            {children}
          </div>
      </SidebarContainer>
    </div>
  );
}


