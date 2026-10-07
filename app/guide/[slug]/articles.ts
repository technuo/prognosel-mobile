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
  // `id` must equal slugifyHeading(text) — see slug.ts. The TOC link is derived
  // from `text` at render time so a stale id can't break the page, but keep it
  // in sync anyway so the data stays truthful.
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
      { id: "hur-satts-spotpriset", text: "Hur sätts spotpriset?", level: 2 },
      { id: "dygnets-prismonster", text: "Dygnets prismönster", level: 2 },
      { id: "ar-spotpris-alltid-billigare", text: "Är spotpris alltid billigare?", level: 2 },
      { id: "sa-sparar-du-pengar-med-spotpris", text: "Så sparar du pengar med spotpris", level: 2 },
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
      "Varför är elpriset högt just nu? Vi förklarar de fem viktigaste drivkrafterna – väder, kärnkraft, Europa och utsläppsrätter – och visar hur du flyttar förbrukningen till billigare timmar.",
    keywords: ["varför är elpriset högt just nu", "varför är elpriset så högt just nu", "höga elpriser sverige", "vad driver elpriset upp", "elpris 2026"],
    category: "Aktuellt",
    readTime: "7 min",
    published: "2025-06-02",
    updated: "2026-10-07",
    toc: [
      { id: "svaret-i-korthet", text: "Svaret i korthet", level: 2 },
      { id: "de-viktigaste-drivkrafterna", text: "De viktigaste drivkrafterna", level: 2 },
      { id: "varfor-skiljer-sig-elomradena-at", text: "Varför skiljer sig elområdena åt?", level: 2 },
      { id: "vad-kan-du-gora-at-det", text: "Vad kan du göra åt det?", level: 2 },
      { id: "nar-sjunker-priserna", text: "När sjunker priserna?", level: 2 },
    ],
    content: [
      {
        type: "paragraph",
        text: "Elpriset är högt just nu av flera samverkande orsaker: låg vattenkraftproduktion, planerade och oplanerade kärnkraftsavställningar, hög efterfrågan från Europa och ett högt koldioxidpris. Södra Sverige (SE4) drabbas hårdast, medan norra Sverige (SE1) oftast ligger långt under riksgenomsnittet. Du kan inte ändra marknaden – men du kan flytta din förbrukning till de billigaste timmarna med hjälp av vår timprognos.",
      },
      { type: "heading", text: "Svaret i korthet", level: 2 },
      {
        type: "paragraph",
        text: "Kortfattat: när det blåser lite, vattenmagasinen är låga eller flera reaktorer står stilla samtidigt, minskar utbudet – och priset går upp. Eftersom Sveriges elmarknad är sammankopplad med Europa följer priserna dessutom med när grannländerna betalar mer. Vill du se exakt vad priset ligger på i ditt område just nu, kolla våra realtidspriser i stället för att gissa.",
      },
      {
        type: "link",
        href: "/elpriser",
        label: "Se dagens elpriser för alla elområden →",
      },
      { type: "heading", text: "De viktigaste drivkrafterna", level: 2 },
      {
        type: "paragraph",
        text: "Priset sätts av den dyraste produktionen som behövs för att täcka förbrukningen. De här faktorerna bestämmer hur högt det blir:",
      },
      {
        type: "list",
        items: [
          "Vattenkraft: Ungefär 40–45% av Sveriges el kommer från vattenkraft. Låga vattennivåer efter torra perioder sänker produktionen och pressar upp priset, särskilt under vinterhalvåret.",
          "Kärnkraft: Varje reaktor som är avställd för underhåll eller reparation minskar utbudet med omkring 1 000–1 400 MW. Fler samtidiga avställningar syns direkt i priset.",
          "Vind: När det blåser mycket sjunker priserna snabbt, och tvärtom. Vindkraften har gjort elpriset mer väderberoende än tidigare.",
          "Europa: Den svenska elmarknaden är sammankopplad med kontinenten. Hög efterfrågan eller brist på el i Tyskland och övriga Europa drar upp priserna även i Sverige.",
          "Utsläppsrätter och bränsle: Priset på utsläppsrätter (EUA) och på gas påverkar den dyraste elproduktionen, som i sin tur sätter priset för hela marknaden.",
          "Överföringskapacitet: När billig nordisk el inte kan flyttas söderut på grund av begränsade ledningar, uppstår stora prisskillnader mellan norr och söder.",
        ],
      },
      { type: "heading", text: "Varför skiljer sig elområdena åt?", level: 2 },
      {
        type: "paragraph",
        text: "Sverige är uppdelat i fyra elområden, och priset kan skilja sig kraftigt mellan dem samma timme:",
      },
      {
        type: "list",
        items: [
          "SE1 (Norrland): Riklig vattenkraft och låg förbrukning ger oftast de lägsta priserna.",
          "SE2 (Norra Mellansverige): Ligger närmare riksgenomsnittet och påverkas av industriell förbrukning.",
          "SE3 (Södra Mellansverige): Stockholm och hög befolkningstäthet driver upp priset jämfört med norr.",
          "SE4 (Södra Sverige): Mest kopplat till Europa och störst importberoende – här blir priserna oftast högst.",
        ],
      },
      {
        type: "highlight",
        text: "Prisskillnaden mellan SE4 (Malmö) och SE1 (Luleå) kan vara 2–3 gånger under höglasttimmar. Se ditt eget område i realtid.",
      },
      {
        type: "link",
        href: "/elpriser/se4",
        label: "Se priset i SE4 (Malmö) →",
      },
      {
        type: "link",
        href: "/elpriser/se3",
        label: "Se priset i SE3 (Stockholm) →",
      },
      { type: "heading", text: "Vad kan du göra åt det?", level: 2 },
      {
        type: "paragraph",
        text: "Du kan inte påverka marknaden, men du kan påverka din egen elkostnad. Det här fungerar oavsett prisnivå:",
      },
      {
        type: "list",
        items: [
          "Byt till timprisavtal (spotpris) om du inte redan har det. Över tid är det ofta billigare än fastpris, särskilt om du kan flytta förbrukning.",
          "Flytta energitunga sysslor till billiga timmar. Skillnaden mellan dyraste och billigaste timmen kan vara 50–100%.",
          "Följ timprognosen. Med vår 24h-prognos ser du i förväg vilka timmar som blir dyrast och billigast.",
          "Effektivisera hemmet. Värmepump, bättre isolering och LED minskar din totala förbrukning och din sårbarhet för prisuppgångar.",
          "Överväg solceller vid höga elpriser. Återbetalningstiden blir kortare när elen är dyr.",
        ],
      },
      {
        type: "link",
        href: "/prognos",
        label: "Se AI-driven 24h-prognos →",
      },
      { type: "heading", text: "När sjunker priserna?", level: 2 },
      {
        type: "paragraph",
        text: "Elpriset går upp och ner över dygnet och över året. De billigaste timmarna är nästan alltid natten (02:00–06:00) och ofta mitt på dagen när solen skiner. Säsongsmässigt sjunker priserna oftast under vår och höst, när uppvärmningsbehovet är lägre och vårfloden fyller vattenmagasinen.",
      },
      {
        type: "highlight",
        text: "Det säkraste sättet att veta när det är billigt är inte att gissa – det är att kolla timprognosen för ditt elområde.",
      },
      {
        type: "paragraph",
        text: "Sammanfattningsvis: elpriset är högt just nu på grund av ett tajt utbud och hög efterfrågan, både i Sverige och i Europa. I stället för att vänta på att marknaden ska ändra sig kan du anpassa din förbrukning och hålla koll på prognosen.",
      },
      {
        type: "link",
        href: "/login",
        label: "Skapa gratis konto för personliga spartips →",
      },
    ],
    faq: [
      {
        q: "Varför är elpriset så högt just nu?",
        a: "Oftast är det en kombination: låg vattenkraft, kärnkraftsavställningar, lite vind och hög efterfrågan från Europa. Eftersom Sveriges marknad är kopplad till kontinenten smittar europeiska priser av sig.",
      },
      {
        q: "Hur länge kommer elpriserna att vara höga?",
        a: "Det går inte att säga säkert. Priset varierar kraftigt från dygn till dygn beroende på väder och tillgänglig produktion. Historiskt sjunker det oftast när vind och vattenkraft ökar och uppvärmningsbehovet minskar.",
      },
      {
        q: "Är fastpris eller rörligt (spotpris) bäst nu?",
        a: "När spotpriserna är höga tenderar fastpris att vara ännu dyrare, eftersom elhandlaren tar en riskpremie. Rörligt pris har historiskt varit billigare över tid.",
      },
      {
        q: "Påverkas hela Sverige lika mycket?",
        a: "Nej. Södra Sverige (SE3 och SE4) påverkas betydligt mer än norra Sverige (SE1 och SE2). Prisskillnaden kan vara 2–3 gånger under höglasttimmar.",
      },
      {
        q: "Var ser jag dagens pris i mitt elområde?",
        a: "På prognosel.energy/elpriser ser du realtidspriser för alla fyra elområden. För din egen zon hittar du SE3 och SE4 på prognosel.energy/elpriser/se3 respektive /elpriser/se4.",
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
      { id: "dygnets-billigaste-timmar", text: "Dygnets billigaste timmar", level: 2 },
      { id: "hur-mycket-sparar-du", text: "Hur mycket sparar du?", level: 2 },
      { id: "praktiska-tips-for-varje-apparat", text: "Praktiska tips för varje apparat", level: 2 },
      { id: "veckoplanering-med-prognos", text: "Veckoplanering med prognos", level: 2 },
      { id: "smart-hem-och-automation", text: "Smart hem och automation", level: 2 },
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
      { id: "varfor-varierar-priset-timme-for-timme", text: "Varför varierar priset timme för timme?", level: 2 },
      { id: "billigaste-timmarna-idag", text: "Billigaste timmarna idag", level: 2 },
      { id: "prisskillnad-mellan-se1se4", text: "Prisskillnad mellan SE1–SE4", level: 2 },
      { id: "sa-foljer-du-elpriset-idag", text: "Så följer du elpriset idag", level: 2 },
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
        text: "Grundfunktionerna är gratis och du behöver inget abonnemang för att se dagens priser. Skapar du ett konto får du dessutom personliga spartips baserade på ditt elområde och dina vanor.",
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
  {
    slug: "billigaste-tiden-att-ladda-elbil",
    title: "Billigaste tiden att ladda elbil – nattladdning sparar mest",
    description:
      "När ska du ladda elbilen hemma för lägst elpris? Nattladdning mellan 02:00 och 06:00 är nästan alltid billigast. Här får du siffror, schema och räkneexempel.",
    keywords: [
      "billigaste tiden att ladda elbil",
      "ladda elbil billigast",
      "när ladda elbilen",
      "nattladdning elbil",
      "elbil laddning billig tid",
    ],
    category: "Elbil",
    readTime: "6 min",
    published: "2026-09-30",
    updated: "2026-09-30",
    toc: [
      { id: "nar-ar-elen-billigast-att-ladda-elbilen", text: "När är elen billigast att ladda elbilen?", level: 2 },
      { id: "vilka-timmar-ar-billigast-pa-natten", text: "Vilka timmar är billigast på natten?", level: 2 },
      { id: "hur-mycket-sparar-du-pa-nattladdning", text: "Hur mycket sparar du på nattladdning?", level: 2 },
      { id: "sa-schemalagger-du-laddningen", text: "Så schemalägger du laddningen", level: 2 },
      { id: "vad-kostar-det-att-ladda-elbilen-hemma", text: "Vad kostar det att ladda elbilen hemma?", level: 2 },
    ],
    content: [
      {
        type: "paragraph",
        text: "Ladda elbilen mellan klockan 02:00 och 06:00 på natten – det är nästan alltid den billigaste tiden på dygnet. Då är elpriset ofta 50–70% lägre än under kvällsrusningen 17:00–20:00, när alla är hemma och laddar samtidigt. En nattladdning sparar därför ofta 25–50 kronor per laddning jämfört med att koppla in bilen direkt efter jobbet.",
      },
      {
        type: "highlight",
        text: "Den dyraste tiden att ladda är 17:00–20:00. Laddar du i stället 02:00–06:00 betalar du ofta mindre än hälften per kilowattimme – utan att ändra något annat i vardagen.",
      },
      { type: "heading", text: "När är elen billigast att ladda elbilen?", level: 2 },
      {
        type: "paragraph",
        text: "Det korta svaret är natten. Elpriset sätts varje timme på elbörsen Nord Pool och följer ett ganska stabilt dygnsmönster: när färre använder el är den billigare. Eftersom de flesta sover mellan 02:00 och 06:00, och industrin samtidigt går på sparlåga, brukar priset ligga som lägst just där.",
      },
      {
        type: "list",
        items: [
          "02:00–06:00: Billigast. Låg förbrukning och ofta mycket vindkraft i nätet.",
          "11:00–14:00: En andra lågperiod mitt på dagen, särskilt sommartid när solcellerna levererar.",
          "17:00–20:00: Dyrast. Alla är hemma, lagar mat och laddar samtidigt.",
          "21:00–01:00: Priset sjunker successivt när folk går och lägger sig.",
        ],
      },
      { type: "heading", text: "Vilka timmar är billigast på natten?", level: 2 },
      {
        type: "paragraph",
        text: "Mönstret ovan gäller en genomsnittlig dag, men den exakta billigaste timmen skiftar från dygn till dygn beroende på väder, vind och elpriserna i Europa. Det enda sättet att veta säkert är att titta på morgondagens priskurva.",
      },
      {
        type: "paragraph",
        text: "En bra tumregel är att leta efter den billigaste två- eller tretimmarsperioden på natten. En elbil laddar ofta fullt på 6–10 timmar i en vanlig laddbox, så du behöver sällan pricka in en enda timme – det räcker att starta laddningen när priset börjar sjunka.",
      },
      {
        type: "link",
        href: "/prognos",
        label: "Se 24h-prognos för elpriset i ditt elområde →",
      },
      { type: "heading", text: "Hur mycket sparar du på nattladdning?", level: 2 },
      {
        type: "paragraph",
        text: "Prisskillnaden mellan natt och kväll är ofta 30–70 öre per kilowattimme. Med ett 60 kWh-batteri blir skillnaden snabbt märkbar. Här är ett räkneexempel baserat på en prisskillnad på 50 öre/kWh:",
      },
      {
        type: "list",
        items: [
          "Liten elbil (40 kWh): sparar cirka 20 kronor per laddning.",
          "Mellanstor elbil (60 kWh): sparar cirka 30 kronor per laddning.",
          "Större elbil (80 kWh): sparar cirka 40 kronor per laddning.",
        ],
      },
      {
        type: "paragraph",
        text: "Laddar du två gånger i veckan innebär det ungefär 1 500–4 000 kronor per år. Observera att detta är en uppskattning – den faktiska besparingen beror på dagens elpris och hur mycket du laddar.",
      },
      {
        type: "link",
        href: "/guide/billigaste-timmen/",
        label: "Läs: billigaste timmen för tvätt och disk →",
      },
      { type: "heading", text: "Så schemalägger du laddningen", level: 2 },
      {
        type: "paragraph",
        text: "Du behöver inte sitta uppe till klockan två. Det finns flera sätt att automatisera nattladdningen:",
      },
      {
        type: "list",
        items: [
          "Bilens egen app: De flesta elbilar låter dig ställa in en starttid, eller ett fönster när bilen får ladda.",
          "Laddbox med timstyrning: Många moderna laddboxar kan schemaläggas eller kopplas till elpriset automatiskt.",
          "Smarta uttag och hemassistenter: Ett smart uttag eller en plattform som Home Assistant kan starta laddningen när priset sjunker under en viss nivå.",
        ],
      },
      {
        type: "paragraph",
        text: "Om du har ett timprisavtal (spotpris) är det först då schemaläggningen verkligen lönar sig. Med fastpris spelar tiden ingen roll för priset.",
      },
      { type: "heading", text: "Vad kostar det att ladda elbilen hemma?", level: 2 },
      {
        type: "paragraph",
        text: "Hemmaladdning räknas i öre per kilowattimme. Du betalar elhandelspriset plus elnätsavgift och skatt, och priset varierar med ditt elområde:",
      },
      {
        type: "list",
        items: [
          "SE1 och SE2 (norra Sverige): lägst elpris, ofta 30–60 öre/kWh nattetid.",
          "SE3 (Stockholm med omnejd): högre förbrukning, något högre priser.",
          "SE4 (södra Sverige): högst priser, mest känsligt för europeiska elpriser.",
        ],
      },
      {
        type: "paragraph",
        text: "Priserna ovan är riktmärken och exkluderar moms och påslag. För exakt vad det kostar just nu i ditt område, se PrognosEL:s timpriser.",
      },
      {
        type: "highlight",
        text: "I vinter, betala inte mer för elen än nödvändigt. Se gratis vilka timmar som är billigast ikväll – och planera laddningen därefter.",
      },
      {
        type: "link",
        href: "/elpriser",
        label: "Se aktuella elpriser per timme →",
      },
    ],
    faq: [
      {
        q: "När på dygnet är det billigast att ladda elbilen?",
        a: "Vanligtvis mellan 02:00 och 06:00 på natten. Då är elförbrukningen lägst och priset ofta 50–70% lägre än under kvällsrusningen 17:00–20:00. Den exakta billigaste timmen varierar dag för dag, så kolla morgondagens priskurva i PrognosEL.",
      },
      {
        q: "Måste jag ha ett timprisavtal för att spara?",
        a: "Ja. Med timprisavtal (spotprisavtal) betalar du olika pris varje timme, så nattladdning blir billigare. Med ett fastprisavtal kostar elen lika mycket oavsett tid på dygnet, och schemalagd laddning påverkar då inte priset.",
      },
      {
        q: "Hur mycket kan jag spara på att ladda på natten?",
        a: "Baserat på en prisskillnad på 50 öre/kWh sparar du cirka 20–40 kronor per laddning beroende på batteristorlek. Laddar du två gånger i veckan blir det ungefär 1 500–4 000 kronor per år.",
      },
      {
        q: "Hur schemalägger jag laddningen?",
        a: "Använd bilens egen app, laddboxens timstyrning eller ett smart uttag. Sätt laddningen att starta under den billigaste perioden på natten, ofta 02:00–06:00.",
      },
      {
        q: "Är det alltid billigast på natten?",
        a: "Nästan alltid, men inte undantagslöst. Vid mycket vind kan priset vara lågt även på dagen, och vid kallt väder kan natten bli dyrare än normalt. Kontrollera alltid morgondagens prognos innan du planerar.",
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
