import { SignUp } from "@clerk/nextjs";

// export default function SignUpPage({
//   params,
//   searchParams,
// }: {
//   params: { slug: string };
//   // searchParams: { [key: string]: string | string[] | undefined };
//   searchParams: Record<string, string | string[] | undefined>;
// }) {
export default function SignUpPage() {
  return <SignUp />;
}
