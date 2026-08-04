/* ============================================================================
 *  SITE CONFIGURATION FILE
 *  Edit your website name, logo, tagline, genres, and games here.
 * ============================================================================ */

const SITE = {
  name: "GC Biology",
  tagline: "Study With the GC",
  logo: "https://cdn.jsdelivr.net/gh/FunkyTimmy/GrouapChat-Biology@main/images/Gc%20Biology%20Logo.png",
  favicon: "https://cdn.jsdelivr.net/gh/FunkyTimmy/GrouapChat-Biology@main/images/Gc%20Biology%20Logo.png",
  titleSuffix: " - GC Biology" // Shows after game name in title (e.g. Minecraft 1.12.2 - GC Biology
};

const GENRES = [
  "Arcade",
  "Puzzle",
  "Strategy",
  "Action",
  "Adventure",
  "Racing",
];

const GAMES = [
  // COOKIE CLICKER
  {
    id: "cookieclicker",
    name: "Cookie Clicker",
    description: "Click the cookie to get more cookies and the cycle repeats.",
    genre: "Arcade",
    thumbnail: "/images/cookieclicker.jpg",
    fileUrl: "/games/cookieclicker.html",
    popular: false,
  },
  
  // MINECRAFT 1.12.2
  {
    id: "minecraft12",
    name: "Minecraft 1.12.2",
    description: "Eaglercraft 1.12.2. As similar to Minecraft 1.12.2 as possible. Join xenaMC on multiplayer!",
    genre: "Arcade",
    thumbnail: "/images/wp8691241-minecraft-thumbnail-wallpapers.jpg",
    fileUrl: "/games/minecraft1-12-2.html",
    popular: true,
  },
  
  // ESCAPE ROAD
  {
    id: "escaperoad",
    name: "Escape Road",
    description: "You just robbed a bank and you have to run away from the police. Your wanted level gets higher every minute. How long can you survive?",
    genre: "Arcade",
    thumbnail: "https://cdn.jsdelivr.net/gh/FunkyTimmy/little-timmy-codepen@main/EscapeRoad.png",
    fileUrl: "/games/escaperoad.html",
    popular: false,
  },
  
  // GEOMETRY DASH LITE
  {
    id: "gdlite",
    name: "Geometry Dash Lite",
    description: "Jump over obstacles while continuously moving to the beat.",
    genre: "Arcade",
    thumbnail: "/images/gdlite.jpg",
    fileUrl: "/games/gdlite.html",
    popular: false,
  },
];
