import type { ZoneCode } from "@/types";

export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  readTime: string;
  published: string;
  updated: string;
  toc: { id: string; text: string; level: number }[];
  content: ArticleBlock[];
  faq: { q: string; a: string }[];
}

export interface ArticleBlock {
  type: "paragraph" | "heading" | "list" | "highlight" | "price-widget" | "link";
  text?: string;
  level?: number;
  items?: string[];
  href?: string;
  label?: string;
}

export const articles: ArticleData[] = [
  {
    slug: "spotpris",
    title: "Spotpris el – Vad är det och hur fungerar det?",
    description:
      "En komplett guide till spotpris: hur det sätts på Nordpool, varför det varierar timme för timme, och hur du som konsument kan dra nytta av timprisavtal för att spara pengar.",
    keywords: ["spotpris el", "vad är spotpris", "timpris el", "nordpool pris", "elpris timme"],
    category: "Grundläggande",
    readTime: "6 min",
    published: "2025-06-02",
    updated: "2025-06-02",
    toc: [
      { id: "vad-ar-spotpris", text: "Vad är spotpris?", level: 2 },
      { id: "hur-satts-priset", text: "Hur sätts spotpriset?", level: 2 },
      { id: "dygnets-prismonster", text: "Dygnets prismönster", level: 2 },
      { id: "ar-det-billigare", text: "Är spotpris alltid billigare?", level: 2 },
      { id: "sa-sparar-du", text: "Så sparar du pengar med spotpris", level: 2 },
      { id: "sammanfattning", text: "Sammanfattning", level: 2 },
    ],
    content: [
      {
        type: "paragraph",
        text: "Spotpris är det timvisa marknadspriset för el på den nordiska elbörsen Nord Pool. Till skillnad från fastprisavtal där du betalar samma pris oavsett tid på dygnet, varierar spotpriset varje timme – ibland med flera kronor per kilowattimme. För den medvetna konsumenten kan detta innebära stora besparingar, men det kräver också en viss förståelse för hur marknaden fungerar.",
      },
      { type: "heading", text: "Vad är spotpris?", level: 2 },
      {
        type: "paragraph",
        text: "Spotpriset (engelska: spot price) är det pris som elhandlare betalar för att köpa el på den kortsiktiga marknaden. Varje dag auktioneras kommande dygns elpriser ut på Nord Pool, och resultatet blir 24 timpriser – ett för varje timme på dygnet. Priset anges i euro per megawattimme (EUR/MWh) och omräknas sedan till svenska öre per kilowattimme.",
      },
      {
        type: "paragraph",
        text: "När du som privatperson väljer ett spotprisavtal (även kallat timprisavtal eller rörligt pris), betalar du i princip det aktuella marknadspriset plus elhandlarens påslag och moms. Det innebär att din elkostnad varierar från timme till timme, dag till dag och säsong till säsong.",
      },
      { type: "heading", text: "Hur sätts spotpriset?", level: 2 },
      {
        type: "paragraph",
        text: "Spotpriset bestäms av utbud och efterfrågan på elmarknaden. Flera faktorer påverkar balansen:",
      },
      {
        type: "list",
        items: [
          "Väder och vind: Kraftig vind ger mer vindkraft och lägre priser. Kall väderlek ökar uppvärmningsbehovet och pressar priserna uppåt.",
          "Vattennivåer i magasinen: Mycket vatten i norska och svenska vattenkraftsmagasin ger låga priser. Torrår ger motsatt effekt.",
          "Kärnkraft och underhåll: Planerade eller oplanerade driftstopp i kärnkraftsreaktorer påverkar utbudet kraftigt.",
          "Europamarknaden: Sverige är sammankopplat med europeiska elmarknader via kablar. När priserna stiger i Tyskland påverkas även svenska priser, särskilt i SE3 och SE4.",
          "Koldioxidpriset: Eftersom många europeiska kraftverk drivs med fossila bränslen påverkar koldioxidpriset produktionskostnaderna.",
        ],
      },
      {
        type: "paragraph",
        text: "Auktionen på Nord Pool sker dagligen klockan 12:00 för kommande dygn. Producenter och konsumenter lämnar sina bud, och ett marknadsklarningspris fastställs för varje timme. Detta pris är detsamma för alla aktörer inom samma elområde.",
      },
      { type: "heading", text: "Dygnets prismönster", level: 2 },
      {
        type: "paragraph",
        text: "Även om spotpriset varierar från dag till dag finns det ett tydligt dygnsmönster som är relativt konstant:",
      },
      {
        type: "list",
        items: [
          "02:00–06:00: Billigast. Låg förbrukning när de flesta sover. Industri och handel står stilla.",
          "07:00–09:00: Prisstegring. Morgonrusning – folk vaknar, duschar, lagar frukost och åker till jobbet.",
          "10:00–14:00: Måttligt. Kontor och industri är igång, men hushållsförbrukningen är lägre.",
          "17:00–20:00: Dyrast. Kvällsrusning – alla är hemma, lagar mat, tvättar, duschar och laddar elbilar.",
          "21:00–01:00: Avtagande. Förbrukningen sjunker successivt under kvällen.",
        ],
      },
      {
        type: "highlight",
        text: "PrognosEL:s AI-prognos visar exakt vilka timmar som är billigast i ditt elområde. Genom att flytta energitunga aktiviteter till lågpristimmar kan du spara 15–30% på elräkningen.",
      },
      { type: "heading", text: "Är spotpris alltid billigare?", level: 2 },
      {
        type: "paragraph",
        text: "Inte nödvändigtvis. Spotpris passar bäst för dig som kan anpassa din förbrukning och har tålamod att rida ut prissvängningar. Under extremt dyra perioder (som energikrisen 2021–2022) var spotpriset betydligt högre än fastprisalternativen.",
      },
      {
        type: "paragraph",
        text: "Men historiskt sett, över en längre period, har spotpris varit det ekonomiskt mest fördelaktiga alternativet för de flesta hushåll. Nyckeln är att vara medveten om priserna och anpassa sin förbrukning.",
      },
      { type: "heading", text: "Så sparar du pengar med spotpris", level: 2 },
      {
        type: "paragraph",
        text: "Här är konkreta åtgärder som gör skillnad på elräkningen:",
      },
      {
        type: "list",
        items: [
          "Skjut på tvätt och disk till natten. En tvättmaskin drar cirka 1–2 kWh per tvätt. Vid 1 öres skillnad per kWh sparar du 3–7 kronor per tvätt. På ett år blir det 500–1500 kr.",
          "Ladda elbilen på natten. En elbil kan dra 50–100 kWh per laddning. Vid 50 öres skillnad sparar du 25–50 kr per laddning.",
          "Ställ in varmvattenberedaren på nattuppvärmning. Varmvatten står för cirka 20% av hushållens elanvändning.",
          "Använd fördröjd start på diskmaskinen. De flesta moderna maskiner har timerfunktion.",
          "Håll koll på prognosen. PrognosEL visar 24h-prognos så du kan planera dagen i förväg.",
        ],
      },
      {
        type: "link",
        href: "/prognos",
        label: "Se 24h-prognos för ditt område →",
      },
      { type: "heading", text: "Sammanfattning", level: 2 },
      {
        type: "paragraph",
        text: "Spotpris är det timvisa marknadspriset för el på Nord Pool. Det varierar timme för timme beroende på utbud, efterfrågan, väder och europeiska marknadsförhållanden. För den medvetna konsumenten erbjuder spotprisavtal en möjlighet att spara pengar genom att anpassa förbrukningen till lågpristimmar – särskilt på natten och mitt på dagen. Med verktyg som PrognosEL:s AI-prognos blir det enkelt att planera sin elförbrukning smart.",
      },
      {
        type: "link",
        href: "/elpriser",
        label: "Se aktuella elpriser per timme →",
      },
    ],
    faq: [
      {
        q: "Vad är skillnaden mellan spotpris och fastpris?",
        a: "Spotpris varierar timme för timme baserat på marknadspriset på Nord Pool. Fastpris är ett konstant pris som du betalar oavsett tid på dygnet. Spotpris är historiskt sett billigare över tid, men kräver att du kan anpassa din förbrukning.",
      },
      {
        q: "Hur ofta ändras spotpriset?",
        a: "Spotpriset ändras varje timme, 24 gånger per dygn. Nya priser auktioneras ut dagligen klockan 12:00 för kommande dygn.",
      },
      {
        q: "Kan jag spara pengar med spotpris?",
        a: "Ja, historiskt sett har spotpris varit 10–20% billigare än fastpris över en längre period. Genom att flytta energitunga aktiviteter till billiga timmar kan du spara ytterligare 15–30%.",
      },
    ],
  },

  {
    slug: "elpriser-2025",
    title: "Varför är elpriset högt just nu?",
    description:
      "En analys av faktorerna bakom dagens höga elpriser i Sverige: väder, vind, kärnkraft, europeiska marknader och geopolitik. Förstå vad som driver priserna och vad du kan göra åt det.",
    keywords: ["elpriser höga", "varför dyrt el", "elpris 2025", "dyra elpriser sverige", "elchock"],
    category: "Aktuellt",
    readTime: "7 min",
    published: "2025-06-02",
    updated: "2025-06-02",
    toc: [
      { id: "lage-just-nu", text: "Läget just nu", level: 2 },
      { id: "drivkrafter", text: "Huvuddrivkrafter bakom höga priser", level: 2 },
      { id: "skillnad-mellan-omraden", text: "Skillnad mellan elområden", level: 2 },
      { id: "vad-kan-du-gora", text: "Vad kan du göra åt det?", level: 2 },
      { id: "prognos", text: "Prognos: När blir det bättre?", level: 2 },
    ],
    content: [
      {
        type: "paragraph",
        text: "Elpriserna i Sverige har varit ovanligt höga under stora delar av 2025. Många hushåll undrar varför räkningen är så mycket högre än förra året, och om det kommer att fortsätta. I den här artikeln går vi igenom de viktigaste faktorerna bakom prisuppgången och ger konkreta råd för hur du kan hantera situationen.",
      },
      { type: "heading", text: "Läget just nu", level: 2 },
      {
        type: "paragraph",
        text: "Under våren 2025 har spotpriserna i Sverige legat betydligt över historiska medelvärden. I SE4 (södra Sverige) har timpriserna regelbundet överstigit 100 öre/kWh under höglasttimmar, medan SE1 (norra Sverige) sett priser på 40–60 öre/kWh. Prisskillnaden mellan norr och söder är alltså fortsatt stor.",
      },
      {
        type: "paragraph",
        text: "Detta är en fortsättning på den trend vi såg under energikrisen 2021–2022, men drivkrafterna har delvis förändrats. Låt oss titta närmare på varför.",
      },
      { type: "heading", text: "Huvuddrivkrafter bakom höga priser", level: 2 },
      {
        type: "paragraph",
        text: "Flera faktorer samverkar för att pressa upp elpriserna just nu:",
      },
      {
        type: "list",
        items: [
          "Låga vattennivåer i magasinen: Efter en torr vinter är vattennivåerna i de norska och svenska vattenkraftsmagasin lägre än normalt. Vattenkraft står för cirka 45% av Sveriges elproduktion, så när den minskar påverkas priserna kraftigt.",
          "Begränsad kärnkraft: Ringhals 4 och Oskarshamn 3 har haft planerade avställningar för underhåll under våren. Varje reaktor som står stilla minskar utbudet med cirka 1 000–1 400 MW.",
          "Ökad europeisk efterfrågan: Den ekonomiska återhämtningen i Europa har lett till ökad industriell efterfrågan på el. Samtidigt har Tyskland stängt flera kärnkraftsreaktorer, vilket ökar deras importbehov och påverkar priserna i hela Europa.",
          "Koldioxidpriset: Priset på utsläppsrätter (EUA) har legat på historiskt höga nivåer runt 80–100 EUR/ton. Detta gör fossilbaserad elproduktion dyrare och indirekt höjer priserna på hela marknaden.",
          "Kabelbegränsningar: Bristande överföringskapacitet mellan Sverige och Europa, och mellan norra och södra Sverige, gör att priserna i söder drivs upp av europeisk efterfrågan utan att norrländsk vattenkraft kan kompensera fullt ut.",
        ],
      },
      { type: "heading", text: "Skillnad mellan elområden", level: 2 },
      {
        type: "paragraph",
        text: "Prisskillnaden mellan Sveriges fyra elområden är ett av de tydligaste tecknen på att elsystemet är under press:",
      },
      {
        type: "list",
        items: [
          "SE1 (Norrland): Har fortsatt tillgång på riklig vattenkraft och låg befolkningsdensitet. Priserna ligger 30–50% under riksgenomsnittet.",
          "SE2 (Norra Mellansverige): Påverkas mer av industriell förbrukning. Priserna ligger närmare genomsnittet men fortfarande under södra Sverige.",
          "SE3 (Södra Mellansverige): Med Stockholm som centrum har högst förbrukning. Priserna är 20–40% högre än i norr.",
          "SE4 (Södra Sverige): Påverkas kraftigast av europeiska priser och importberoende. Priserna kan vara 2–3 gånger högre än i SE1.",
        ],
      },
      {
        type: "highlight",
        text: "Förstå varför priset i SE4 (Malmö) skiljer sig från SE1 (Luleå). Se vår interaktiva zongrafik för realtidspriser i alla fyra områden.",
      },
      {
        type: "link",
        href: "/elpriser",
        label: "Se aktuella priser per elområde →",
      },
      { type: "heading", text: "Vad kan du göra åt det?", level: 2 },
      {
        type: "paragraph",
        text: "Du kan inte påverka de stora makroekonomiska faktorerna, men du kan påverka din egen elkostnad. Här är strategier som fungerar oavsett prisnivå:",
      },
      {
        type: "list",
        items: [
          "Byt till timprisavtal om du inte redan har det. Fastprisavtal är ofta dyrare när spotpriserna är höga, eftersom elhandlaren tar en riskpremie.",
          "Flytta förbrukning till natten. Även under dyra perioder är natten billigare. Skillnaden mellan dyraste och billigaste timmen kan vara 50–100%.",
          "Investera i energieffektivisering. Bättre isolering, värmepump och LED-belysning minskar din totala förbrukning – och därmed din sårbarhet för prisuppgångar.",
          "Överväg solceller. Med höga elpriser är återbetalningstiden för solceller betydligt kortare. Egen solel är dessutom skattefritt upp till 255 kWh/år.",
          "Använd en elprognos. Med PrognosEL kan du se 24 timmar i förväg vilka timmar som blir dyrast och billigast, och planera dina aktiviteter därefter.",
        ],
      },
      {
        type: "link",
        href: "/prognos",
        label: "Se AI-driven 24h-prognos →",
      },
      { type: "heading", text: "Prognos: När blir det bättre?", level: 2 },
      {
        type: "paragraph",
        text: "Elpriserna är svåra att förutspå på lång sikt, men det finns några faktorer som talar för en prisnedgång under sommaren och hösten 2025:",
      },
      {
        type: "list",
        items: [
          "Vårflod: När snön smälter i fjällen fylls vattenkraftsmagasin på. Normalt sett leder detta till lägre priser från maj och framåt.",
          "Ökad vindkraft: Sverige bygger ut vindkraften i snabb takt. Under 2025 väntas 3–4 TWh ny vindkraftsproduktion tas i drift.",
          "Kärnkraftsåterstart: Ringhals 4 och Forsmark 3 väntas vara tillbaka i drift efter sommaren.",
          "Mildare väderprognoser: Vädermodellerna pekar på en normal till mild sommar, vilket skulle minska kylbehovet.",
        ],
      },
      {
        type: "paragraph",
        text: "Sammanfattningsvis: elpriserna är höga just nu på grund av en perfekt storm av låga vattennivåer, underhållsavställningar, hög europeisk efterfrågan och höga koldioxidpriser. Men förutsättningarna pekar på en normalisering under andra halvåret 2025. Tills dess är det smartaste du kan göra att anpassa din förbrukning och hålla koll på prognosen.",
      },
      {
        type: "link",
        href: "/login",
        label: "Skapa gratis konto för personliga spartips →",
      },
    ],
    faq: [
      {
        q: "Hur länge kommer elpriserna att vara höga?",
        a: "Det är svårt att säga exakt, men historiska mönster tyder på att priserna normalt sett sjunker under sommaren tack vare vårflod och lägre uppvärmningsbehov. De långsiktiga drivkrafterna – energiomställningen och europeisk efterfrågan – kommer dock att fortsätta påverka marknaden.",
      },
      {
        q: "Är fastpris eller rörligt pris bäst nu?",
        a: "När spotpriserna är höga tenderar fastprisavtal att vara ännu dyrare, eftersom elhandlare tar en riskpremie. Rörligt pris (spotpris) är historiskt sett det billigare alternativet över tid, även under perioder med höga priser.",
      },
      {
        q: "Påverkas hela Sverige lika mycket?",
        a: "Nej. Södra Sverige (SE3 och SE4) påverkas betydligt mer än norra Sverige (SE1 och SE2). Prisskillnaden kan vara 2–3 gånger under höglasttimmar.",
      },
    ],
  },

  {
    slug: "billigaste-timmen",
    title: "Bästa timmen att köra tvätt & diskmaskin 2025",
    description:
      "Praktiska tips för att planera energitunga hushållssysslor. Spara hundratals kronor per år genom att välja rätt timme med hjälp av realtidspriser och AI-prognoser.",
    keywords: ["billigaste eltimme", "när är elen billigast", "tvätta billigt", "elpris natt", "spara el"],
    category: "Sparande",
    readTime: "5 min",
    published: "2025-06-02",
    updated: "2025-06-02",
    toc: [
      { id: "dygnets-billigaste", text: "Dygnets billigaste timmar", level: 2 },
      { id: "hur-mycket-sparar-du", text: "Hur mycket sparar du?", level: 2 },
      { id: "praktiska-tips", text: "Praktiska tips för varje apparat", level: 2 },
      { id: "veckoplanering", text: "Veckoplanering med prognos", level: 2 },
      { id: "smart-hem", text: "Smart hem och automation", level: 2 },
    ],
    content: [
      {
        type: "paragraph",
        text: "Visste du att du kan spara över 1 000 kronor per år bara genom att flytta tvätten några timmar? Med timprisavtal (spotpris) varierar elpriset kraftigt under dygnet – ibland med över 100% mellan dyraste och billigaste timmen. Här är den kompletta guiden till när du ska köra dina energitunga apparater.",
      },
      { type: "heading", text: "Dygnets billigaste timmar", level: 2 },
      {
        type: "paragraph",
        text: "Generellt sett är elen billigast när färre människor använder den. Detta ger ett tydligt mönster under dygnet:",
      },
      {
        type: "list",
        items: [
          "02:00–06:00: Den absolut billigaste perioden. Nästan alla sover, industri är avstängd, och vindkraften är ofta som starkast under natten. Priserna kan vara 50–70% under dygnsgenomsnittet.",
          "11:00–14:00: En andra lågprisperiod på dagen. Kontor är igång men hushållsförbrukningen är lägre. På soliga dagar bidrar solkraften till att pressa priserna ytterligare.",
          "15:00–16:00: En kortare lugn period innan kvällsrusningen börjar.",
        ],
      },
      {
        type: "highlight",
        text: "Den dyraste perioden är 17:00–20:00. Då är alla hemma, mat lagas, duschar tas, TV:n är på, och elbilen laddas. Förbrukningen når sin topp och priserna följer efter.",
      },
      {
        type: "paragraph",
        text: "På vintern kan natten vara dyrare än på sommaren eftersom uppvärmningsbehovet ökar. På sommaren är natten nästan alltid den billigaste perioden.",
      },
      { type: "heading", text: "Hur mycket sparar du?", level: 2 },
      {
        type: "paragraph",
        text: "Låt oss räkna på några konkreta exempel. Vi antar ett genomsnittligt pris på 80 öre/kWh och en skillnad på 50 öre mellan dyraste och billigaste timmen:",
      },
      {
        type: "list",
        items: [
          "Tvättmaskin (1 kWh/tvätt): 3 tvättar/vecka = 156 tvättar/år. Skillnad 50 öre = 78 kr/år.",
          "Diskmaskin (1,5 kWh/disk): 5 diskar/vecka = 260 diskar/år. Skillnad 50 öre = 195 kr/år.",
          "Torktumlare (3 kWh/tork): 2 torkar/vecka = 104 torkar/år. Skillnad 50 öre = 156 kr/år.",
          "Elbil (60 kWh/laddning): 2 laddningar/vecka = 104 laddningar/år. Skillnad 50 öre = 3 120 kr/år.",
        ],
      },
      {
        type: "paragraph",
        text: "Summerat: genom att flytta tvätt, disk och elbilsladdning till natten kan du spara 3 500–5 000 kr per år. Och det utan att köpa en enda ny pryl.",
      },
      { type: "heading", text: "Praktiska tips för varje apparat", level: 2 },
      {
        type: "paragraph",
        text: "Här är apparat-för-apparat-guiden till smart elanvändning:",
      },
      {
        type: "heading", text: "Tvättmaskin", level: 3 },
      {
        type: "list",
        items: [
          "Använd fördröjd start. De flesta moderna maskiner har en timerfunktion som låter dig ställa in starttid.",
          "Kör fulla maskiner. En halvfull maskin drar nästan lika mycket el som en full.",
          "Välj 30°C istället för 60°C. Uppvärmning av vatten står för 80% av energianvändningen.",
          "Samla ihop familjens tvätt och kör en maskin vid 02:00 istället för tre maskiner på kvällen.",
        ],
      },
      {
        type: "heading", text: "Diskmaskin", level: 3 },
      {
        type: "list",
        items: [
          "Fyll diskmaskinen ordentligt. En halvfull disk är nästan lika energikrävande som en full.",
          "Använd ECO-programmet. Det tar längre tid men drar 30–50% mindre energi.",
          "Ställ in fördröjd start till 01:00–04:00. Disken är klar när du vaknar.",
          "Skölj inte diskarna för hand. Moderna maskiner klarar matrester utan försköljning.",
        ],
      },
      {
        type: "heading", text: "Torktumlare", level: 3 },
      {
        type: "list",
        items: [
          "Hängtorka när vädret tillåter. Gratis och skonsamt för kläderna.",
          "Kör torktumlaren på natten när du måste använda den.",
          "Använd högt varvtal i tvättmaskinen. Ju torrare kläderna är när de kommer in i tumlaren, desto mindre energi behövs.",
        ],
      },
      {
        type: "heading", text: "Elbil", level: 3 },
      {
        type: "list",
        items: [
          "Ställ in laddningen i bilens app. De flesta elbilar låter dig schemalägga laddning till specifika timmar.",
          "Ladda till 80% istället för 100%. Det är snabbare, billigare och bättre för batteriet.",
          "Använd laddbox med timstyrning. Många laddboxar kan kopplas till elpriserna automatiskt.",
        ],
      },
      { type: "heading", text: "Veckoplanering med prognos", level: 2 },
      {
        type: "paragraph",
        text: "PrognosEL:s AI-prognos låter dig se 24 timmar i förväg vilka timmar som blir billigast i ditt elområde. Så här kan du planera din vecka:",
      },
      {
        type: "list",
        items: [
          "Söndag kväll: Kolla prognosen för kommande vecka. Identifiera de billigaste nätterna.",
          "Måndag–tisdag: Kör tvätt och disk under de billigaste nätterna.",
          "Onsdag–torsdag: Ladda elbilen under lågpristimmar.",
          "Fredag–lördag: Städa huset, dammsuga och kör eventuell extra tvätt.",
        ],
      },
      {
        type: "link",
        href: "/prognos",
        label: "Se 24h-prognos för din planering →",
      },
      { type: "heading", text: "Smart hem och automation", level: 2 },
      {
        type: "paragraph",
        text: "För den tekniskt intresserade finns det flera sätt att automatisera elbesparingen:",
      },
      {
        type: "list",
        items: [
          "Smarta uttag (smart plugs): Koppla tvättmaskinen och diskmaskinen till smarta uttag som du kan styra via app eller schemaläggning.",
          "Home Assistant: En öppen plattform som låter dig skapa automationer baserade på elpriser. Till exempel: 'Starta diskmaskinen när priset sjunker under 50 öre.'",
          "Tibber Pulse: En energimätare som kopplas till elmätaren och ger realtidsdata samt automation baserat på priser.",
        ],
      },
      {
        type: "paragraph",
        text: "Men du behöver inte vara tekniknörd för att spara pengar. De största besparingarna kommer från de enkla sakerna: flytta tvätten till natten, kör disken med timer, och ladda elbilen när priset är lägst. Med PrognosEL har du alltid koll på vilka timmar som lönar sig.",
      },
      {
        type: "link",
        href: "/elpriser",
        label: "Se aktuella priser per timme →",
      },
    ],
    faq: [
      {
        q: "När är elen absolut billigast under dygnet?",
        a: "Generellt är elen billigast mellan 02:00 och 06:00 på natten. Under denna period sover de flesta, industri är avstängd, och vindkraften är ofta som starkast. Priserna kan vara 50–70% under dygnsgenomsnittet.",
      },
      {
        q: "Hur mycket kan jag spara per år?",
        a: "Genom att flytta tvätt, disk och elbilsladdning till natten kan du spara 3 500–5 000 kr per år. Största besparingen kommer från elbilen (upp till 3 000 kr/år), följt av torktumlare och diskmaskin.",
      },
      {
        q: "Fungerar alla maskiner med fördröjd start?",
        a: "De flesta moderna tvättmaskiner och diskmaskiner har inbyggd timerfunktion. Om din maskin saknar detta kan du använda ett smart uttag (smart plug) för att schemalägga starttiden.",
      },
    ],
  },
  {
    slug: "elpriser-idag",
    title: "Elpriser idag – Se aktuella spotpriser per timme i Sverige",
    description:
      "Kolla elpriser idag per timme för SE1, SE2, SE3 och SE4. Förstå varför elpriset varierar under dagen och lär dig vilka timmar som är billigast just nu.",
    keywords: [
      "elpriser idag",
      "elpris idag",
      "spotpris idag",
      "aktuella elpriser",
      "el pris idag",
      "elpris per timme idag",
      "billiga eltimmar idag",
    ],
    category: "Aktuellt",
    readTime: "5 min",
    published: "2026-06-10",
    updated: "2026-06-10",
    toc: [
      { id: "vad-kostar-elen-idag", text: "Vad kostar elen idag?", level: 2 },
      { id: "varfor-varierar-priset", text: "Varför varierar priset timme för timme?", level: 2 },
      { id: "billigaste-timmarna", text: "Billigaste timmarna idag", level: 2 },
      { id: "skillnad-mellan-omraden", text: "Prisskillnad mellan SE1–SE4", level: 2 },
      { id: "sa-foljer-du-priset", text: "Så följer du elpriset idag", level: 2 },
    ],
    content: [
      {
        type: "paragraph",
        text: "Elpriset i Sverige sätts varje timme på elbörsen Nord Pool och skiljer sig åt mellan landets fyra elområden – SE1 i norr till SE4 i söder. Om du har ett rörligt elavtal (spotprisavtal) betalar du det faktiska marknadspriset plus påslag och moms. Det betyder att det du betalar klockan 07 på morgonen kan vara dubbelt så dyrt som klockan 03 på natten.",
      },
      {
        type: "highlight",
        text: "PrognosEL visar elpriser idag i realtid för alla fyra elområden, timme för timme. Du ser direkt vilken timme som är billigast just nu.",
      },
      {
        type: "link",
        href: "/elpriser",
        label: "Se elpriser idag per timme →",
      },
      { type: "heading", text: "Vad kostar elen idag?", level: 2 },
      {
        type: "paragraph",
        text: "Elpriset idag beror på en rad faktorer som samverkar i realtid. Spotpriset anges i öre per kilowattimme (öre/kWh) och varierar kraftigt under dygnet. Historiskt sett brukar ett genomsnittligt dygn se ut så här:",
      },
      {
        type: "list",
        items: [
          "Nattetid (02–06): 30–60 öre/kWh – billigast på dygnet",
          "Morgonrusning (07–09): 80–150 öre/kWh – priset stiger snabbt",
          "Mitt på dagen (10–14): 60–100 öre/kWh – lugnt och stabilt",
          "Kvällsrusning (17–20): 100–200+ öre/kWh – dyrt på dygnet",
          "Sen kväll (21–01): 50–80 öre/kWh – sjunker successivt",
        ],
      },
      {
        type: "paragraph",
        text: "Dessa är riktmärken – den faktiska prisnivån varierar kraftigt beroende på väder, vindkraft, kärnkraftsläge och europeisk elhandel. Under extrema vinterdagar kan kvällstopparna överstiga 400 öre/kWh i SE4, medan soliga sommardagar med stark vind kan ge priser nära noll.",
      },
      { type: "heading", text: "Varför varierar priset timme för timme?", level: 2 },
      {
        type: "paragraph",
        text: "Elpriset sätts av utbud och efterfrågan på Nord Pool. Varje morgon klockan 12 auktioneras nästa dygns 24 timpriser ut. Tre faktorer styr priset mest:",
      },
      {
        type: "list",
        items: [
          "Efterfrågan: Hög förbrukning på morgon och kväll driver upp priset. Låg förbrukning på natten pressar ner det.",
          "Vind och sol: Kraftig vind ger stora mängder billig el. Solceller bidrar till lägre priser mitt på dagen, särskilt sommartid.",
          "Import och export: Sverige är sammankopplat med Norge, Danmark, Finland och Europa. Höga priser utomlands drar upp svenska priser, särskilt i SE3 och SE4.",
        ],
      },
      {
        type: "paragraph",
        text: "Det är just den här dynamiken som gör det lönsamt att kolla elpriset idag innan du startar tvättmaskinen, diskmaskinen eller laddar elbilen. Skillnaden mellan dyraste och billigaste timmen är ofta 50–100% – ibland ännu mer.",
      },
      { type: "heading", text: "Billigaste timmarna idag", level: 2 },
      {
        type: "paragraph",
        text: "Det finns ett relativt stabilt mönster för när elen är billigast under ett normalt dygn:",
      },
      {
        type: "list",
        items: [
          "Klockan 02–06: Absolut billigast. Nästan ingen är vaken, industrin är stängd och vindkraften producerar på topp.",
          "Klockan 11–13: En lågperiod mitt på dagen. Solceller bidrar och hushållsförbrukningen är lägre.",
          "Klockan 22–24: Priserna sjunker när folk går och lägger sig.",
        ],
      },
      {
        type: "highlight",
        text: "Tips: Ställ diskmaskinen och tvättmaskinen på timer till 02:00. Du sparar 30–50% på den körningen jämfört med att köra den 18:00.",
      },
      {
        type: "paragraph",
        text: "Exakt vilka timmar som är billigast idag beror på det aktuella väderläget och vad som händer på europeiska elmarknader. PrognosEL:s AI-prognos ger dig en 24-timmarsprognos så att du kan planera dagen kvällen innan.",
      },
      {
        type: "link",
        href: "/prognos",
        label: "Se AI-prognos för morgondagens elpriser →",
      },
      { type: "heading", text: "Prisskillnad mellan SE1–SE4", level: 2 },
      {
        type: "paragraph",
        text: "Sverige är indelat i fyra elområden och priset kan skilja sig markant beroende på var du bor:",
      },
      {
        type: "list",
        items: [
          "SE1 – Luleå och norra Norrland: Lägst pris. Riklig vattenkraft och låg befolkningstäthet. Priset är ofta 30–50% under riksgenomsnittet.",
          "SE2 – Sundsvall och södra Norrland: Lågt till medelhögt pris. Påverkas av industriförbrukning men har god tillgång på vattenkraft.",
          "SE3 – Stockholm och södra Mellansverige: Landets befolkningscentrum. Högt elbehov driver priserna uppåt, särskilt under morgon och kväll.",
          "SE4 – Malmö och södra Sverige: Högst pris. Starkt beroende av elimport från Europa och Danmark. Känsligast för europeiska prissvängningar.",
        ],
      },
      {
        type: "paragraph",
        text: "Under ett normalt dygn kan prisskillnaden mellan SE1 och SE4 vara 20–60 öre/kWh. Under extrema perioder – till exempel en kall vintermorgon med lite vind – kan skillnaden vara 2–3 kronor per kWh. Det är därför viktigt att alltid kolla priset för ditt specifika elområde.",
      },
      {
        type: "link",
        href: "/elpriser",
        label: "Se aktuellt pris i ditt elområde →",
      },
      { type: "heading", text: "Så följer du elpriset idag", level: 2 },
      {
        type: "paragraph",
        text: "Det enklaste sättet att alltid ha koll på elpriset idag är att använda PrognosEL. Du ser direkt:",
      },
      {
        type: "list",
        items: [
          "Aktuellt timspris i realtid för SE1, SE2, SE3 och SE4",
          "Prisgrafer för hela dygnet – se var du befinner dig i priscykeln",
          "AI-prognos för de kommande 24 timmarna",
          "Veckoplanering – identifiera de billigaste dagarna och timmarna i förväg",
        ],
      },
      {
        type: "paragraph",
        text: "Appen är gratis och kräver inget abonnemang för att se dagens priser. Skapar du ett konto får du dessutom personliga spartips baserade på ditt elområde och dina vanor.",
      },
      {
        type: "link",
        href: "/login",
        label: "Skapa gratis konto →",
      },
    ],
    faq: [
      {
        q: "Var hittar jag elpriser idag per timme?",
        a: "På PrognosEL ser du elpriser idag för alla timmar och alla elområden (SE1–SE4) i realtid. Priserna uppdateras direkt från Nord Pool.",
      },
      {
        q: "Vilken timme är elen billigast idag?",
        a: "Generellt är elen billigast mellan 02:00 och 06:00 på natten. Exakt vilken timme som är billigast idag beror på väder och europeisk elhandel – kolla AI-prognosen på PrognosEL för att se dagens specifika prisbild.",
      },
      {
        q: "Varför är elpriset olika i SE1, SE2, SE3 och SE4?",
        a: "Sverige är uppdelat i fyra elområden för att hantera begränsad överföringskapacitet i elnätet. Norra Sverige (SE1) har mycket vattenkraft och låg förbrukning, vilket ger lägre priser. Södra Sverige (SE4) är mer beroende av elimport och påverkas mer av europeiska priser.",
      },
      {
        q: "Hur ofta uppdateras elpriset?",
        a: "Timspriset för nästa dygn auktioneras ut varje dag klockan 12:00 på Nord Pool. Det innebär att du redan på eftermiddagen idag kan se vad elen kommer kosta imorgon, timme för timme.",
      },
      {
        q: "Gäller elpriserna på PrognosEL för mitt elavtal?",
        a: "PrognosEL visar spotpriset från Nord Pool (exkl. moms och påslag). Om du har ett spotprisavtal betalar du detta pris plus din elhandlares påslag och elnätsavgift. Har du fastpris är ditt pris detsamma oavsett vad spotpriset visar.",
      },
    ],
  },
];

export function getArticleBySlug(slug: string): ArticleData | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}
