export async function withMinDelay(promise, minMs = 500) {
  const delay = new Promise((resolve) => setTimeout(resolve, minMs));
  const [result] = await Promise.all([promise, delay]);
  return result;
}