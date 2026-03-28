import { JoinUI } from "@/components/quiz/JoinUI";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ pin?: string; error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const prefilledPin = resolvedParams.pin || "";
  const errorMessage = resolvedParams.error || "";

  return (
    <JoinUI 
      prefilledPin={prefilledPin} 
      errorMessage={errorMessage}
    />
  );
}
