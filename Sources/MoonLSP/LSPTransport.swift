import Foundation

enum LSPTransport {
    static func readMessage(from handle: FileHandle = .standardInput) -> [String: Any]? {
        var contentLength: Int?
        while let lineData = readLine(handle), let line = String(data: lineData, encoding: .utf8) {
            if line.isEmpty { break }
            let lower = line.lowercased()
            if lower.hasPrefix("content-length:") {
                let value = line.split(separator: ":", maxSplits: 1).last?
                    .trimmingCharacters(in: .whitespaces)
                contentLength = Int(value ?? "")
            }
        }
        guard let length = contentLength, length > 0 else { return nil }

        var data = Data()
        while data.count < length {
            let chunk = handle.readData(ofLength: length - data.count)
            if chunk.isEmpty { break }
            data.append(chunk)
        }
        guard data.count == length else { return nil }
        return (try? JSONSerialization.jsonObject(with: data)) as? [String: Any]
    }

    static func writeMessage(_ object: [String: Any], to handle: FileHandle = .standardOutput) {
        guard let data = try? JSONSerialization.data(withJSONObject: object),
              let json = String(data: data, encoding: .utf8) else { return }
        let header = "Content-Length: \(json.utf8.count)\r\n\r\n"
        if let headerData = header.data(using: .utf8) {
            handle.write(headerData)
        }
        if let body = json.data(using: .utf8) {
            handle.write(body)
        }
    }

    private static func readLine(_ handle: FileHandle) -> Data? {
        var data = Data()
        while true {
            let chunk = handle.readData(ofLength: 1)
            if chunk.isEmpty { return data.isEmpty ? nil : data }
            data.append(chunk)
            if chunk == Data([0x0A]) {
                if data.count >= 2, data[data.count - 2] == 0x0D {
                    data.removeLast(2)
                } else {
                    data.removeLast()
                }
                return data
            }
        }
    }
}