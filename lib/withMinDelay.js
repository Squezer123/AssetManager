export async function withMinDelay(promise, minMs = 1000) {
  const delay = new Promise((resolve) => setTimeout(resolve, minMs));
  const [result] = await Promise.all([promise, delay]);
  return result;
}