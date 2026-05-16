import BottomNav from "./BottomNav";

interface PageWrapperProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export default function PageWrapper({ children, noPadding }: PageWrapperProps) {
  return (
    <>
      <main className={`flex-1 overflow-y-auto ${noPadding ? "" : "pb-20"}`}>
        {children}
      </main>
      <BottomNav />
    </>
  );
}
