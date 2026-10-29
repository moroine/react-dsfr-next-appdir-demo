import { DsfrShowcase } from "../../streaming/DsfrShowcase";
import { StartDsfrOnHydration } from "../../dsfr-bootstrap";

export const dynamic = "force-dynamic";

export default function NoStreamingPage() {
    return (
        <main>
            <StartDsfrOnHydration />
            <h1 data-testid="shell">Shell immédiat</h1>
            <DsfrShowcase />
        </main>
    );
}
