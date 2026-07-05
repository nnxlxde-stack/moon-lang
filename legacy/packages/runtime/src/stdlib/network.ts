export interface HttpResponse {
  status: number;
  body: string;
  headers: Record<string, string>;
}

export async function httpGet(url: string, headers: Record<string, string> = {}): Promise<HttpResponse> {
  const res = await fetch(url, { method: "GET", headers });
  const body = await res.text();
  const out: Record<string, string> = {};
  res.headers.forEach((value, key) => { out[key] = value; });
  return { status: res.status, body, headers: out };
}

export async function httpPost(
  url: string,
  body: string,
  headers: Record<string, string> = {},
): Promise<HttpResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
  const text = await res.text();
  const out: Record<string, string> = {};
  res.headers.forEach((value, key) => { out[key] = value; });
  return { status: res.status, body: text, headers: out };
}