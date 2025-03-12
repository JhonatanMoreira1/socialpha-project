export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Tempo limite excedido')), ms)
  );
  return Promise.race([promise, timeout]);
}
