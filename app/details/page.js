import { Suspense } from "react";
import DetailsClient from "./DetailsClient";

export default function DetailsPageWrapper() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading…</div>}>
      <DetailsClient />
    </Suspense>
  );
}
