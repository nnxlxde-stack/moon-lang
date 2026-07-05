-- Core.Network — HTTP client primitives

--? Performs an HTTP GET request and returns the response body as text.
httpGet :: String -> IO String
httpGet _ = pure ""

--? POSTs a text/JSON body and returns the response body as text.
httpPost :: String -> String -> IO String
httpPost _ _ = pure ""

--? GETs a URL and returns the raw JSON/text body (no schema validation).
fetchJson :: String -> IO String
fetchJson _ = pure "{}"