import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public struct HttpResponse: Sendable {
    public var status: Int
    public var body: String
    public var headers: [String: String]

    public init(status: Int, body: String, headers: [String: String] = [:]) {
        self.status = status
        self.body = body
        self.headers = headers
    }
}

public enum StdlibNetwork {
    public static func httpGet(
        _ url: String,
        headers: [String: String] = [:],
        session: URLSession = .shared
    ) async throws -> HttpResponse {
        guard let requestURL = URL(string: url) else {
            throw RuntimeError("Invalid URL: \(url)")
        }
        var request = URLRequest(url: requestURL)
        request.httpMethod = "GET"
        for (key, value) in headers {
            request.setValue(value, forHTTPHeaderField: key)
        }
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw RuntimeError("Non-HTTP response from \(url)")
        }
        var outHeaders: [String: String] = [:]
        for (key, value) in http.allHeaderFields {
            if let key = key as? String, let value = value as? String {
                outHeaders[key] = value
            }
        }
        let body = String(data: data, encoding: .utf8) ?? ""
        return HttpResponse(status: http.statusCode, body: body, headers: outHeaders)
    }

    public static func httpPost(
        _ url: String,
        body: String,
        headers: [String: String] = [:],
        session: URLSession = .shared
    ) async throws -> HttpResponse {
        guard let requestURL = URL(string: url) else {
            throw RuntimeError("Invalid URL: \(url)")
        }
        var request = URLRequest(url: requestURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        for (key, value) in headers {
            request.setValue(value, forHTTPHeaderField: key)
        }
        request.httpBody = body.data(using: .utf8)
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw RuntimeError("Non-HTTP response from \(url)")
        }
        var outHeaders: [String: String] = [:]
        for (key, value) in http.allHeaderFields {
            if let key = key as? String, let value = value as? String {
                outHeaders[key] = value
            }
        }
        let text = String(data: data, encoding: .utf8) ?? ""
        return HttpResponse(status: http.statusCode, body: text, headers: outHeaders)
    }
}