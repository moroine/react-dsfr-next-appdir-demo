import { test, type Browser } from "@playwright/test";
import { appendFileSync, mkdirSync, writeFileSync } from "fs";
import { join as pathJoin } from "path";

// Relevé, pas un test : charge chaque route et note les messages
// d'hydratation, sans jamais échouer. Sert à comparer des versions de
// react-dsfr (voir README.md). Écrit results/summary.md, repris dans le
// résumé de la CI, et results/sweep.json.

const FAMILIES = [
    "accordion",
    "accordion-expanded",
    "table",
    "tab",
    "segmented",
    "button",
    "range",
    "tooltip",
    "breadcrumb",
    "card",
    "checkbox",
    "header",
    "modal",
    "navigation",
    "password",
    "sidemenu",
    "tag",
    "tile",
    "toggle"
];

const ROUTES = [
    "/no-streaming",
    "/streaming",
    "/streaming-without-start",
    "/streaming-client",
    ...FAMILIES.flatMap(family => [
        `/streaming/family/${family}`,
        `/streaming-client/family/${family}`
    ])
];

const HYDRATION_PATTERNS = [
    "A tree hydrated but some attributes",
    "didn't match",
    "did not match",
    "Extra attributes from the server",
    "Hydration failed",
    "There was an error while hydrating"
];

const isHydrationMessage = (text: string) =>
    HYDRATION_PATTERNS.some(pattern => text.includes(pattern));

type Measure = {
    route: string;
    warnings: number;
    errors: number;
    /** Éléments de la vitrine instrumentés par le moteur (data-fr-js-*). */
    instrumented: number | undefined;
    /** Lignes du diff d'hydratation imprimé par React. */
    diff: string[];
};

async function measure(browser: Browser, baseURL: string, route: string): Promise<Measure> {
    const context = await browser.newContext();
    const page = await context.newPage();
    const warnings: string[] = [];
    const errors: string[] = [];

    page.on("console", message => {
        if (isHydrationMessage(message.text())) warnings.push(message.text());
    });
    page.on("pageerror", error => {
        if (isHydrationMessage(error.message)) errors.push(error.message);
    });

    let instrumented: number | undefined;
    try {
        await page.goto(baseURL + route, { waitUntil: "commit" });
        await page.getByTestId("dsfr-showcase").waitFor({ state: "attached", timeout: 60_000 });
        // Laisse au moteur le temps de rejouer ses mutations (rAF) et aux
        // erreurs tardives d'arriver.
        await page.waitForTimeout(1500);
        instrumented = await page.evaluate(
            () =>
                [...document.querySelectorAll('[data-testid="dsfr-showcase"] *')].filter(element =>
                    element.getAttributeNames().some(name => name.startsWith("data-fr-js-"))
                ).length
        );
    } catch {
        instrumented = undefined;
    }
    await context.close();

    const diff = [
        ...new Set(
            [...warnings, ...errors].flatMap(text =>
                text
                    .split("\n")
                    .filter(line => /^[+-]\s+[a-zA-Z{"]/.test(line))
                    .map(line => line.replace(/\s+/g, " ").trim())
            )
        )
    ];

    return { route, warnings: warnings.length, errors: errors.length, instrumented, diff };
}

test("relevé des divergences d'hydratation", async ({ browser, baseURL }) => {
    test.setTimeout(30 * 60_000);

    const measures: Measure[] = [];
    for (const route of ROUTES) measures.push(await measure(browser, baseURL!, route));

    const resultsDirPath = pathJoin(__dirname, "results");
    mkdirSync(resultsDirPath, { recursive: true });
    writeFileSync(pathJoin(resultsDirPath, "sweep.json"), JSON.stringify(measures, null, 2));

    const label = process.env.REACT_DSFR_LABEL ?? "react-dsfr installé";
    const summary = [
        `### ${label}`,
        "",
        "| Route | Avertissements | Erreurs | Éléments instrumentés |",
        "|---|---|---|---|",
        ...measures.map(
            ({ route, warnings, errors, instrumented }) =>
                `| \`${route}\` | ${warnings} | ${errors} | ${instrumented ?? "page non chargée"} |`
        ),
        ""
    ].join("\n");

    writeFileSync(pathJoin(resultsDirPath, "summary.md"), summary);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    console.log(summary);
});
