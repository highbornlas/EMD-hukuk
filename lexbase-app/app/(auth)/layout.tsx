/* Auth layout — artık redirect olduğu için basit passthrough */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
