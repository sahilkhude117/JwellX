import SidebarContainer  from "../components/SidebarContainer";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <SidebarContainer>{children}</SidebarContainer>
    </div>
  );
}



