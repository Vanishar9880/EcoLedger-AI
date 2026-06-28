import { useLedger } from "../context/LedgerContext";

function Recommendations() {
  const { ledger } = useLedger();

  const categoryMap = {};

  ledger.forEach((item) => {
    categoryMap[item.category] =
      (categoryMap[item.category] || 0) + item.co2;
  });

  const highestCategory =
    Object.keys(categoryMap).length > 0
      ? Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  const getRecommendation = () => {
    switch (highestCategory) {
      case "Facility Energy":
        return {
          title: "Energy Optimization",
          text: "Office electricity is your largest emission source. Consider renewable energy adoption, smart lighting systems and energy-efficient equipment.",
        };

      case "Business Travel":
        return {
          title: "Travel Reduction Strategy",
          text: "Business travel contributes significantly to emissions. Promote virtual meetings and optimize travel planning.",
        };

      case "Logistics":
        return {
          title: "Logistics Optimization",
          text: "Freight transportation is driving emissions. Explore route optimization, load consolidation and EV freight alternatives.",
        };

      default:
        return {
          title: "Awaiting Data",
          text: "Add more operational records to generate AI sustainability insights.",
        };
    }
  };

  const recommendation = getRecommendation();

  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <p className="text-green-600 font-semibold mb-2">
        AI Sustainability Recommendation
      </p>

      <h2 className="text-2xl font-bold text-slate-950 mb-3">
        {recommendation.title}
      </h2>

      <p className="text-slate-600">
        {recommendation.text}
      </p>
    </div>
  );
}

export default Recommendations;