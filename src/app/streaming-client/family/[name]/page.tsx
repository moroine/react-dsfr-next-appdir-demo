import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ClientShowcase } from "../../../../streaming/ClientShowcase";
import { getDsfrFamily } from "../../../../streaming/dsfr-families";
import { StartDsfrOnHydration } from "../../../../dsfr-bootstrap";

export const dynamic = "force-dynamic";

// Variante de /streaming/family/[name] où la famille est rendue par un Client
// Component.
async function SlowFamily({ name }: { name: string }) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (getDsfrFamily(name) === undefined) {
        notFound();
    }

    return <ClientShowcase familyId={name} />;
}

export default async function StreamingClientFamilyPage({
    params
}: {
    params: Promise<{ name: string }>;
}) {
    const { name } = await params;

    return (
        <main>
            <StartDsfrOnHydration />
            <h1 data-testid="shell">Shell immédiat</h1>
            <Suspense fallback={<p data-testid="fallback">Chargement…</p>}>
                <SlowFamily name={name} />
            </Suspense>
        </main>
    );
}
