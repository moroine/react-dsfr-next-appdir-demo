import { defineConfig } from "@playwright/test";
import { rmSync } from "fs";
import { join as pathJoin } from "path";

const appDirPath = pathJoin(__dirname, "..");

// Le cache de compilation de Next (`.next`) peut servir indéfiniment une
// version compilée d'avant de @codegouvfr/react-dsfr : use-react-dsfr.sh
// remplace le paquet sans changer son numéro de version. `.next` est donc
// supprimé au chargement de cette configuration, avant que Playwright ne
// démarre le serveur, et aucun serveur déjà lancé n'est réutilisé.
// `TEST_WORKER_INDEX` n'est défini que dans les processus « worker », qui
// rechargent eux aussi cette configuration alors que le serveur tourne déjà.
if (process.env.TEST_WORKER_INDEX === undefined) {
    rmSync(pathJoin(appDirPath, ".next"), { recursive: true, force: true });
}

export default defineConfig({
    testDir: ".",
    // Le serveur de dev compile chaque route à sa première requête, en plus
    // du délai de streaming de 1,5 s.
    timeout: 120_000,
    use: {
        baseURL: "http://localhost:3000",
        // Chrome système : évite le téléchargement d'un navigateur.
        channel: "chrome"
    },
    webServer: {
        // Serveur de DÉVELOPPEMENT, délibérément : React ne signale les
        // divergences d'hydratation qu'en développement.
        command: "npx --yes yarn@1.22.22 dev",
        cwd: appDirPath,
        url: "http://localhost:3000/no-streaming",
        reuseExistingServer: false,
        timeout: 180_000
    }
});
