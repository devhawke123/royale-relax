/**
 * Seed script: populates description, basePrice, isNew, hasStorage, hasDrawer,
 * and size/price ProductVariant rows for all beds, sourced verbatim from the
 * Royale Relax Product Catalog PDF supplied by the PM (images and price
 * tables excluded — prices live in ProductVariant, images are ignored per
 * the PM's instruction).
 *
 * Matching strategy: looks up each Product by name (case-insensitive,
 * trimmed) within category = 'BEDS'. DB rows with no catalog match
 * (e.g. "Montrose Bed") are left untouched.
 *
 * Run with: npx tsx prisma/seed-bed-catalog-details.ts
 */

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const SIZES = ["4' Small Double", "4'6 Double", "5' King", "6' Super King"] as const

type BedEntry = {
  prices: [number, number, number, number]
  description: string
  hasStorage: boolean
  hasDrawer: boolean
  isNew: boolean
}

const CATALOG_DATA: Record<string, BedEntry> = {
  'Versailles Bed': {
    prices: [500, 550, 600, 650],
    description: `Step into refined living with the all-new 2026 Versailles where timeless design meets modern practicality. Expertly handcrafted in Yorkshire, this bed is more than just a piece of furniture; it's a statement of sophistication and smart living.

Premium Features:

Yorkshire Craftsmanship: Lovingly handcrafted by skilled artisans, the Versailles Bed reflects true quality and attention to detail, designed to stand the test of time.

Sturdy Timber Frame: Built on a solid timber structure, it offers unmatched support, durability, and a stable foundation for peaceful rest.

1-Year Manufacturer's Guarantee: Backed by a full 1 year warranty, giving you confidence in both the design and construction.

Striking Trim Options: Choose between a polished Chrome or Gold trim to accentuate the bed's contemporary lines.

Vertical Hand-Pleated Upholstery: The beautifully detailed vertical cuts and plush upholstery create a rich, tailored finish.

12-Inch Deep Padded Rails & Footboard: Thick, padded sides and footboard not only elevate comfort but add a seamless, luxurious feel.

Custom Headboard & Footboard Heights: Personalize your bed to your space and style with flexible height options.

Bespoke Colours & Fabrics: With a wide selection of finishes available, the Versailles Bed can be tailored to match your exact décor vision.

Ottoman Storage Option Available: Hidden beneath the mattress lies a spacious ottoman compartment the perfect solution for clutter-free living.

Why Choose Versailles?
With its blend of elegance, practicality, and custom features, the Versailles Bed is the perfect centrepiece for any modern bedroom. Treat yourself to everyday luxury where smart storage meets iconic style.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: true,
  },
  'Grand Regent Bed': {
    prices: [550, 620, 680, 770],
    description: `Elevate Your Bedroom with the Sophisticated Grand Regent Bed

Introducing the Grand Regent Bed — where elegant design meets smart storage. With its refined look and built-in practicality, this bed offers a stylish solution for those who value both form and function.

The deep, plush upholstery and generously padded 18-inch side rails and footboard provide an exceptional level of comfort, while also adding a luxurious statement to your bedroom décor. Whether placed in a master bedroom or guest suite, this bed brings instant charm.

Imagine effortlessly lifting the ottoman with its silky-smooth gas mechanism, revealing a hidden treasure trove of storage space below—your ultimate secret weapon for stashing away cozy bedding, seasonal outfits, or those must-have daily items, all while banishing clutter from your sanctuary. (Optional ottoman storage available for that extra touch of convenience!)

Premium Features:

- British Craftsmanship: Carefully handcrafted in Yorkshire by skilled makers to ensure top-quality finish and detail.

- Robust Timber Structure: Built with a solid wood frame to deliver lasting strength and stability.

- 1-Year Warranty: Your purchase is protected with a full manufacturer's guarantee.

- Premium Upholstery: Features luxury hand-pleated fabric that adds elegance and texture.

- Customisable Options: Choose from an extensive palette of colours and materials to suit your interior.

- Integrated Ottoman Storage Option Available: Make the most of your space with under-bed storage that's both hidden and accessible.

The Grand Regent Bed isn't just another bed frame — it's a refined centerpiece that blends convenience and comfort effortlessly. With smart storage and timeless design, it turns your room into a clutter-free retreat.

Upgrade your sleep space with the Grand regent bed today — where luxury lives in every detail.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: false,
  },
  'Kensington Bed': {
    prices: [500, 550, 600, 650],
    description: `Step into refined comfort with the Kensington Bed — a flawless fusion of modern flair and enduring craftsmanship. This elegantly designed bed showcases sleek vertical padding, beautifully accented with your choice of Gold or Chrome trim along the headboard and footboard. Crafted from a strong, thick timber frame, the Kensington Bed is built to offer long-term comfort and lasting style.

Premier Features:

- Expert Craftsmanship from Yorkshire: Carefully handmade to exceptional standards by skilled artisans.

- Elegant Trim Finishes: Customise your look with either a polished Chrome or luxurious Gold trim.

- Peace of Mind: Comes with a full 1-year manufacturer's guarantee for lasting confidence.

- Padded Head & Footboard: Vertical upholstery delivers both comfort and sophistication.

- Custom Colour & Fabric Options: Choose from a wide palette of colours and textures to suit your décor.

- Ottoman Storage Option Available: Lift-up base reveals ample hidden storage to help keep your room clutter-free.

Upgrade your bedroom with the Kensington bed where bold design meets everyday practicality. It's not just a bed, it's a statement of style and smart living.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: false,
  },
  'Heritage Elite Bed': {
    prices: [400, 450, 500, 550],
    description: `Introducing the Heritage Elite Bed – New for 2026 A perfect fusion of contemporary style and comfort, the Heritage Elite Bed features striking vertical padded wings that give it a bold, modern edge.

Kindly note: If you select the slatted ottoman storage option, legs will not be fitted. Divan ottoman storage options will include glides instead.

Premium Features:

- Crafted in Yorkshire: Expertly handmade by skilled craftsmen for superior quality.

- Durable Timber Frame: Built using strong solid wood for stability and long-term use.

- 1-Year Warranty: Backed by a manufacturer's guarantee for your peace of mind.

- Elegant Padded Headboard: Offers both comfort and a luxurious look.

- Customisable Style: Choose from a broad selection of fabrics and colours to match your décor.

- Ottoman Storage Option available: Under-bed storage available to help you maximise your space.

The Heritage Elite Bed is ideal for those looking to combine practical storage with eye-catching design. A stylish and smart addition to any modern bedroom.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: true,
  },
  'Grand Royale Bed': {
    prices: [500, 550, 610, 680],
    description: `Elevate your bedroom with the Grand Royale Bed 2026 Edition, renowned for its luxurious design, exceptional upholstery, and masterful craftsmanship.

Comes with Black Plush Velvet piping as standard. Piping can be customised to Cream or Grey upon request.

Premium Features:

- Expertly Handcrafted in Yorkshire: Built by skilled craftsmen for lasting quality and timeless appeal.

- Durable Solid Timber Frame: Offers strong support and long-term durability, making it a reliable centrepiece.

- 1-Year Manufacturer's Warranty: Backed with confidence for 1 year to assure quality and peace of mind.

- Elegant Hand-Pleated Finish: The rich upholstery adds texture and class to any bedroom setting.

- Custom Colour & Fabric Choices: A wide palette of fabric and colour options lets you personalise your bed to suit your decor.

- Ottoman Storage Option Available: Integrated lift-up base provides spacious under-bed storage to keep your room clutter-free.

Why Choose the Grand Royale Bed?

Transform your sleep experience with a bed that's more than just furniture—it's a statement of elegance and comfort. Handcrafted in Yorkshire from premium materials, it promises unmatched durability and style that stands the test of time. With customizable options, a generous warranty, and the added convenience of optional ottoman storage, it's the perfect investment for a clutter-free, personalized sanctuary that enhances your daily rest and rejuvenation. Don't settle for ordinary; indulge in the luxury you deserve!`,
    hasStorage: true,
    hasDrawer: false,
    isNew: true,
  },
  'Velvet Dawn Bed': {
    prices: [420, 470, 520, 590],
    description: `Experience the perfect blend of elegance and practicality with the all-new 2025 Velvet Dawn Bed. Renowned for its superior upholstery and detailed craftsmanship, this design is a top choice for those who appreciate refined comfort.

The headboard and footboard borders come in Soft Plush Black as standard. If you'd like a different colour, just let us know after placing your order.

Premium Features:

- Handcrafted in Yorkshire: Made with care and expertise by local artisans, offering unmatched quality.

- Strong Timber Framework: Constructed with a durable solid wood frame to ensure lasting support and stability.

- 1-Year Warranty Included: Backed by a manufacturer's guarantee for added confidence in your purchase.

- Elegant Hand-Pleated Finish: Beautifully pleated upholstery brings a luxurious and refined touch to your space.

- Custom Colour & Fabric Options: Choose from a wide selection of fabrics and shades to suit your interior design.

- Built-In Ottoman Storage available: Offers generous hidden storage under the bed, ideal for maintaining a clutter-free room.

Why Choose the Velvet Dawn Bed?

Dive into a world of sophisticated comfort where every detail is designed to elevate your rest. Handcrafted in Yorkshire from high-quality materials, this bed delivers enduring strength, style, and personalization options that make it uniquely yours. With a reassuring 1-year warranty, elegant pleating, and the practicality of optional built-in ottoman storage, it's an effortless way to create a serene, organized bedroom oasis. Invest in the Velvet Dawn for nights of blissful sleep.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: false,
  },
  'Majestic Bed': {
    prices: [550, 600, 650, 710],
    description: `Elevate your bedroom with the timeless sophistication of the Majestic Bed — a modern statement piece designed to bring refined luxury into your home. Proudly handcrafted in Yorkshire, this exquisite bed seamlessly combines contemporary elegance with enduring quality.

Featuring bold 18-inch padded side panels and beautifully hand-pleated upholstery, the Majestic Bed commands attention as a striking centrepiece. Beneath its luxurious exterior lies a robust solid-wood frame, expertly engineered to provide lasting strength and stability for years to come.

Discreetly concealed beneath the mattress is an optional spacious ottoman storage compartment, offering an elegant solution for storing bedding, linens, and everyday essentials — keeping your bedroom effortlessly organised and clutter-free.

Premium Features:

- Expert Yorkshire Craftsmanship: Handcrafted in the UK with exceptional attention to detail.

- Solid Wooden Frame: Built from durable timber for superior strength and support.

- Luxury Upholstery: Finely hand-pleated fabric for a refined, timeless aesthetic.

- Optional Ottoman Storage: Generous hidden storage for practical yet elegant living.

Why You will Love It!
The Majestic Bed embodies the perfect balance of luxury, beauty, and functionality. Its sophisticated detailing and thoughtful design make it an exceptional choice for those seeking to enhance their bedroom with both style and practicality.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: false,
  },
  'Celestia Bed': {
    prices: [500, 550, 600, 650],
    description: `Elevate your bedroom with the sophisticated Celestia Bed, where modern elegance meets practical design.

Showcasing clean vertical lines and finished with your choice of sleek Chrome or luxurious Gold trim on both headboard and footboard, this bed is crafted to impress. Its solid timber frame ensures reliable support, while the optional integrated ottoman storage allows you to maximise space without compromising on style.

Premium Details:

- Skilfully Made in Yorkshire: Built by expert craftsmen with a focus on quality and attention to detail.

- Trim Finishes Available: Add a modern touch with either Gold or Chrome detailing to suit your décor.

- 1-Year Warranty: Comes with a full manufacturer's guarantee for added peace of mind.

- Vertically Padded Headboard & Footboard: Deep padding provides both comfort and a bold design statement.

- Custom Fabric & Colour Options: Available in a variety of fabrics and shades to match your personal style.

- Smart Ottoman Storage Option Available: Lift-up base reveals generous under-bed storage, perfect for keeping your room clutter-free.

Why Choose the Celestia Bed?

Step into a realm of contemporary luxury that seamlessly blends striking design with everyday functionality. Handcrafted in Yorkshire from robust materials, the Celestia promises lasting durability, personalized elegance with your choice of gold or chrome accents, and the clever option of spacious ottoman storage to banish clutter for good. It's more than a bed—it's a stylish sanctuary that supports better rest and transforms your space.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: false,
  },
  'Harrington Bed': {
    prices: [390, 430, 470, 510],
    description: `Elevate your bedroom with the refined elegance of the Hartington Bed. Blending contemporary design with timeless appeal, it creates a striking centrepiece for both modern and classic interiors.

Featuring a clean, linear profile and an upholstered headboard, this piece delivers a sleek, contemporary look with comfortable support for reading or relaxation. Expertly crafted from premium materials, the sturdy frame ensures lasting durability, enhanced by luxurious upholstery available in a range of fabrics and colours.

Designed for both style and comfort, the Hartington Bed provides restful support and an inviting space to unwind in effortless luxury.

Premium Features

- Yorkshire Craftsmanship: Expertly crafted frame offering strength, stability, and durability.

- Luxury Design: Upholstered in high-quality fabrics for a smooth, luxurious finish

- Custom Fabric & Colour Options: Customisable in a curated range of contemporary fabrics and colours.

- Modern Sleek Design: Versatile design suited to both modern and classic interiors. Clean, linear design with a refined modern aesthetic.

- 1-Year Warranty: Backed by a full manufacturer's guarantee for complete peace of mind.

Why Choose the Harrington Bed?

Discover the ultimate fusion of modern sophistication and everyday comfort in a bed that's built to last and designed to delight. Handcrafted in Yorkshire with a robust frame and sumptuous upholstery, it offers customizable fabrics and colors to seamlessly integrate into any decor, whether sleek contemporary or timeless classic. Embrace the luxury of superior craftsmanship and effortless elegance—because your rest deserves a masterpiece that enhances every moment of unwind!`,
    hasStorage: false,
    hasDrawer: false,
    isNew: false,
  },
  'Savoy Imperial Bed': {
    prices: [450, 500, 575, 625],
    description: `Introducing the 2026 Savoy Bed – where elegance meets practicality. Crafted with exceptional care and attention to detail, this bestselling design is renowned for its sophisticated upholstery and masterful construction. Designed to elevate your space, the Savoy Imperial Bed offers both luxury and everyday functionality.

Premium Features:

- Handmade in Yorkshire: Crafted by skilled artisans, each bed reflects timeless craftsmanship and enduring quality.

- Robust Timber Frame: Built on a strong, solid timber structure to ensure reliable support and long-lasting durability.

- 1-Year Manufacturer's Guarantee: Enjoy enhanced assurance with our 1 year warranty, highlighting the product's superior craftsmanship.

- Refined Upholstery: Deep, hand-pleated upholstery offers a rich texture and a luxurious visual statement.

- Bespoke Colours & Fabrics: Tailor your bed with an extensive palette of fabrics and shades to perfectly suit your décor.

- Optional Ottoman Storage: Hidden under-bed storage makes tidying up effortless, ideal for bedding, clothing, or everyday items.

Why You will Love This Bed!
Experience the perfect fusion of timeless elegance, customizable luxury, and practical storage that transforms your bedroom into a sanctuary of comfort and style.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: true,
  },
  'Verona Bed': {
    prices: [500, 550, 600, 650],
    description: `Elevate your bedroom with the Verona 2026 Bed— a statement piece where sophistication meets smart design. Part of our newest luxury collection, the Verona Bed exudes timeless elegance with its grand presence and expert craftsmanship, all while offering exceptional practicality through its built-in ottoman storage.

Design Details:
The headboard stands at a striking 44 inches high, with elegant extended wings measuring 14 inches on each side — perfect for creating a dramatic focal point in any bedroom.

Premium Features:

- Handcrafted in Yorkshire: Meticulously made by experienced artisans, ensuring top-tier quality and longevity.

- Sturdy Timber Frame: A solid wooden structure offers reliable support and lasting durability.

- 1-Year Manufacturer's Guarantee: Enjoy added reassurance with a full 1 year warranty on your purchase.

- Elegant Hand-Pleated Upholstery: The luxury detailing adds texture and depth, bringing a refined charm to your space.

- Custom Colours & Fabrics: Choose from a broad selection of shades and fabrics to suit your individual style.

Optional Ottoman Storage available: Lift-up storage provides ample hidden space for bedding, clothing, and more.

Why Choose the Verona Bed?

The Verona Bed is an expression of refined living, created for those who demand exceptional design, comfort, and craftsmanship. Its striking 44-inch high headboard with elegant extended wings creates a bold, sophisticated statement, while the sturdy timber frame ensures lasting comfort and support. Finished with exquisite hand-pleated upholstery and the option of discreet ottoman storage, the Verona Bed blends indulgent luxury with intelligent functionality.

Verona is more than a bed, it's an investment in elevated comfort and timeless sophistication!`,
    hasStorage: true,
    hasDrawer: false,
    isNew: true,
  },
  'Balmoral Bed': {
    prices: [350, 400, 450, 500],
    description: `Introducing Balmoral Bed — where timeless elegance meets everyday comfort. Thoughtfully handcrafted in Yorkshire, this beautifully upholstered bed frame is built on a solid timber foundation, offering both refined aesthetics and lasting durability. With its plush deep-cut design and optional ottoman storage, the Balmoral Bed is more than just furniture — it's a statement of elevated living.

Premium Features:

- Artisan Craftsmanship: Expertly handmade in Yorkshire, reflecting meticulous attention to detail and high-quality finish.

- Sturdy Timber Construction: A thick, solid timber frame ensures strength and long-term support.

- Peace of Mind: Backed by a 1-year manufacturer's guarantee for assured confidence in your purchase.

- Luxurious Upholstery: Deep-cut detailing adds texture and sophistication, enhancing any bedroom interior.

- Tailored to You: Choose from a wide selection of premium colours and fabrics to complement your personal style.

- Smart Storage Solution: Optional ottoman storage offers ample space to keep your bedroom clutter-free and organised.

Why Choose The Balmoral Bed?

Indulge in the epitome of ultra-luxury with the Balmoral Bed, where every element is meticulously engineered for unparalleled sophistication and comfort. Handcrafted by master artisans in Yorkshire using the finest sustainable timber and sumptuous fabrics, it exudes an air of opulent refinement that elevates your bedroom to a bespoke haven.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: false,
  },
  'Royale Signature Bed': {
    prices: [480, 545, 615, 700],
    description: `Unveil the elegance of the New 2026 Royale Signature Bed — where sophisticated design meets everyday functionality. A customer favourite, this stunning bed features beautifully hand-pleated upholstery and impeccable craftsmanship that adds a luxurious touch to any bedroom. The standard 30" headboard height can be tailored to 24" upon request — simply leave a note at checkout.

Please note: This bed is not compatible with solid divan ottoman storage.

Premium Features:

- Crafted in Yorkshire: Handmade by expert artisans, ensuring exceptional quality and attention to detail.

- Durable Timber Frame: Constructed from solid timber for unmatched strength and long-term support.

- 1-Year Manufacturer's Guarantee: Confidence in quality, with a comprehensive 1-year warranty for peace of mind.`,
    hasStorage: false,
    hasDrawer: false,
    isNew: true,
  },
  'Elan Bed': {
    prices: [440, 480, 520, 580],
    description: `The Pinnacle of Refined Rest.

Understated. Unrivaled. Unforgettable. The Èlan V Lined Bed reimagines the sleep experience through a lens of sophisticated minimalism and superior craftsmanship.

The defining V-shaped detailing provides a sophisticated play of light and shadow across the headboard. This bespoke craftsmanship lends a textured, multidimensional character to your space, ensuring the Èlan remains an icon of timeless style, regardless of evolving trends.

Premium Features

- Uncompromising Integrity: Beyond its aesthetic allure, the Èlan is engineered with premium-grade materials, ensuring a foundation of silent, enduring stability.

- Plush Hand-Pleated Upholstery: The deeply pleated fabric adds an opulent texture, infusing your room with richness and warmth.

- Discreet Optional Ottoman Storage: The Optional Ottoman Storage provides generous hidden storage, keeping your space effortlessly neat and elegantly organized.

- Bespoke Headboard Heights: Tailor your bed with three headboard height options, creating a presence that perfectly suits your space and style.

- Manufacturer's Assurance: Revel in serenity with our comprehensive 1-year manufacturer's warranty.

Why It Stands Out

Luxury is found in the ability to adapt. The Èlan Bed serves as a seamless canvas for your personal style. Designed to be the heartbeat of your most private space, this bed invites a seamless transition from the curated beauty of your home to the deep restoration of a luxury night's rest, elevating every layer of your bedding to a statement of style.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: false,
  },
  'Ellington Bed': {
    prices: [430, 480, 530, 580],
    description: `Discover exquisite elegance and effortless luxury with our 2026 icon, the Ellington Bed. This opulent masterpiece blends the sumptuous allure of premium boucle fabric with unparalleled craftsmanship, delivering a subtly profound aesthetic that ensures serene slumber and flawless tranquility in your private sanctuary.

Picture yourself enveloped in the soft, inviting hug of our luxurious boucle fabric, where every thread whispers elegance and comfort, wrapping you in a cocoon of refined bliss as you drift into peaceful sleep on the Ellington Bed.

Premium Features:

- Premiere for 2026: The Ellington Bed emerges as a pinnacle of desirability.

- Artisanal Mastery: Exquisitely crafted with unwavering precision, evoking an enduring aura of grace and tactile elegance.

- Statement Headboard: The headboard, soaring to 44 inches, commands admiration in any refined setting

- Premium Timber Structure: Reinforced with premium timber for supreme durability.

- Manufacturer's Assurance: Revel in serenity with our comprehensive 1-year manufacturer's warranty.

- Bespoke Selections: Select from lavish palettes and materials to echo your exquisite vision.

- Optional Ottoman Storage: An intuitive undercarriage haven for serene, uncluttered living.

Why it's unique!

The Ellington Bed adorned in lavish boucle and equipped with clever storage, this creation reimagines refinement and utility.

Its sturdy wooden frame ensures it endures as the centerpiece of your private sanctuary for generations.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: true,
  },
  'Eminence Bed': {
    prices: [540, 600, 670, 730],
    description: `Indulge in the absolute epitome of bedtime luxury. The Èminence Bed is a masterpiece of uncompromising craft, fusing timeless grandeur with high-tier ingenuity. Tailored for those who demand the finest in life, it transforms your bedroom into a sanctuary of unrivaled prestige and serene, expensive comfort. The Pinnacle of Rest.

The 60-inch standard headboard creates a bold, architectural presence, elevating the room with quiet authority. Standard at 60 inches, it can be increased or reduced to suit your preference.

Premium Features:

- Timeless Beauty: Impeccably sculpted with flowing, architectural curves and adorned with exquisitely refined finishes, the Èminence Bed radiates an enduring elegance, commanding presence, and effortless grandeur—harmonizing flawlessly with both modern masterpieces and classic interiors.

- Personalized Colors & Fabrics: Select from a wide array of luxurious fabrics and shades to perfectly match your unique taste.

- Hidden Optional Ottoman Storage: Effortlessly lift the base to access spacious, hidden storage, keeping your room tidy and serene.

- Superior Build Quality: Made from premium materials with a strong, durable frame for lasting comfort and support.

- 1-Year Manufacturer's Guarantee: Backed by our promise of quality, giving you total peace of mind.

Why the Èminence Bed!

The Èminence Bed is chosen by those who accept nothing less than perfection. It is a harmonious union of commanding design, indulgent comfort, and discreet innovation, crafted to transform the bedroom into a private retreat of rare sophistication. Its presence alone elevates the atmosphere, while its thoughtfully integrated storage preserves effortless elegance and serenity.

Every moment spent upon the Èminence Bed is an immersion in quiet luxury. It does not simply support rest; it enhances your lifestyle, reflecting discernment, success, and an unwavering appreciation for the exceptional. The Èminence Bed is not a purchase—it is an affirmation of refined living.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: false,
  },
  'Kendal Divan Bed': {
    prices: [350, 400, 450, 490],
    description: `Immerse yourself in timeless elegance and refined comfort with the Kendal Divan Storage Bed — a masterpiece that harmonises luxurious design with everyday functionality. Thoughtfully curated for those who value both aesthetics and practicality, this exquisite centrepiece elevates your bedroom into a sanctuary of style and serenity.

From its beautifully upholstered frame to its tailored storage solutions, every detail of the Kendal Bed speaks of sophisticated craftsmanship. The divan base glides effortlessly on chrome-finished castors, combining ease of use with contemporary flair.

Premium Features:

- Chrome Glider Divan Base: A sturdy yet sleek base fitted with smooth chrome gliders for effortless movement and a refined finish.

- Headboard to Suit Your Style: The 54″ floor-standing elevates the space with a striking, bold presence.

- Custom Colours & Fabrics: Tailor your bed to match your personal taste with an extensive palette of luxurious fabrics and finishes.

- Optional Storage Drawers: Discreet yet spacious under-bed drawers offer an ideal solution for keeping essentials neatly tucked away.

- 12-Month Guarantee: Your peace of mind is ensured with a 12-month manufacturer's warranty.

Why it's unique!

This bed isn't just furniture — it's a lifestyle statement. One that offers comfort, beauty, and smart storage in equal measure. Experience the epitome of luxury living with the Kendal Divan Storage Bed.`,
    hasStorage: false,
    hasDrawer: true,
    isNew: false,
  },
  'Regent Bed': {
    prices: [485, 540, 610, 690],
    description: `Beyond standard. Welcome to the 2026 Regent Bed.

The Pinnacle of Refined Rest. Designed with discreet elegance and impeccably crafted. The Regent Bed redefines luxury. Delivers a level of comfort that is quietly extraordinary. Every detail is considered, every material selected with intention—creating a serene, restorative experience and lasting renewal—one you will crave every night. Personalized with your choice of refined gold or silver trim.

The 60-inch standard headboard creates a bold, architectural presence, elevating the room with quiet authority. Standard at 60 inches, it can be increased or reduced to suit your preference.

Exquisite Features:

- Timeless Beauty: Impeccably sculpted with flowing, architectural curves and adorned with exquisitely refined finishes, the Regent Bed radiates an enduring elegance, commanding presence, and effortless grandeur—harmonizing flawlessly with both modern masterpieces and classic interiors.

- Personalized Colors & Fabrics: Select from a wide array of luxurious fabrics and shades to perfectly match your unique taste.

- Hidden Optional Ottoman Storage: Effortlessly lift the base to access spacious, hidden storage, keeping your room tidy and serene.

- Superior Build Quality: Made from premium materials with a strong, durable frame for lasting comfort and support.

- 1-Year Manufacturer's Guarantee: Backed by our promise of quality, giving you total peace of mind.

Why Choose The Regent Bed?

Stop dreaming about luxury. Wake up enveloped in it with the Regent Bed—exquisite handcrafted opulence, a majestic design that orchestrates every awakening into a masterpiece of refined splendor.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: true,
  },
  'Valencia Wing Bed': {
    prices: [470, 520, 580, 640],
    description: `Step into refined elegance with the Valencia Wing Bed where timeless design meets luxurious practicality. This best-selling masterpiece is a true statement of sophistication, beautifully adorned with hand-sewn upholstery and graceful winged sides that exude grandeur. Designed to elevate any bedroom, the Valencia Wing Bed offers both form and function in perfect harmony.

Premium Features:

- Masterfully Handcrafted in Yorkshire: Crafted by skilled artisans, each bed reflects meticulous attention to detail and a commitment to premium British craftsmanship.

- Robust Solid Timber Frame: Engineered for strength and longevity, the sturdy timber frame ensures unwavering support and enduring comfort.

- Plush Hand-Pleated Upholstery: The deeply pleated fabric adds an opulent texture, infusing your room with richness and warmth.

- Discreet Optional Ottoman Storage: The Optional Ottoman Storage provides generous hidden storage, keeping your space effortlessly neat and elegantly organized.

- Bespoke Headboard Heights: Tailor your bed with three headboard height options, creating a presence that perfectly suits your space and style.

Why It Stands Out:

The Valencia Wing Bed transcends mere furniture, emerging as an opulent sanctuary of unparalleled indulgence. Its majestic silhouette, masterful artisanal embellishments converge to create a masterpiece for the discerning connoisseur of refined sophistication. Elevate your private domain to realms of imperial splendor, where every slumber becomes a symphony of lavish serenity.`,
    hasStorage: true,
    hasDrawer: false,
    isNew: false,
  },
  'Luxe Divan Bed': {
    prices: [350, 400, 450, 490],
    description: `Introducing Luxe Divan Bed — where timeless style meets everyday practicality. Designed with versatility at its core, this elegant divan bed is the ideal foundation for a sophisticated, clutter-free bedroom, offering both aesthetic charm and smart functionality.

Premium Features:

- Chrome Glider Divan Base: A sturdy yet sleek base fitted with smooth chrome gliders for effortless movement and a refined finish.

- Headboard to Suit Your Style: The 54″ floor-standing elevates the space with a striking, bold presence.

- Custom Colours & Fabrics: Tailor your bed to match your personal taste with an extensive palette of luxurious fabrics and finishes.

- Optional Storage Drawers: Discreet yet spacious under-bed drawers offer an ideal solution for keeping essentials neatly tucked away.

- 12-Month Guarantee: Your peace of mind is ensured with a 12-month manufacturer's warranty.

Why Choose Luxe Divan Bed?

It's more than just a bed — it's a foundation for your dream bedroom, offering premium comfort, smart storage, and tailored elegance in one complete package.

Upgrade your sleep space with this exceptional divan collection — where style meets substance, and comfort is never compromised.`,
    hasStorage: false,
    hasDrawer: true,
    isNew: false,
  },
  'Madison Divan Bed': {
    prices: [370, 410, 460, 510],
    description: `Redefine your sleep space with the Madison Divan Storage Bed a masterful fusion of elegance, comfort, and practicality. Meticulously handcrafted, this bed delivers timeless sophistication while offering unbeatable functionality,

Premium Features:

- Divan Base with Chrome Gliders: A sleek, sturdy base fitted with modern chrome gliders ensures stability and smooth movement, adding a touch of elegance to any room.

- Headboard to Suit Your Style: The 54″ floor-standing elevates the space with a striking, bold presence.

- Tailored to You: Customise your Madison Divan Bed in a wide selection of premium fabrics and colours to match your bedroom's décor effortlessly.

- Functional Storage: Opt for discreet under-bed drawers—perfect for stowing away essentials while maintaining a tidy, serene environment.

- 12-Month Guarantee: Rest assured with a full year of manufacturer's protection, ensuring quality and peace of mind.

Why Choose Madison Divan Bed?

With its sleek profile, customisable features, and clever storage options, the Madison Divan Storage Bed is more than just a place to sleep—it's a lifestyle upgrade. Experience the perfect blend of style and substance today.`,
    hasStorage: false,
    hasDrawer: true,
    isNew: false,
  },
}

// DB has a typo'd product name for this bed ("Harington" missing an 'r').
const NAME_ALIASES: Record<string, string> = {
  'harington bed': 'Harrington Bed',
}

async function main() {
  const beds = await prisma.product.findMany({ where: { category: 'BEDS' } })

  const matchedDbNames = new Set<string>()

  for (const bed of beds) {
    const dbNameLower = bed.name.trim().toLowerCase()
    const aliasedName = NAME_ALIASES[dbNameLower]
    const key = Object.keys(CATALOG_DATA).find(
      (name) => name.toLowerCase() === (aliasedName ?? bed.name.trim()).toLowerCase()
    )

    if (!key) continue

    matchedDbNames.add(dbNameLower)
    const entry = CATALOG_DATA[key]

    await prisma.product.update({
      where: { id: bed.id },
      data: {
        description: entry.description,
        basePrice: entry.prices[0],
        hasStorage: entry.hasStorage,
        hasDrawer: entry.hasDrawer,
        isNew: entry.isNew,
      },
    })

    for (let i = 0; i < SIZES.length; i++) {
      await prisma.productVariant.upsert({
        where: { productId_size: { productId: bed.id, size: SIZES[i] } },
        update: { price: entry.prices[i] },
        create: { productId: bed.id, size: SIZES[i], price: entry.prices[i] },
      })
    }

    console.log(`Updated: ${bed.name}`)
  }

  const unmatchedCatalog = Object.keys(CATALOG_DATA).filter((n) => {
    const lower = n.toLowerCase()
    const dbAlias = Object.entries(NAME_ALIASES).find(([, v]) => v.toLowerCase() === lower)?.[0]
    return !matchedDbNames.has(lower) && !(dbAlias && matchedDbNames.has(dbAlias))
  })
  if (unmatchedCatalog.length) {
    console.warn('Catalog entries with NO matching DB product:', unmatchedCatalog)
  }

  const unmatchedDb = beds
    .filter((b) => !matchedDbNames.has(b.name.trim().toLowerCase()))
    .map((b) => b.name)
  if (unmatchedDb.length) {
    console.warn('DB beds with NO catalog match (not touched):', unmatchedDb)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
