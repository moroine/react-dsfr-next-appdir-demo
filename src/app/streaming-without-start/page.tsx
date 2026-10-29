import { Suspense } from "react";
import { DsfrShowcase } from "../../streaming/DsfrShowcase";

export const dynamic = "force-dynamic";

async function SlowShowcase() {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return <DsfrShowcase />;
}

// Seule page de test qui ne monte pas <StartDsfrOnHydration /> : avec la
// PR #2 de react-dsfr, DsfrProvider démarre le moteur à lui seul.
export default function StreamingWithoutStartPage() {
    return (
        <main>
            <h1 data-testid="shell">Shell immédiat</h1>
            <Suspense fallback={<p data-testid="fallback">Chargement…</p>}>
                <SlowShowcase />
            </Suspense>
        </main>
    );
}
