import LyovAnimation from "@/components/LyovAnimation";
import HealthPromise from "@/components/HealthPromise";
import EcoCommitment from "@/components/EcoCommitment";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <LyovAnimation />
        <HealthPromise />
        <EcoCommitment />
      </main>
      <Footer />
    </>
  );
}
