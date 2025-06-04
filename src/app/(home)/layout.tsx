import SidebarContainer from "../components/SidebarContainer";
import Header from "../components/Header";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <SidebarContainer>
        <Header />
        {children}
      </SidebarContainer>
    </div>
  );
}


