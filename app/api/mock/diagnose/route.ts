export async function POST() {
  return Response.json({
    disease: "Powdery Mildew",
    severity: 72,
    confidence: {
      "Powdery Mildew": 0.72,
      Rust: 0.18,
      "Leaf Spot": 0.10
    },
    description:
      "Powdery mildew is a fungal infection causing white powdery spots on leaves.",
    treatment: [
      "Apply sulfur fungicide",
      "Avoid overhead watering",
      "Increase airflow"
    ],
    prevention: [
      "Use resistant varieties",
      "Maintain proper spacing",
      "Reduce humidity"
    ]
  });
}
