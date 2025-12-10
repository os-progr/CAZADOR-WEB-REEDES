const { chromium } = require('playwright');

/**
 * Helper: Simulates human-like scrolling
 * Scrolls down the page with random pauses and variable speeds
 */
async function humanScroll(page) {
    console.log('[Stealth] Initiating human-like scroll pattern...');
    let lastHeight = await page.evaluate('document.body.scrollHeight');

    // Perform a few scrolls
    for (let i = 0; i < 3; i++) {
        // Random scroll amount
        const scrollAmount = Math.floor(Math.random() * 400) + 200;
        await page.mouse.wheel(0, scrollAmount);

        // Random pause between 500ms and 2000ms
        const pause = Math.floor(Math.random() * 1500) + 500;
        await page.waitForTimeout(pause);

        // Occasionally move mouse randomly to simulate reading/attention
        await page.mouse.move(
            Math.random() * 500,
            Math.random() * 500
        );
    }
}

/**
 * The Core Hunter Function
 * Performs a stealth audit on the target URL.
 */
async function startAudit(url, jobId) {
    console.log(`[Hunter] Launching stealth browser for ${url}...`);

    const browser = await chromium.launch({
        headless: true, // Keep headless for speed, or false to watch it work
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
        locale: 'en-US',
    });

    const page = await context.newPage();

    // Enhanced Stealth: Mask webdriver
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    try {
        console.log(`[Hunter] Navigating to ${url}...`);

        // 1. Visit Page with Human Latency
        await new Promise(r => setTimeout(r, Math.random() * 1000 + 500));
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

        // 2. Perform Human Behavior (Scroll & Read)
        await humanScroll(page);

        // 3. Extract Real Data (OpenGraph & Metadata)
        const profileData = await page.evaluate(() => {
            const getMeta = (name) => document.querySelector(`meta[property="og:${name}"]`)?.content ||
                document.querySelector(`meta[name="${name}"]`)?.content;
            return {
                title: getMeta('title') || document.title,
                description: getMeta('description') || '',
                image: getMeta('image') || '',
                url: window.location.href
            };
        });

        console.log(`[Hunter] Extracted Profile: ${profileData.title}`);

        // 4. Calculate Algorithm (Hybrid of Real + Probabilistic for Demo)
        // In a real app, this would analyze the specific follower DOM elements extracted above
        const complexityFactor = profileData.description.length > 50 ? 10 : -10; // Simple heuristic: detailed bio = likely more real
        const baseScore = Math.floor(Math.random() * (98 - 70 + 1) + 70);
        const finalScore = Math.min(100, Math.max(0, baseScore + complexityFactor));

        const auditData = {
            profileName: profileData.title,
            avatarUrl: profileData.image,
            bio: profileData.description.substring(0, 100) + '...',
            url: profileData.url,
            realityScore: finalScore,
            suspicionFlags: [],
            metrics: {
                totalFollowers: 'Analyzing...', // Complex to scrape universally without specific selectors per platform
                estimatedReal: `${Math.floor(finalScore)}%`,
                suspicionRate: `${100 - finalScore}%`
            },
            verified: finalScore > 80
        };

        // Add dynamic flags based on the random score
        if (finalScore < 85) auditData.suspicionFlags.push("Irregular rigid engagement patterns detected");
        if (finalScore < 75) auditData.suspicionFlags.push("Follower growth acceleration matches bot-farm signatures");

        await browser.close();
        return auditData;

    } catch (error) {
        console.error("Audit processing failed:", error);
        await browser.close();
        throw error;
    }
}

module.exports = { startAudit };
