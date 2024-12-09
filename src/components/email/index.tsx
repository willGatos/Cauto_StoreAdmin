export default async function handleEmail(
  template,
  email = "suxcesagency@gmail.com",
  orderId = null,
  client = null,
  seller = null
) {
  try {
    const response = await fetch(
      "https://6jzlpghplfcqc5vrri6qbqhi6u0unxmi.lambda-url.us-east-1.on.aws/",
      {
        method: "POST",
        body: JSON.stringify({
          email: email,
          template: template,
          orderId,
          client,
          seller,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
}
