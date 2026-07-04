export type ServicePlan = {
  name: string;
  price: number;
  currency: string;
};

export type CatalogService = {
  id: string;
  name: string;
  category: string;
  plans: ServicePlan[];
};

const EUR = "EUR";

/**
 * Catálogo curado de referencia: precios aproximados y orientativos (mercado España/UE),
 * no viven en la base de datos y no se actualizan solos. Al elegir un plan solo se
 * PRE-RELLENA precio/moneda en el formulario — el usuario puede editarlos libremente.
 */
export const SERVICE_CATALOG: CatalogService[] = [
  // --- Streaming de vídeo ---
  { id: "netflix", name: "Netflix", category: "Streaming de vídeo", plans: [
    { name: "Estándar con anuncios", price: 5.99, currency: EUR },
    { name: "Estándar", price: 13.99, currency: EUR },
    { name: "Premium", price: 19.99, currency: EUR },
  ]},
  { id: "disney-plus", name: "Disney+", category: "Streaming de vídeo", plans: [
    { name: "Estándar con anuncios", price: 5.99, currency: EUR },
    { name: "Estándar", price: 9.99, currency: EUR },
    { name: "Premium", price: 13.99, currency: EUR },
  ]},
  { id: "hbo-max", name: "Max (HBO Max)", category: "Streaming de vídeo", plans: [
    { name: "Básico con anuncios", price: 5.99, currency: EUR },
    { name: "Estándar", price: 9.99, currency: EUR },
    { name: "Premium", price: 13.99, currency: EUR },
  ]},
  { id: "amazon-prime-video", name: "Amazon Prime Video", category: "Streaming de vídeo", plans: [
    { name: "Con Prime", price: 4.99, currency: EUR },
    { name: "Sin anuncios", price: 7.98, currency: EUR },
  ]},
  { id: "movistar-plus", name: "Movistar Plus+", category: "Streaming de vídeo", plans: [
    { name: "Lite", price: 8, currency: EUR },
    { name: "Total", price: 13, currency: EUR },
  ]},
  { id: "atresplayer", name: "Atresplayer", category: "Streaming de vídeo", plans: [
    { name: "Premium", price: 5.99, currency: EUR },
  ]},
  { id: "skyshowtime", name: "SkyShowtime", category: "Streaming de vídeo", plans: [
    { name: "Con anuncios", price: 3.99, currency: EUR },
    { name: "Sin anuncios", price: 6.99, currency: EUR },
  ]},
  { id: "apple-tv-plus", name: "Apple TV+", category: "Streaming de vídeo", plans: [
    { name: "Mensual", price: 9.99, currency: EUR },
  ]},
  { id: "filmin", name: "Filmin", category: "Streaming de vídeo", plans: [
    { name: "Mensual", price: 9.99, currency: EUR },
    { name: "Anual (equiv./mes)", price: 6.66, currency: EUR },
  ]},
  { id: "crunchyroll", name: "Crunchyroll", category: "Streaming de vídeo", plans: [
    { name: "Fan", price: 6.99, currency: EUR },
    { name: "Mega Fan", price: 9.99, currency: EUR },
  ]},
  { id: "paramount-plus", name: "Paramount+", category: "Streaming de vídeo", plans: [
    { name: "Essential", price: 5.99, currency: EUR },
    { name: "Premium", price: 11.99, currency: EUR },
  ]},
  { id: "dazn", name: "DAZN", category: "Streaming de vídeo", plans: [
    { name: "Mensual", price: 19.99, currency: EUR },
    { name: "LaLiga", price: 14.99, currency: EUR },
  ]},
  { id: "espn-plus", name: "ESPN+", category: "Streaming de vídeo", plans: [
    { name: "Mensual", price: 11.99, currency: "USD" },
  ]},
  { id: "peacock", name: "Peacock", category: "Streaming de vídeo", plans: [
    { name: "Premium", price: 7.99, currency: "USD" },
    { name: "Premium Plus", price: 13.99, currency: "USD" },
  ]},
  { id: "hulu", name: "Hulu", category: "Streaming de vídeo", plans: [
    { name: "Con anuncios", price: 9.99, currency: "USD" },
    { name: "Sin anuncios", price: 18.99, currency: "USD" },
  ]},
  { id: "rakuten-tv", name: "Rakuten TV", category: "Streaming de vídeo", plans: [
    { name: "Suscripción", price: 4.99, currency: EUR },
  ]},
  { id: "britbox", name: "BritBox", category: "Streaming de vídeo", plans: [
    { name: "Mensual", price: 8.99, currency: EUR },
  ]},
  { id: "mubi", name: "MUBI", category: "Streaming de vídeo", plans: [
    { name: "Mensual", price: 12.99, currency: EUR },
  ]},
  { id: "curiosity-stream", name: "Curiosity Stream", category: "Streaming de vídeo", plans: [
    { name: "Mensual", price: 4.99, currency: "USD" },
  ]},
  { id: "discovery-plus", name: "Discovery+", category: "Streaming de vídeo", plans: [
    { name: "Con anuncios", price: 4.99, currency: EUR },
    { name: "Sin anuncios", price: 8.99, currency: EUR },
  ]},
  { id: "youtube-premium", name: "YouTube Premium", category: "Streaming de vídeo", plans: [
    { name: "Individual", price: 12.99, currency: EUR },
    { name: "Familiar", price: 22.99, currency: EUR },
  ]},
  { id: "twitch-turbo", name: "Twitch Turbo", category: "Streaming de vídeo", plans: [
    { name: "Mensual", price: 8.99, currency: EUR },
  ]},
  { id: "vix-plus", name: "ViX+", category: "Streaming de vídeo", plans: [
    { name: "Premium", price: 6.99, currency: "USD" },
  ]},
  { id: "fubotv", name: "FuboTV", category: "Streaming de vídeo", plans: [
    { name: "Pro", price: 84.99, currency: "USD" },
  ]},
  { id: "acorn-tv", name: "Acorn TV", category: "Streaming de vídeo", plans: [
    { name: "Mensual", price: 6.99, currency: "USD" },
  ]},

  // --- Música y audio ---
  { id: "spotify", name: "Spotify", category: "Música y audio", plans: [
    { name: "Individual", price: 11.99, currency: EUR },
    { name: "Dúo", price: 16.99, currency: EUR },
    { name: "Familiar", price: 19.99, currency: EUR },
  ]},
  { id: "apple-music", name: "Apple Music", category: "Música y audio", plans: [
    { name: "Individual", price: 10.99, currency: EUR },
    { name: "Familiar", price: 16.99, currency: EUR },
  ]},
  { id: "youtube-music", name: "YouTube Music", category: "Música y audio", plans: [
    { name: "Individual", price: 10.99, currency: EUR },
  ]},
  { id: "amazon-music-unlimited", name: "Amazon Music Unlimited", category: "Música y audio", plans: [
    { name: "Individual", price: 10.99, currency: EUR },
    { name: "Con Prime", price: 9.99, currency: EUR },
  ]},
  { id: "tidal", name: "Tidal", category: "Música y audio", plans: [
    { name: "HiFi", price: 10.99, currency: EUR },
    { name: "HiFi Plus", price: 19.99, currency: EUR },
  ]},
  { id: "deezer", name: "Deezer", category: "Música y audio", plans: [
    { name: "Individual", price: 11.99, currency: EUR },
    { name: "Familiar", price: 19.99, currency: EUR },
  ]},
  { id: "soundcloud-go", name: "SoundCloud Go+", category: "Música y audio", plans: [
    { name: "Mensual", price: 9.99, currency: EUR },
  ]},
  { id: "audible", name: "Audible", category: "Música y audio", plans: [
    { name: "Mensual (1 crédito)", price: 9.99, currency: EUR },
  ]},
  { id: "storytel", name: "Storytel", category: "Música y audio", plans: [
    { name: "Individual", price: 9.99, currency: EUR },
  ]},
  { id: "podimo", name: "Podimo", category: "Música y audio", plans: [
    { name: "Mensual", price: 4.99, currency: EUR },
  ]},
  { id: "pandora-plus", name: "Pandora Plus", category: "Música y audio", plans: [
    { name: "Mensual", price: 4.99, currency: "USD" },
  ]},
  { id: "iheartradio", name: "iHeartRadio Plus", category: "Música y audio", plans: [
    { name: "Mensual", price: 4.99, currency: "USD" },
  ]},
  { id: "qobuz", name: "Qobuz", category: "Música y audio", plans: [
    { name: "Studio Premier", price: 12.99, currency: EUR },
  ]},
  { id: "napster", name: "Napster", category: "Música y audio", plans: [
    { name: "Mensual", price: 10.99, currency: EUR },
  ]},
  { id: "beatport-link", name: "Beatport Link", category: "Música y audio", plans: [
    { name: "Essential", price: 9.99, currency: "USD" },
  ]},

  // --- Almacenamiento en la nube ---
  { id: "google-one", name: "Google One", category: "Almacenamiento en la nube", plans: [
    { name: "100 GB", price: 1.99, currency: EUR },
    { name: "200 GB", price: 2.99, currency: EUR },
    { name: "2 TB", price: 9.99, currency: EUR },
  ]},
  { id: "icloud-plus", name: "iCloud+", category: "Almacenamiento en la nube", plans: [
    { name: "50 GB", price: 0.99, currency: EUR },
    { name: "200 GB", price: 2.99, currency: EUR },
    { name: "2 TB", price: 9.99, currency: EUR },
  ]},
  { id: "dropbox", name: "Dropbox", category: "Almacenamiento en la nube", plans: [
    { name: "Plus", price: 11.99, currency: EUR },
    { name: "Professional", price: 19.99, currency: EUR },
  ]},
  { id: "onedrive", name: "Microsoft OneDrive", category: "Almacenamiento en la nube", plans: [
    { name: "100 GB", price: 2, currency: EUR },
  ]},
  { id: "mega", name: "MEGA", category: "Almacenamiento en la nube", plans: [
    { name: "Pro Lite", price: 5.69, currency: EUR },
    { name: "Pro I", price: 11.29, currency: EUR },
  ]},
  { id: "pcloud", name: "pCloud", category: "Almacenamiento en la nube", plans: [
    { name: "Premium 500GB", price: 4.99, currency: EUR },
  ]},
  { id: "amazon-photos", name: "Amazon Photos", category: "Almacenamiento en la nube", plans: [
    { name: "100 GB", price: 1.99, currency: EUR },
  ]},
  { id: "box", name: "Box", category: "Almacenamiento en la nube", plans: [
    { name: "Personal Pro", price: 11.99, currency: "USD" },
  ]},
  { id: "idrive", name: "IDrive", category: "Almacenamiento en la nube", plans: [
    { name: "5 TB (anual/mes)", price: 5.79, currency: "USD" },
  ]},
  { id: "backblaze", name: "Backblaze", category: "Almacenamiento en la nube", plans: [
    { name: "Personal", price: 9, currency: "USD" },
  ]},

  // --- Productividad y software ---
  { id: "microsoft-365", name: "Microsoft 365", category: "Productividad y software", plans: [
    { name: "Personal", price: 7, currency: EUR },
    { name: "Familiar", price: 10.42, currency: EUR },
  ]},
  { id: "google-workspace", name: "Google Workspace", category: "Productividad y software", plans: [
    { name: "Business Starter", price: 6.9, currency: EUR },
    { name: "Business Standard", price: 13.8, currency: EUR },
  ]},
  { id: "notion", name: "Notion", category: "Productividad y software", plans: [
    { name: "Plus", price: 10, currency: EUR },
    { name: "Business", price: 18, currency: EUR },
  ]},
  { id: "evernote", name: "Evernote", category: "Productividad y software", plans: [
    { name: "Personal", price: 11.99, currency: EUR },
  ]},
  { id: "todoist", name: "Todoist", category: "Productividad y software", plans: [
    { name: "Pro", price: 5, currency: "USD" },
  ]},
  { id: "slack", name: "Slack", category: "Productividad y software", plans: [
    { name: "Pro", price: 7.25, currency: EUR },
  ]},
  { id: "zoom", name: "Zoom", category: "Productividad y software", plans: [
    { name: "Pro", price: 13.99, currency: EUR },
  ]},
  { id: "canva-pro", name: "Canva Pro", category: "Productividad y software", plans: [
    { name: "Individual", price: 11.99, currency: EUR },
  ]},
  { id: "adobe-creative-cloud", name: "Adobe Creative Cloud", category: "Productividad y software", plans: [
    { name: "Un solo app", price: 24.19, currency: EUR },
    { name: "Todas las apps", price: 62.11, currency: EUR },
  ]},
  { id: "adobe-acrobat", name: "Adobe Acrobat Pro", category: "Productividad y software", plans: [
    { name: "Mensual", price: 19.61, currency: EUR },
  ]},
  { id: "lastpass", name: "LastPass", category: "Productividad y software", plans: [
    { name: "Premium", price: 3, currency: "USD" },
  ]},
  { id: "1password", name: "1Password", category: "Productividad y software", plans: [
    { name: "Individual", price: 2.99, currency: "USD" },
    { name: "Familiar", price: 4.99, currency: "USD" },
  ]},
  { id: "dashlane", name: "Dashlane", category: "Productividad y software", plans: [
    { name: "Premium", price: 4.99, currency: "USD" },
  ]},
  { id: "nordvpn", name: "NordVPN", category: "Productividad y software", plans: [
    { name: "Estándar (mensual)", price: 12.99, currency: EUR },
  ]},
  { id: "expressvpn", name: "ExpressVPN", category: "Productividad y software", plans: [
    { name: "Mensual", price: 12.95, currency: "USD" },
  ]},
  { id: "surfshark", name: "Surfshark", category: "Productividad y software", plans: [
    { name: "Mensual", price: 12.95, currency: EUR },
  ]},
  { id: "protonvpn", name: "Proton VPN", category: "Productividad y software", plans: [
    { name: "Plus", price: 9.99, currency: EUR },
  ]},
  { id: "protonmail", name: "Proton Mail", category: "Productividad y software", plans: [
    { name: "Mail Plus", price: 4.99, currency: EUR },
    { name: "Proton Unlimited", price: 12.99, currency: EUR },
  ]},
  { id: "grammarly", name: "Grammarly Premium", category: "Productividad y software", plans: [
    { name: "Mensual", price: 30, currency: "USD" },
  ]},
  { id: "zapier", name: "Zapier", category: "Productividad y software", plans: [
    { name: "Starter", price: 19.99, currency: "USD" },
  ]},
  { id: "trello", name: "Trello", category: "Productividad y software", plans: [
    { name: "Standard", price: 5, currency: "USD" },
  ]},
  { id: "asana", name: "Asana", category: "Productividad y software", plans: [
    { name: "Starter", price: 10.99, currency: EUR },
  ]},
  { id: "monday", name: "Monday.com", category: "Productividad y software", plans: [
    { name: "Básico", price: 9, currency: "USD" },
  ]},

  // --- Inteligencia artificial ---
  { id: "chatgpt-plus", name: "ChatGPT Plus", category: "Inteligencia artificial", plans: [
    { name: "Plus", price: 20, currency: "USD" },
  ]},
  { id: "claude-pro", name: "Claude Pro", category: "Inteligencia artificial", plans: [
    { name: "Pro", price: 18, currency: EUR },
  ]},
  { id: "gemini-advanced", name: "Google Gemini Advanced", category: "Inteligencia artificial", plans: [
    { name: "Google One AI Premium", price: 21.99, currency: EUR },
  ]},
  { id: "perplexity-pro", name: "Perplexity Pro", category: "Inteligencia artificial", plans: [
    { name: "Pro", price: 20, currency: "USD" },
  ]},
  { id: "midjourney", name: "Midjourney", category: "Inteligencia artificial", plans: [
    { name: "Basic", price: 10, currency: "USD" },
    { name: "Standard", price: 30, currency: "USD" },
  ]},
  { id: "github-copilot", name: "GitHub Copilot", category: "Inteligencia artificial", plans: [
    { name: "Individual", price: 10, currency: "USD" },
  ]},
  { id: "notion-ai", name: "Notion AI", category: "Inteligencia artificial", plans: [
    { name: "Add-on", price: 8, currency: "USD" },
  ]},
  { id: "jasper-ai", name: "Jasper AI", category: "Inteligencia artificial", plans: [
    { name: "Creator", price: 39, currency: "USD" },
  ]},
  { id: "copilot-pro", name: "Microsoft 365 Copilot", category: "Inteligencia artificial", plans: [
    { name: "Copilot Pro", price: 22, currency: EUR },
  ]},
  { id: "elevenlabs", name: "ElevenLabs", category: "Inteligencia artificial", plans: [
    { name: "Starter", price: 5, currency: "USD" },
    { name: "Creator", price: 22, currency: "USD" },
  ]},

  // --- Gaming ---
  { id: "xbox-game-pass-ultimate", name: "Xbox Game Pass Ultimate", category: "Gaming", plans: [
    { name: "Ultimate", price: 14.99, currency: EUR },
  ]},
  { id: "pc-game-pass", name: "PC Game Pass", category: "Gaming", plans: [
    { name: "Mensual", price: 11.99, currency: EUR },
  ]},
  { id: "playstation-plus", name: "PlayStation Plus", category: "Gaming", plans: [
    { name: "Essential", price: 8.99, currency: EUR },
    { name: "Extra", price: 13.99, currency: EUR },
    { name: "Premium", price: 16.99, currency: EUR },
  ]},
  { id: "nintendo-switch-online", name: "Nintendo Switch Online", category: "Gaming", plans: [
    { name: "Individual", price: 3.99, currency: EUR },
    { name: "Expansion Pack", price: 7.99, currency: EUR },
  ]},
  { id: "ea-play", name: "EA Play", category: "Gaming", plans: [
    { name: "Mensual", price: 3.99, currency: EUR },
  ]},
  { id: "ubisoft-plus", name: "Ubisoft+", category: "Gaming", plans: [
    { name: "Estándar", price: 14.99, currency: EUR },
  ]},
  { id: "geforce-now", name: "GeForce Now", category: "Gaming", plans: [
    { name: "Performance", price: 10.99, currency: EUR },
    { name: "Ultimate", price: 21.99, currency: EUR },
  ]},
  { id: "amazon-luna", name: "Amazon Luna+", category: "Gaming", plans: [
    { name: "Mensual", price: 9.99, currency: "USD" },
  ]},
  { id: "discord-nitro", name: "Discord Nitro", category: "Gaming", plans: [
    { name: "Básico", price: 2.99, currency: EUR },
    { name: "Nitro", price: 9.99, currency: EUR },
  ]},
  { id: "humble-choice", name: "Humble Choice", category: "Gaming", plans: [
    { name: "Mensual", price: 11.99, currency: "USD" },
  ]},
  { id: "apple-arcade", name: "Apple Arcade", category: "Gaming", plans: [
    { name: "Mensual", price: 6.99, currency: EUR },
  ]},
  { id: "google-play-pass", name: "Google Play Pass", category: "Gaming", plans: [
    { name: "Mensual", price: 4.99, currency: EUR },
  ]},
  { id: "roblox-premium", name: "Roblox Premium", category: "Gaming", plans: [
    { name: "450 Robux/mes", price: 4.99, currency: "USD" },
  ]},
  { id: "fortnite-crew", name: "Fortnite Crew", category: "Gaming", plans: [
    { name: "Mensual", price: 11.99, currency: EUR },
  ]},
  { id: "worldofwarcraft", name: "World of Warcraft", category: "Gaming", plans: [
    { name: "Suscripción mensual", price: 12.99, currency: EUR },
  ]},
  { id: "final-fantasy-xiv", name: "Final Fantasy XIV", category: "Gaming", plans: [
    { name: "Entry", price: 12.99, currency: EUR },
  ]},

  // --- Fitness y salud ---
  { id: "strava", name: "Strava", category: "Fitness y salud", plans: [
    { name: "Suscripción", price: 11.99, currency: EUR },
  ]},
  { id: "myfitnesspal-premium", name: "MyFitnessPal Premium", category: "Fitness y salud", plans: [
    { name: "Mensual", price: 19.99, currency: "USD" },
  ]},
  { id: "peloton-app", name: "Peloton App", category: "Fitness y salud", plans: [
    { name: "App One", price: 12.99, currency: EUR },
  ]},
  { id: "calm", name: "Calm", category: "Fitness y salud", plans: [
    { name: "Anual (equiv./mes)", price: 5.83, currency: "USD" },
  ]},
  { id: "headspace", name: "Headspace", category: "Fitness y salud", plans: [
    { name: "Mensual", price: 12.99, currency: "USD" },
  ]},
  { id: "fitbit-premium", name: "Fitbit Premium", category: "Fitness y salud", plans: [
    { name: "Mensual", price: 8.99, currency: EUR },
  ]},
  { id: "whoop", name: "WHOOP", category: "Fitness y salud", plans: [
    { name: "Membresía", price: 30, currency: "USD" },
  ]},
  { id: "garmin-connect-plus", name: "Garmin Connect+", category: "Fitness y salud", plans: [
    { name: "Mensual", price: 6.99, currency: "USD" },
  ]},
  { id: "nike-training-club", name: "Nike Training Club Premium", category: "Fitness y salud", plans: [
    { name: "Mensual", price: 14.99, currency: "USD" },
  ]},
  { id: "freeletics", name: "Freeletics", category: "Fitness y salud", plans: [
    { name: "Mensual", price: 34.99, currency: EUR },
  ]},
  { id: "8fit", name: "8fit", category: "Fitness y salud", plans: [
    { name: "Mensual", price: 9.99, currency: "USD" },
  ]},
  { id: "noom", name: "Noom", category: "Fitness y salud", plans: [
    { name: "Mensual", price: 70, currency: "USD" },
  ]},
  { id: "weightwatchers", name: "WeightWatchers", category: "Fitness y salud", plans: [
    { name: "Digital", price: 22.99, currency: "USD" },
  ]},
  { id: "sworkit", name: "Sworkit", category: "Fitness y salud", plans: [
    { name: "Premium", price: 9.99, currency: "USD" },
  ]},
  { id: "zwift", name: "Zwift", category: "Fitness y salud", plans: [
    { name: "Mensual", price: 17.99, currency: EUR },
  ]},

  // --- Dating ---
  { id: "tinder-plus", name: "Tinder Plus", category: "Dating", plans: [
    { name: "Plus", price: 12.99, currency: EUR },
    { name: "Gold", price: 19.99, currency: EUR },
    { name: "Platinum", price: 29.99, currency: EUR },
  ]},
  { id: "bumble-premium", name: "Bumble Premium", category: "Dating", plans: [
    { name: "Premium", price: 24.99, currency: EUR },
  ]},
  { id: "hinge-preferred", name: "Hinge Preferred", category: "Dating", plans: [
    { name: "Preferred Membership", price: 29.99, currency: "USD" },
  ]},
  { id: "badoo-premium", name: "Badoo Premium", category: "Dating", plans: [
    { name: "Premium", price: 22.99, currency: EUR },
  ]},
  { id: "meetic", name: "Meetic Premium", category: "Dating", plans: [
    { name: "Premium", price: 29.99, currency: EUR },
  ]},
  { id: "edarling", name: "eDarling Premium", category: "Dating", plans: [
    { name: "Premium", price: 29.9, currency: EUR },
  ]},
  { id: "okcupid-premium", name: "OkCupid Premium", category: "Dating", plans: [
    { name: "Basic", price: 24.9, currency: "USD" },
  ]},

  // --- Compras y reparto ---
  { id: "amazon-prime", name: "Amazon Prime", category: "Compras y reparto", plans: [
    { name: "Mensual", price: 4.99, currency: EUR },
  ]},
  { id: "uber-one", name: "Uber One", category: "Compras y reparto", plans: [
    { name: "Mensual", price: 5.99, currency: EUR },
  ]},
  { id: "glovo-prime", name: "Glovo Prime", category: "Compras y reparto", plans: [
    { name: "Mensual", price: 5.99, currency: EUR },
  ]},
  { id: "deliveroo-plus", name: "Deliveroo Plus", category: "Compras y reparto", plans: [
    { name: "Mensual", price: 4.99, currency: EUR },
  ]},
  { id: "just-eat-plus", name: "Just Eat Plus", category: "Compras y reparto", plans: [
    { name: "Mensual", price: 5.99, currency: EUR },
  ]},
  { id: "costco-membership", name: "Costco Membership", category: "Compras y reparto", plans: [
    { name: "Gold Star (anual/mes)", price: 5, currency: EUR },
  ]},
  { id: "rappi-prime", name: "Rappi Prime", category: "Compras y reparto", plans: [
    { name: "Mensual", price: 6.99, currency: EUR },
  ]},

  // --- Noticias y lectura ---
  { id: "el-pais", name: "El País", category: "Noticias y lectura", plans: [
    { name: "Digital", price: 10, currency: EUR },
  ]},
  { id: "el-mundo", name: "El Mundo", category: "Noticias y lectura", plans: [
    { name: "Digital", price: 9.99, currency: EUR },
  ]},
  { id: "la-vanguardia", name: "La Vanguardia", category: "Noticias y lectura", plans: [
    { name: "Digital", price: 9.99, currency: EUR },
  ]},
  { id: "nytimes", name: "The New York Times", category: "Noticias y lectura", plans: [
    { name: "Digital básico", price: 4, currency: "USD" },
    { name: "All Access", price: 12.5, currency: "USD" },
  ]},
  { id: "washington-post", name: "The Washington Post", category: "Noticias y lectura", plans: [
    { name: "Digital", price: 4, currency: "USD" },
  ]},
  { id: "kindle-unlimited", name: "Kindle Unlimited", category: "Noticias y lectura", plans: [
    { name: "Mensual", price: 9.99, currency: EUR },
  ]},
  { id: "scribd", name: "Scribd (Everand)", category: "Noticias y lectura", plans: [
    { name: "Mensual", price: 11.99, currency: "USD" },
  ]},
  { id: "medium", name: "Medium Membership", category: "Noticias y lectura", plans: [
    { name: "Mensual", price: 5, currency: "USD" },
  ]},
  { id: "the-economist", name: "The Economist", category: "Noticias y lectura", plans: [
    { name: "Digital", price: 15, currency: EUR },
  ]},
  { id: "financial-times", name: "Financial Times", category: "Noticias y lectura", plans: [
    { name: "Digital estándar", price: 39, currency: EUR },
  ]},
  { id: "wsj", name: "The Wall Street Journal", category: "Noticias y lectura", plans: [
    { name: "Digital", price: 38.99, currency: "USD" },
  ]},
  { id: "national-geographic", name: "National Geographic", category: "Noticias y lectura", plans: [
    { name: "Digital", price: 2.99, currency: "USD" },
  ]},
  { id: "blinkist", name: "Blinkist", category: "Noticias y lectura", plans: [
    { name: "Premium", price: 12.99, currency: EUR },
  ]},
  { id: "readly", name: "Readly", category: "Noticias y lectura", plans: [
    { name: "Ilimitado", price: 11.99, currency: EUR },
  ]},
  { id: "pressreader", name: "PressReader", category: "Noticias y lectura", plans: [
    { name: "Mensual", price: 29.99, currency: "USD" },
  ]},

  // --- Diseño y creatividad ---
  { id: "figma", name: "Figma", category: "Diseño y creatividad", plans: [
    { name: "Professional", price: 12, currency: "USD" },
  ]},
  { id: "adobe-photoshop", name: "Adobe Photoshop", category: "Diseño y creatividad", plans: [
    { name: "Mensual", price: 24.19, currency: EUR },
  ]},
  { id: "adobe-lightroom", name: "Adobe Lightroom", category: "Diseño y creatividad", plans: [
    { name: "Mensual", price: 11.99, currency: EUR },
  ]},
  { id: "envato-elements", name: "Envato Elements", category: "Diseño y creatividad", plans: [
    { name: "Individual", price: 17.99, currency: "USD" },
  ]},
  { id: "shutterstock", name: "Shutterstock", category: "Diseño y creatividad", plans: [
    { name: "10 imágenes/mes", price: 29, currency: "USD" },
  ]},
  { id: "epidemic-sound", name: "Epidemic Sound", category: "Diseño y creatividad", plans: [
    { name: "Personal", price: 14.9, currency: "USD" },
  ]},
  { id: "artlist", name: "Artlist", category: "Diseño y creatividad", plans: [
    { name: "Music Pro", price: 16.6, currency: "USD" },
  ]},
  { id: "storyblocks", name: "Storyblocks", category: "Diseño y creatividad", plans: [
    { name: "Individual", price: 24, currency: "USD" },
  ]},

  // --- Educación ---
  { id: "duolingo-plus", name: "Duolingo Super", category: "Educación", plans: [
    { name: "Super", price: 12.99, currency: EUR },
  ]},
  { id: "coursera-plus", name: "Coursera Plus", category: "Educación", plans: [
    { name: "Mensual", price: 59, currency: "USD" },
  ]},
  { id: "udemy-personal-plan", name: "Udemy Personal Plan", category: "Educación", plans: [
    { name: "Mensual", price: 16.99, currency: EUR },
  ]},
  { id: "linkedin-learning", name: "LinkedIn Learning", category: "Educación", plans: [
    { name: "Mensual", price: 29.99, currency: EUR },
  ]},
  { id: "masterclass", name: "MasterClass", category: "Educación", plans: [
    { name: "Anual (equiv./mes)", price: 10, currency: "USD" },
  ]},
  { id: "skillshare", name: "Skillshare", category: "Educación", plans: [
    { name: "Premium", price: 13.99, currency: "USD" },
  ]},
  { id: "babbel", name: "Babbel", category: "Educación", plans: [
    { name: "Mensual", price: 12.99, currency: EUR },
  ]},
  { id: "busuu", name: "Busuu Premium", category: "Educación", plans: [
    { name: "Premium", price: 13.99, currency: EUR },
  ]},
  { id: "preply", name: "Preply", category: "Educación", plans: [
    { name: "Clases semanales (desde)", price: 20, currency: "USD" },
  ]},
  { id: "edx", name: "edX", category: "Educación", plans: [
    { name: "Verified Track (curso)", price: 49, currency: "USD" },
  ]},
  { id: "brilliant", name: "Brilliant", category: "Educación", plans: [
    { name: "Premium", price: 14.99, currency: "USD" },
  ]},

  // --- Telco y otros ---
  { id: "google-fi", name: "Google Fi", category: "Telco y otros", plans: [
    { name: "Simply Unlimited", price: 65, currency: "USD" },
  ]},
  { id: "canva-teams", name: "Canva para equipos", category: "Telco y otros", plans: [
    { name: "Teams", price: 12.99, currency: EUR },
  ]},
  { id: "linkedin-premium", name: "LinkedIn Premium Career", category: "Telco y otros", plans: [
    { name: "Career", price: 29.99, currency: EUR },
  ]},
  { id: "tripit-pro", name: "TripIt Pro", category: "Telco y otros", plans: [
    { name: "Pro", price: 49, currency: "USD" },
  ]},
  { id: "aaa-membership", name: "Club Automóvil (RACE/RACC)", category: "Telco y otros", plans: [
    { name: "Membresía anual (equiv./mes)", price: 8, currency: EUR },
  ]},
  { id: "onlyoffice", name: "ONLYOFFICE", category: "Telco y otros", plans: [
    { name: "Cloud", price: 5, currency: "USD" },
  ]},
];

/** Búsqueda simple por substring sobre nombre y categoría. */
export function searchServices(query: string, limit = 8): CatalogService[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return SERVICE_CATALOG.filter(
    (service) => service.name.toLowerCase().includes(q) || service.category.toLowerCase().includes(q)
  ).slice(0, limit);
}
