import { PageHeader } from "@/components/page-header";
import { AudioTourListener } from "./AudioTourListener";

export const dynamic = "force-dynamic";

export default function AudioTourPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        description="Join the shared playback channel for pre-recorded tour clips."
        title="Audio Tour"
      />

      <AudioTourListener />
    </main>
  );
}
