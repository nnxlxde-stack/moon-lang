#if os(Windows)
import Foundation
import WinSDK

enum WinClipboard {
    static func readText() -> String? {
        guard IsClipboardFormatAvailable(UINT(CF_UNICODETEXT)) else { return nil }
        guard OpenClipboard(nil) else { return nil }
        defer { CloseClipboard() }

        guard let handle = GetClipboardData(UINT(CF_UNICODETEXT)) else { return nil }
        guard let locked = GlobalLock(handle) else { return nil }
        defer { GlobalUnlock(handle) }

        return String(decodingCString: locked.assumingMemoryBound(to: WCHAR.self), as: UTF16.self)
    }
}
#endif