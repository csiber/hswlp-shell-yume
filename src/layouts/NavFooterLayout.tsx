import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';

export default async function NavFooterLayout({
  children,
  renderFooter = true,
}: Readonly<{
  children: React.ReactNode;
  renderFooter?: boolean;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 px-3 pb-6 pt-4 md:px-6">
        {children}
      </main>
      {renderFooter && <Footer />}
    </div>
  );
}
