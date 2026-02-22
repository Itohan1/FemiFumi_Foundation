import { DonationContent } from "../lib/api";

export const BRAND_LOGO = "/brand/image1.jpg";
export const KIDS_OUTREACH = "/images/Pictures-with-Kids.jpeg";
export const WHO_WE_SUPPORT_IMAGE =
  "/images/close-up-smiley-african-girls-outdoors.jpg";
export const VISION_IMPACT_IMAGE = "/images/our-picture.jpeg";
export const TESTIMONIAL_FALLBACK_IMAGE = "/images/our-picture.jpeg";

export const DID_YOU_KNOW_LINES = [
  "FemiFunmi Charity Registered under the Corporate Affairs Commission of the Federal Republic of Nigeria under the Company and Allied Matters Act of 1990 with Registered Number 154899.",
  "Founded by Mr. and Mrs. Olufemi and Olufunmi Oguntoyinbo in Ikeja, the capital city of Lagos and the commercial city of Nigeria.",
  "This organization was established to reach out to the less privileged in society.",
  "We are a charitable organization that provides humanitarian services to people in society, especially in Sub-Saharan Africa where poverty is at its peak.",
  "Our mission is to encourage people to help people, and to ensure everyone experiences the giving process.",
  "We advocate for community well-being by partnering with organizations and individuals that provide food, education, social services, medical care, and general care to people and homes that need help.",
  "We are passionate about helping the poor, the needy, the destitute, the jobless, and people with disabilities who may need financial assistance or other support.",
] as const;

export const MISSION_STATEMENTS = [
  {
    title: "Relief of Poverty",
    description:
      "Providing direct support, emergency relief, and sustainable help for vulnerable families.",
  },
  {
    title: "Promotion of Good Health",
    description:
      "Supporting access to medical care, health education, and wellness outreach in communities.",
  },
  {
    title: "Providing Shelter",
    description:
      "Helping people in need with safe accommodation support and housing intervention programs.",
  },
  {
    title: "Giving Education",
    description:
      "Creating learning opportunities through school support, materials, and educational sponsorship.",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Adesola Akinwale",
    position: "Community Outreach Lead",
    image: "/images/black-businesswoman-smiling.jpg",
    quote:
      "Femi & Funmi Charity has consistently shown up for families in need and made support feel personal and dignified.",
  },
  {
    name: "David Okoro",
    position: "Corporate Volunteer Partner",
    image: "/images/medium-shot-man-working-as-lawyer.jpg",
    quote:
      "Working with this team has been transparent, impactful, and deeply rewarding for everyone involved in our volunteer group.",
  },
  {
    name: "Nkechi Eze",
    position: "Program Beneficiary",
    image: "/images/african-american-business-woman-by-window.jpg",
    quote:
      "Their help came at the right time and gave my family hope, stability, and the confidence to move forward.",
  },
  {
    name: "Tosin Adeyemi",
    position: "Education Support Coordinator",
    image: "/images/african-american-business-man-suit.jpg",
    quote:
      "The foundation's commitment to education and health outreach is practical, consistent, and truly community-centered.",
  },
  {
    name: "Kemi Balogun",
    position: "Youth Development Mentor",
    image: "/images/businesswoman-executive-professional-success-concept.jpg",
    quote:
      "From mentorship to basic support, this organization keeps proving that real change starts with consistent care.",
  },
] as const;

export const FEATURED_VOICES = [
  {
    id: "voice-1",
    name: "Amina",
    role: "Program Beneficiary",
    script:
      "The food support program helped my children return to school stronger and more hopeful.",
  },
  {
    id: "voice-2",
    name: "Samuel",
    role: "Volunteer",
    script:
      "I saw families receive help directly, and the outreach team handled every case with care.",
  },
  {
    id: "voice-3",
    name: "Grace",
    role: "Nurse Partner",
    script:
      "Medical assistance from this charity reached patients who had no other immediate option.",
  },
  {
    id: "voice-4",
    name: "Tunde",
    role: "Youth Mentor",
    script:
      "Education support changed attendance and confidence for many young people in our area.",
  },
  {
    id: "voice-5",
    name: "Ngozi",
    role: "Community Lead",
    script:
      "This partnership brings consistent help, not one-time promises, and our community feels it.",
  },
] as const;

export type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  dateIso: string;
  location: string;
  imageUrl: string;
  priorityplacement?: boolean;
};

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: "event-1",
    title: "Back-to-School Community Drive",
    description:
      "The foundation will support school-age children with educational kits, mentorship sessions, and parent engagement support.",
    dateIso: "2026-03-28T10:00:00+01:00",
    location: "Ikeja, Lagos",
    imageUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    priorityplacement: false
  },
  {
    id: "event-2",
    title: "Free Community Health Outreach",
    description:
      "Our medical outreach provides preventive checks, basic treatment guidance, and referrals for further care.",
    dateIso: "2026-04-19T09:30:00+01:00",
    location: "Agege, Lagos",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    priorityplacement: false
  },
  {
    id: "event-3",
    title: "Food Support and Family Relief Day",
    description:
      "This event focuses on nutritious food distribution, family assessment, and follow-up support for households in need.",
    dateIso: "2026-05-11T08:00:00+01:00",
    location: "Ojodu, Lagos",
    imageUrl:
      "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=1200&q=80",
    priorityplacement: false
  },
];

export const DEFAULT_DONATION_CONTENT: DonationContent = {
  introText:
    "A description of the person in need is posted here with pictures or videos of the person or group of persons.",
  missionText:
    "Save a life today by donating towards this mission, and surely you will be richly blessed.",
  paymentHeading: "Make Payment Here",
  paymentDescription:
    "Online payment platform and affiliated banks for direct deposits and bank transfer can be made here.",
  onlinePlatformLabel: "Donate Securely Online",
  onlinePlatformUrl: "https://www.femifunmicharity.org",
  bankTransferDetails: [
    "FEMIFUNMI CHARITY ORGANISATION - Zenith Bank - 1234567890",
    "FEMIFUNMI CHARITY ORGANISATION - GTBank - 0123456789",
  ],
};
