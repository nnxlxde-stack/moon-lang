export async function runLsp(): Promise<number> {
  const { startLspServer } = await import("@moon/lsp");
  await startLspServer();
  return 0;
}