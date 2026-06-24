import { resetDemoData } from "@/lib/demo-seed";

resetDemoData()
  .then(() => {
    console.log("TrustPay AI demo data seeded.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
