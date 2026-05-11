import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask Terralens · Conversational climate AI",
  description:
    "Ask anything about local climate — past or projected. The agent picks the right tool, fetches the data, and writes you the answer.",
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
