import { ContactCta } from "@/shared/sections/ContactCta";
import { Trust } from "@/shared/sections/Trust";
import { Engineering } from "./components/Engineering";
import { Hero } from "./components/Hero";
import { Intro } from "./components/Intro";
import { OrganizationJsonLd } from "./components/OrganizationJsonLd";
import { Process } from "./components/Process";
import { Traders } from "./components/Traders";

export function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <Hero />
      <Intro />
      <Engineering />
      <Process />
      <Trust />
      <Traders />
      <ContactCta />
    </>
  );
}
